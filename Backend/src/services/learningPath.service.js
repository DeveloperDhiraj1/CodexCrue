const LearningPath = require('../models/LearningPath');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Goal = require('../models/Goal');
const Profile = require('../models/Profile');
const { topologicalSortCourses, buildMilestones, courseId, prerequisiteIds, estimateDuration } = require('./learningPathPlanner.service');
const { ensureFreePublicCourses } = require('./publicCourseCatalog.service');
const { discoverYouTubeCourses } = require('./youtubeDiscovery.service');
const { isYouTubeShort } = require('./youtubePolicy.service');

const TARGET_SKILLS = {
  'full stack developer': ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
  'ai engineer': ['Python', 'Machine Learning', 'Pandas', 'FastAPI', 'PyTorch'],
  'data scientist': ['Python', 'Statistics', 'SQL', 'Scikit-Learn', 'Pandas'],
  'java backend developer': ['Java', 'Spring Boot', 'REST API', 'SQL', 'Docker', 'Microservices']
};

function textTokens(value) {
  return new Set(String(value || '').toLowerCase().match(/[a-z0-9]+/g) || []);
}

function relevanceScore(course, profile, requiredSkills) {
  const goalTokens = new Set([
    ...textTokens(profile.learningGoal),
    ...textTokens(profile.careerGoal),
    ...textTokens(profile.learningComment),
    ...(profile.interests || []).flatMap((interest) => [...textTokens(interest)])
  ]);
  const courseTokens = new Set([
    ...textTokens(course.title),
    ...textTokens(course.description),
    ...textTokens(course.category),
    ...(course.skills || []).flatMap((skill) => [...textTokens(skill)])
  ]);
  const goalMatches = [...goalTokens].filter((token) => courseTokens.has(token)).length;
  const skillMatches = (course.skills || []).filter((skill) => requiredSkills.has(String(skill).toLowerCase())).length;
  const preferredLanguage = String(profile.preferredLanguage || 'en');
  const languageBoost = course.language === preferredLanguage ? 8 : (preferredLanguage !== 'en' && course.language === 'en' ? 2 : 0);
  return skillMatches * 10 + goalMatches + languageBoost + Number(course.rating || 0) / 10;
}

