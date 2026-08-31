const config = require('../config/env');
const aiService = require('./ai.service');
const { isYouTubeShort } = require('./youtubePolicy.service');

function parseJson(text) {
  const fenced = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : String(text || '').match(/\[[\s\S]*\]/)?.[0];
  if (!candidate) return [];
  try { const value = JSON.parse(candidate); return Array.isArray(value) ? value : []; } catch (_error) { return []; }
}

async function rankWithLLM(profile, courses) {
  if (!config.aiApiUrl || !config.aiModel) return [];
  const catalog = courses.filter((course) => !isYouTubeShort(course)).slice(0, config.aiRecommendationLimit).map((course) => ({ id: String(course._id), title: course.title, provider: course.provider, description: course.description, skills: course.skills, language: course.language, contentType: course.contentType, difficulty: course.difficulty }));
  const prompt = `Act as a careful learning-path recommender. Analyze the learner goal, career intent, comment, current skills, interests, preferred language and available resources. Select the best diverse resources from the catalog. Do not invent IDs. NEVER recommend YouTube Shorts or short-form clips; YouTube resources must be substantial lessons, tutorials, playlists, or full courses. Prefer a mix of providers and content types, and prioritize the preferred language when available. Return ONLY valid JSON array with at most 12 objects in this shape: {"courseId":"catalog id","score":0.0,"explanation":"one concise reason"}. Learner: ${JSON.stringify({ learningGoal: profile.learningGoal, careerGoal: profile.careerGoal, learningComment: profile.learningComment, currentSkills: profile.currentSkills, interests: profile.interests, preferredLanguage: profile.preferredLanguage, experienceLevel: profile.experienceLevel })}. Catalog: ${JSON.stringify(catalog)}`;
  try {
    const response = await aiService.chat(prompt, profile, null, null);
    const validIds = new Set(catalog.map((item) => item.id));
    return parseJson(response).filter((item) => validIds.has(String(item.courseId))).filter((item) => !isYouTubeShort(courses.find((course) => String(course._id) === String(item.courseId)))).slice(0, 12).map((item) => ({ courseId: String(item.courseId), score: Math.max(0, Math.min(1, Number(item.score) || 0.5)), explanation: String(item.explanation || 'Selected by the learner-intent model.') }));
  } catch (_error) { return []; }
}

module.exports = { rankWithLLM, parseJson };
