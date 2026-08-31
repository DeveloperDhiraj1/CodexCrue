const LearningResource = require('../models/LearningResource');

function tokens(value) { return new Set(String(value || '').toLowerCase().match(/[a-z0-9+#.-]+/g) || []); }
function scoreResource(resource, profile) {
  const goalTokens = new Set([...tokens(profile.learningGoal), ...tokens(profile.careerGoal), ...(profile.interests || []).flatMap((item) => [...tokens(item)])]);
  const current = new Set((profile.currentSkills || []).flatMap((item) => [...tokens(item)]));
  const resourceTokens = new Set([...tokens(resource.title), ...tokens(resource.description), ...(resource.skills || []).flatMap((item) => [...tokens(item)])]);
  const goalMatches = [...goalTokens].filter((token) => resourceTokens.has(token)).length;
  const newSkillMatches = (resource.skills || []).filter((skill) => [...tokens(skill)].some((token) => !current.has(token))).length;
  const relevance = Math.min(1, goalMatches / Math.max(1, goalTokens.size * 0.25));
  const skillGrowth = Math.min(1, newSkillMatches / Math.max(1, resource.skills?.length || 1));
  const quality = Number(resource.qualityScore || 0.5);
  const score = relevance * 0.55 + skillGrowth * 0.2 + quality * 0.25;
  return { score: Math.round(score * 1000000) / 1000000, goalMatches, newSkillMatches };
}

class LearningResourceService {
  async recommendForProfile(profile, limit = 12) {
    const resources = await LearningResource.find({ status: 'published' }).sort({ qualityScore: -1, lastVerifiedAt: -1 }).limit(500).lean();
    return resources.map((resource) => ({ resource, ...scoreResource(resource, profile) })).sort((a, b) => b.score - a.score).slice(0, limit).map(({ resource, score, goalMatches, newSkillMatches }, index) => ({ ...resource, score, rank: index + 1, explanation: goalMatches ? `Matches your goal and can build ${newSkillMatches || 'new'} relevant skill${newSkillMatches === 1 ? '' : 's'}.` : 'A high-quality foundational resource for your learning path.' }));
  }

  async importResources(resources = []) {
    const operations = resources.map((resource) => ({ updateOne: { filter: { url: resource.url }, update: { $set: { ...resource, lastVerifiedAt: new Date() } }, upsert: true } }));
    if (operations.length) await LearningResource.bulkWrite(operations);
    return LearningResource.countDocuments({ status: 'published' });
  }
}

module.exports = new LearningResourceService();
