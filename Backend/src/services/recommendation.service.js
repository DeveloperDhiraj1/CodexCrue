const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Feedback = require('../models/Feedback');
const Recommendation = require('../models/Recommendation');
const config = require('../config/env');
const mlRecommendationService = require('./mlRecommendation.service');
const { rankRecommendations, isPrerequisiteEligible } = require('./recommendationRanking.service');
const { ensureFreePublicCourses } = require('./publicCourseCatalog.service');
const { discoverYouTubeCourses } = require('./youtubeDiscovery.service');
const { rankWithLLM } = require('./llmRecommendation.service');
const { isYouTubeShort } = require('./youtubePolicy.service');

function getCourseId(course) {
  return String(course?._id || course);
}

function localCandidateScore(course, profile) {
  const text = `${course.title} ${course.description} ${(course.skills || []).join(' ')} ${course.category} ${course.provider}`.toLowerCase();
  const query = `${profile.learningGoal || ''} ${profile.careerGoal || ''} ${profile.learningComment || ''} ${(profile.currentSkills || []).join(' ')} ${(profile.interests || []).join(' ')}`.toLowerCase();
  const tokens = [...new Set(query.match(/[a-z0-9+#.-]+/g) || [])];
  const matches = tokens.filter((token) => text.includes(token)).length;
  const language = course.language === (profile.preferredLanguage || 'en') ? 0.18 : 0;
  const type = course.contentType === 'video' ? 0.04 : 0;
  return Math.min(1, 0.28 + matches * 0.06 + language + type);
}

function mergeCandidatePool(recommendations, candidates, profile) {
  const seen = new Set(recommendations.map((item) => String(item.courseId)));
  const expanded = [...recommendations];
  candidates.forEach((course) => {
    const id = String(course._id);
    if (!seen.has(id)) expanded.push({ courseId: id, score: localCandidateScore(course, profile), explanation: 'Added from the wider free public course catalog for a more useful mix of learning sources.' });
  });
  return expanded;
}

function diversifyRecommendations(ranked) {
  const picked = []; const remaining = [...ranked]; const providers = new Set();
  while (remaining.length && picked.length < Math.min(12, ranked.length)) {
    const index = remaining.findIndex((item) => !providers.has(String(item.courseDetails?.provider || 'public')));
    const [next] = remaining.splice(index >= 0 ? index : 0, 1);
    picked.push(next); providers.add(String(next.courseDetails?.provider || 'public'));
  }
  return picked.concat(remaining).map((item, index) => ({ ...item, rank: index + 1 }));
}

async function getFeedbackSignals(userId, courseIds) {
  const feedback = await Feedback.find({ userId, targetType: 'course', targetId: { $in: courseIds } }).select('targetId rating sentiment').lean();
  const grouped = {};
  for (const item of feedback) {
    const key = String(item.targetId);
    grouped[key] ||= { ratings: [], sentiments: [] };
    if (item.rating) grouped[key].ratings.push(item.rating);
    if (item.sentiment) grouped[key].sentiments.push(item.sentiment);
  }
  return Object.fromEntries(Object.entries(grouped).map(([key, value]) => [key, {
    averageRating: value.ratings.length ? value.ratings.reduce((sum, rating) => sum + rating, 0) / value.ratings.length : undefined,
    sentiment: value.sentiments[value.sentiments.length - 1]
  }]));
}

class RecommendationService {
  async getRecommendationsForUser(userId, profile) {
    await ensureFreePublicCourses();
    await discoverYouTubeCourses(profile);
    const profileCompletedIds = (profile.completedCourses || []).map(getCourseId);
    const progressCompleted = await Progress.find({ userId, status: 'completed' }).select('courseId').lean();
    const completedCourseIds = [...new Set([...profileCompletedIds, ...progressCompleted.map((item) => String(item.courseId))])];
    const candidates = await Course.find({
      status: 'published',
      isFree: true,
      _id: { $nin: completedCourseIds }
    }).select('title description provider sourceUrl isFree qualityScore skills category difficulty tags rating duration prerequisites language contentType').populate('prerequisites', 'title skills difficulty').limit(config.mlCandidateLimit).lean();

    const eligibleCandidates = candidates.filter((course) => !isYouTubeShort(course) && isPrerequisiteEligible(course, completedCourseIds));
    if (eligibleCandidates.length === 0) return [];

    const candidatePayload = eligibleCandidates.map((course) => ({
      courseId: String(course._id),
      title: course.title,
      description: course.description,
      skills: course.skills,
      category: course.category,
      difficulty: course.difficulty,
      language: course.language,
      contentType: course.contentType
    }));

    let result;
    try {
      result = await mlRecommendationService.recommend({
        userId: String(userId),
        goal: profile.learningGoal,
        skills: profile.currentSkills || [],
        completedCourses: completedCourseIds,
      review: `${profile.careerGoal || ''} ${profile.learningComment || ''} Preferred language: ${profile.preferredLanguage || 'en'}. Prefer a mix of video, documentation, practice and projects.`.trim(),
        availableCourses: candidatePayload
      });
    } catch (_error) {
      const queryTokens = new Set(`${profile.learningGoal || ''} ${profile.careerGoal || ''} ${(profile.currentSkills || []).join(' ')}`.toLowerCase().match(/[a-z0-9]+/g) || []);
      const fallbackRecommendations = eligibleCandidates.map((course) => {
        const text = `${course.title} ${course.description} ${(course.skills || []).join(' ')} ${course.category}`.toLowerCase();
        const matches = [...queryTokens].filter((token) => text.includes(token)).length;
        return { courseId: String(course._id), score: Math.min(1, 0.35 + matches * 0.1), explanation: 'Matched locally to your goal and skills from the free public course catalog.' };
      });
      result = { recommendations: fallbackRecommendations, modelVersion: 'local-free-catalog-v1' };
    }

    const llmRecommendations = await rankWithLLM(profile, eligibleCandidates);
    if (llmRecommendations.length) {
      result = { recommendations: [...llmRecommendations, ...result.recommendations], modelVersion: `${result.modelVersion}+learner-intent-llm` };
    }

    const feedbackByCourse = await getFeedbackSignals(userId, eligibleCandidates.map((course) => course._id));
    const ranked = diversifyRecommendations(rankRecommendations(mergeCandidatePool(result.recommendations, eligibleCandidates, profile), eligibleCandidates, profile, completedCourseIds, feedbackByCourse, config.recommendationWeights));

    if (ranked.length > 0) {
      await Recommendation.insertMany(ranked.map((recommendation) => ({
        userId,
        courseId: recommendation.courseId,
        score: recommendation.score,
        explanation: recommendation.explanation,
        rank: recommendation.rank,
        modelVersion: result.modelVersion,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })));
    }

    return ranked;
  }
}

module.exports = new RecommendationService();
module.exports.getCourseId = getCourseId;
module.exports.getFeedbackSignals = getFeedbackSignals;
