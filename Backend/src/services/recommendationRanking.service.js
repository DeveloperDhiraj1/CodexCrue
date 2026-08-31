const DEFAULT_WEIGHTS = { ml: 0.28, skill: 0.15, goal: 0.15, comment: 0.15, quality: 0.1, timeFit: 0.05, prerequisite: 0.05, preference: 0.05, feedback: 0.02, language: 0.05 };

function tokens(value) {
  return new Set(String(value || '').toLowerCase().match(/[a-z0-9]+/g) || []);
}

function overlapScore(values, targetTokens) {
  const source = [...new Set(values.flatMap((value) => [...tokens(value)]))];
  if (source.length === 0 || targetTokens.size === 0) return 0;
  return source.filter((value) => targetTokens.has(value)).length / source.length;
}

function prerequisiteIds(course) {
  return (course.prerequisites || []).map((prerequisite) => String(prerequisite?._id || prerequisite));
}

function isPrerequisiteEligible(course, completedCourseIds) {
  const completed = new Set(completedCourseIds.map(String));
  return prerequisiteIds(course).every((id) => completed.has(id));
}

function prerequisiteScore(course, completedCourseIds) {
  const ids = prerequisiteIds(course);
  if (ids.length === 0) return 1;
  const completed = new Set(completedCourseIds.map(String));
  return ids.filter((id) => completed.has(id)).length / ids.length;
}

function preferenceScore(course, profile) {
  const level = String(profile.experienceLevel || 'beginner').toLowerCase();
  const difficulty = String(course.difficulty || '').toLowerCase();
  if (level === difficulty) return 1;
  if (level === 'beginner') return difficulty === 'intermediate' ? 0.65 : 0.35;
  if (level === 'intermediate') return difficulty === 'beginner' ? 0.8 : 0.7;
  return difficulty === 'intermediate' ? 0.85 : 0.6;
}

function languageScore(course, profile) {
  const preferred = String(profile.preferredLanguage || 'en').toLowerCase();
  const actual = String(course.language || 'en').toLowerCase();
  if (actual === preferred) return 1;
  if (preferred === 'hinglish' && actual === 'hi') return 0.9;
  if (preferred === 'hi' && actual === 'hinglish') return 0.9;
  return preferred === 'en' && actual === 'en' ? 1 : 0.35;
}

function commentScore(course, profile) {
  const commentTokens = tokens(profile.learningComment);
  if (!commentTokens.size) return 0.5;
  const courseText = `${course.title || ''} ${course.description || ''} ${course.category || ''} ${(course.skills || []).join(' ')} ${(course.tags || []).join(' ')}`.toLowerCase();
  const matched = [...commentTokens].filter((token) => courseText.includes(token)).length;
  return Math.min(1, matched / Math.min(commentTokens.size, 8));
}

function qualityScore(course) {
  if (course.qualityScore !== undefined) return Math.max(0, Math.min(1, Number(course.qualityScore)));
  if (course.rating > 0) return Math.min(1, Number(course.rating) / 5);
  return String(course.provider || '').toLowerCase().includes('youtube') ? 0.75 : 0.6;
}

function durationHours(duration) {
  const value = String(duration || '').toLowerCase();
  const hours = value.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hours) return Number(hours[1]);
  const weeks = value.match(/(\d+(?:\.\d+)?)\s*week/);
  return weeks ? Number(weeks[1]) * 20 : 4;
}

function timeFitScore(course, profile) {
  const hoursPerDay = Number(profile.availableHoursPerDay || 0);
  if (hoursPerDay <= 0) return 0.35;
  return Math.min(1, Math.max(0.2, (hoursPerDay * 7 * 4) / Math.max(1, durationHours(course.duration))));
}

function matchingLabels(course, goalTokens) {
  return (course.skills || [])
    .filter((skill) => [...tokens(skill)].some((token) => goalTokens.has(token)))
    .slice(0, 3);
}