function selectGoalCourses(allCourses, profile, completedCourseIds, llmRecommendations = []) {
  const requiredSkills = new Set((TARGET_SKILLS[String(profile.learningGoal || '').toLowerCase()] || []).map((skill) => skill.toLowerCase()));
  const completed = new Set(completedCourseIds.map(String));
  const llmScores = new Map(llmRecommendations.map((item) => [String(item.courseId), Number(item.score) || 0]));
  const rankedMatches = allCourses
    .filter((course) => !completed.has(courseId(course)) && !isYouTubeShort(course))
    .map((course) => ({ course, score: relevanceScore(course, profile, requiredSkills) + (llmScores.get(courseId(course)) || 0) * 25 }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || courseId(left.course).localeCompare(courseId(right.course)));
  const selected = [];
  const seenProviders = new Set();
  const seenTypes = new Set();
  for (const match of rankedMatches) {
    const provider = String(match.course.provider || 'public').toLowerCase();
    const type = String(match.course.contentType || 'course');
    if (selected.length < 12 && (!seenProviders.has(provider) || !seenTypes.has(type))) {
      selected.push(match.course); seenProviders.add(provider); seenTypes.add(type);
    }
  }
  rankedMatches.forEach(({ course }) => { if (selected.length < 20 && !selected.some((item) => courseId(item) === courseId(course))) selected.push(course); });
  const ranked = selected;
  return { ranked, requiredSkills };
}

function expandPrerequisites(selectedCourses, byId) {
  const expanded = new Map(selectedCourses.map((course) => [courseId(course), course]));
  const visit = (course) => {
    for (const prerequisiteId of prerequisiteIds(course)) {
      const prerequisite = byId.get(prerequisiteId);
      if (!prerequisite) throw Object.assign(new Error(`Course prerequisite ${prerequisiteId} is unavailable.`), { statusCode: 400 });
      if (!expanded.has(prerequisiteId)) {
        expanded.set(prerequisiteId, prerequisite);
        visit(prerequisite);
      }
    }
  };
  [...expanded.values()].forEach(visit);
  return [...expanded.values()];
}

function calculateOverallProgress(courses, progressByCourse, completedCourseIds) {
  const completed = new Set(completedCourseIds.map(String));
  if (courses.length === 0) return 0;
  const total = courses.reduce((sum, course) => sum + (completed.has(courseId(course)) ? 100 : Number(progressByCourse[courseId(course)]?.completionPercentage || 0)), 0);
  return Math.round(total / courses.length);
}

class LearningPathService {
  async getPathByUserId(userId) {
    const path = await LearningPath.findOne({ userId }).populate('milestones.courses');
    if (path && path.milestones?.length && path.milestones.some((milestone) => !milestone.activities?.length)) {
      const profile = await Profile.findOne({ userId });
      if (profile) return this.generateAndSavePath(userId, profile);
    }
    return path;
  }

  async generateAndSavePath(userId, profile) {
    await ensureFreePublicCourses();
    // External discovery is enrichment only; it must never block roadmap creation.
    void discoverYouTubeCourses(profile).catch((error) => console.warn(`[Roadmap enrichment] ${error.message}`));
    const [allCourses, progressRecords] = await Promise.all([
      Course.find({ status: 'published', isFree: true }).select('title description provider sourceUrl isFree skills category difficulty tags rating duration prerequisites resources language contentType').populate('prerequisites', 'title description provider sourceUrl isFree skills category difficulty tags rating duration prerequisites resources language contentType').lean(),
      Progress.find({ userId }).select('courseId status completionPercentage').lean()
    ]);
    const progressByCourse = Object.fromEntries(progressRecords.map((record) => [String(record.courseId), record]));
    const completedCourseIds = [
      ...(profile.completedCourses || []).map(courseId),
      ...progressRecords.filter((record) => record.status === 'completed').map((record) => String(record.courseId))
    ];
    const uniqueCompleted = [...new Set(completedCourseIds)];
    // The deterministic selector is the guaranteed fast path. The dashboard recommendation
    // endpoint can use the LLM enrichment without making roadmap creation depend on it.
    const { ranked } = selectGoalCourses(allCourses, profile, uniqueCompleted);
    if (ranked.length === 0) {
      const fallback = allCourses
        .filter((course) => !uniqueCompleted.includes(courseId(course)) && !isYouTubeShort(course))
        .sort((left, right) => Number(left.difficulty === profile.experienceLevel) - Number(right.difficulty === profile.experienceLevel));
      if (fallback.length === 0) throw Object.assign(new Error('You have completed all available free public courses.'), { statusCode: 404 });
      ranked.push(...fallback.slice(0, 8));
    }

    const byId = new Map(allCourses.map((course) => [courseId(course), course]));
    // Older/imported catalog records can retain a prerequisite that is no longer
    // published. Remove only those dangling references so one bad record cannot
    // prevent the learner from receiving a roadmap.
    allCourses.forEach((course) => {
      course.prerequisites = (course.prerequisites || []).filter((prerequisite) => byId.has(courseId(prerequisite)));
    });
    const selectedWithPrerequisites = expandPrerequisites(ranked, byId);
    let orderedCourses;
    try {
      orderedCourses = topologicalSortCourses(selectedWithPrerequisites);
    } catch (error) {
      // A legacy/imported catalog may contain a prerequisite cycle even though
      // new course writes reject cycles. Keep roadmap generation usable and let
      // the relevance rank determine the safe fallback order.
      if (error.statusCode !== 400 || !String(error.message).toLowerCase().includes('cyclic')) throw error;
      console.warn('[Learning path] Legacy prerequisite cycle detected; using relevance order.');
      orderedCourses = selectedWithPrerequisites.map((course) => ({ ...course, prerequisites: [] }));
    }
    const availableHoursPerDay = Number(profile.availableHoursPerDay || 2);
    const milestones = buildMilestones(orderedCourses, progressByCourse, uniqueCompleted, availableHoursPerDay);
    const overallProgress = calculateOverallProgress(orderedCourses, progressByCourse, uniqueCompleted);
    const goal = await Goal.findOne({ userId }).select('weeklyLearningHours title status').lean();

    const path = await LearningPath.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          goal: profile.learningGoal,
          estimatedDuration: estimateDuration(orderedCourses, availableHoursPerDay),
          milestones,
          overallProgress,
          status: overallProgress >= 100 ? 'completed' : goal?.status === 'paused' ? 'paused' : 'active'
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('milestones.courses');

    if (goal) await Goal.updateOne({ userId }, { $set: { progress: overallProgress } });
    return path;
  }
}

module.exports = new LearningPathService();
module.exports.selectGoalCourses = selectGoalCourses;
module.exports.expandPrerequisites = expandPrerequisites;
module.exports.calculateOverallProgress = calculateOverallProgress;