function buildExplanation(course, signals, goalTokens, feedback) {
  const reasons = [];
  const matchedSkills = matchingLabels(course, goalTokens);
  if (matchedSkills.length) reasons.push(`matches ${matchedSkills.join(', ')}`);
  if (signals.preference >= 0.8) reasons.push(`fits your ${String(course.difficulty || '').toLowerCase()} level`);
  if (signals.comment >= 0.7) reasons.push('matches the focus in your learning comment');
  if (signals.quality >= 0.85) reasons.push('comes from a high-quality public source');
  if (signals.language >= 0.9) reasons.push(`is available in your preferred ${String(course.language || 'English').toLowerCase()} language`);
  if (course.contentType === 'video') reasons.push('includes a video lesson');
  if (course.contentType === 'documentation') reasons.push('includes official documentation');
  if (course.contentType === 'practice') reasons.push('includes hands-on practice');
  if (signals.timeFit >= 0.8) reasons.push('fits your available learning time');
  if (signals.prerequisite === 1 && prerequisiteIds(course).length) reasons.push('all prerequisites are complete');
  if (feedback?.sentiment === 'relevant') reasons.push('your previous feedback marked similar learning as relevant');
  if (feedback?.sentiment === 'not_relevant') reasons.push('adjusted away from your previous low-relevance feedback');
  if (feedback?.sentiment === 'too_easy') reasons.push('you marked this course as too easy, so its rank is adjusted');
  if (feedback?.sentiment === 'too_difficult') reasons.push('you marked this course as too difficult, so its rank is adjusted');
  return reasons.length ? `Recommended because it ${reasons.join('; ')}.` : 'Recommended from the course-content and learner-goal match.';
}

function feedbackScore(feedback = {}) {
  const rating = feedback.averageRating == null ? 0.5 : Math.max(0, Math.min(1, feedback.averageRating / 5));
  const sentiment = feedback.sentiment;
  if (sentiment === 'not_relevant') return rating * 0.25;
  if (sentiment === 'relevant') return Math.max(rating, 0.8);
  if (sentiment === 'too_easy' || sentiment === 'too_difficult') return rating * 0.6;
  return rating;
}

function rankRecommendations(mlRecommendations, courses, profile, completedCourseIds, feedbackByCourse = {}, weights = DEFAULT_WEIGHTS) {
  const courseMap = new Map(courses.map((course) => [String(course._id), course]));
  const goalTokens = new Set([
    ...tokens(profile.learningGoal),
    ...tokens(profile.careerGoal),
    ...tokens(profile.learningComment),
    ...(profile.interests || []).flatMap((interest) => [...tokens(interest)])
  ]);
  const normalizedWeights = Object.fromEntries(Object.entries({ ...DEFAULT_WEIGHTS, ...weights }).map(([key, value]) => [key, Number(value) || 0]));
  const totalWeight = Object.values(normalizedWeights).reduce((sum, value) => sum + value, 0) || 1;

  return mlRecommendations
    .map((mlRecommendation) => {
      const course = courseMap.get(String(mlRecommendation.courseId));
      if (!course || !isPrerequisiteEligible(course, completedCourseIds)) return null;
      const skillScore = overlapScore(course.skills || [], goalTokens);
      const goalScore = overlapScore([course.title, course.description, course.category, ...(course.tags || [])], goalTokens);
      const prerequisite = prerequisiteScore(course, completedCourseIds);
      const preference = preferenceScore(course, profile);
      const feedback = feedbackScore(feedbackByCourse[String(course._id)]);
      const comment = commentScore(course, profile);
      const quality = qualityScore(course);
      const timeFit = timeFitScore(course, profile);
      const language = languageScore(course, profile);
      const signals = { ml: Number(mlRecommendation.score), skill: skillScore, goal: goalScore, comment, quality, timeFit, prerequisite, preference, feedback, language };
      const score = Object.entries(normalizedWeights).reduce((sum, [key, weight]) => sum + (signals[key] || 0) * weight, 0) / totalWeight;
      return {
        courseId: String(course._id),
        courseDetails: course,
        score: Math.round(score * 1000000) / 1000000,
        mlScore: Number(mlRecommendation.score),
        rankingSignals: signals,
        explanation: buildExplanation(course, signals, goalTokens, feedbackByCourse[String(course._id)])
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.courseId.localeCompare(right.courseId))
    .map((recommendation, index) => ({ ...recommendation, rank: index + 1 }));
}

module.exports = { rankRecommendations, isPrerequisiteEligible, prerequisiteScore, feedbackScore, DEFAULT_WEIGHTS };
