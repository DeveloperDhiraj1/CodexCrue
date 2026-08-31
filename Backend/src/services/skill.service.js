const Skill = require('../models/Skill');

function normalize(data) {
  const normalized = {};
  for (const field of ['name', 'category', 'description', 'prerequisites']) {
    if (data[field] !== undefined) normalized[field] = data[field];
  }
  if (normalized.name !== undefined) normalized.name = String(normalized.name).trim();
  if (normalized.category !== undefined) normalized.category = String(normalized.category).trim();
  if (normalized.description !== undefined) normalized.description = String(normalized.description).trim();
  if (normalized.prerequisites) normalized.prerequisites = [...new Set(normalized.prerequisites.map(String))];
  return normalized;
}

async function assertPrerequisitesExist(prerequisites = []) {
  const ids = [...new Set(prerequisites.map(String))];
  if (ids.length === 0) return;
  const count = await Skill.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) throw Object.assign(new Error('One or more skill prerequisites do not exist.'), { statusCode: 400 });
}

async function assertNoCycle(skillId, prerequisites = []) {
  const nodes = await Skill.find({}, { _id: 1, prerequisites: 1 }).lean();
  const graph = new Map(nodes.map((node) => [String(node._id), node.prerequisites.map(String)]));
  if (skillId) graph.set(String(skillId), prerequisites.map(String));

  const target = String(skillId);
  const visiting = new Set();
  const visited = new Set();
  function visit(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const parent of graph.get(node) || []) if (visit(parent)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  if (skillId && visit(target)) throw Object.assign(new Error('Skill prerequisite relationships cannot contain cycles.'), { statusCode: 400 });
}

class SkillService {
  async getSkills(query = {}) {
    const filter = {};
    if (query.category) filter.category = String(query.category);
    if (query.search) filter.name = { $regex: String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    const skip = Math.max(Number(query.skip) || 0, 0);
    const [items, total] = await Promise.all([
      Skill.find(filter).sort({ name: 1 }).skip(skip).limit(limit).populate('prerequisites'),
      Skill.countDocuments(filter)
    ]);
    return { items, pagination: { total, limit, skip, hasMore: skip + items.length < total } };
  }

  async getSkillById(id) {
    const skill = await Skill.findById(id).populate('prerequisites');
    if (!skill) throw Object.assign(new Error('Skill not found'), { statusCode: 404 });
    return skill;
  }

  async createSkill(data) {
    const normalized = normalize(data);
    await assertPrerequisitesExist(normalized.prerequisites);
    const duplicate = await Skill.findOne({ name: { $regex: `^${normalized.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (duplicate) throw Object.assign(new Error('A skill with that name already exists.'), { statusCode: 409 });
    return Skill.create(normalized);
  }

  async updateSkill(id, data) {
    const normalized = normalize(data);
    if (normalized.name) {
      const duplicate = await Skill.findOne({ _id: { $ne: id }, name: { $regex: `^${normalized.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
      if (duplicate) throw Object.assign(new Error('A skill with that name already exists.'), { statusCode: 409 });
    }
    const current = await Skill.findById(id);
    if (!current) throw Object.assign(new Error('Skill not found'), { statusCode: 404 });
    const prerequisites = normalized.prerequisites || current.prerequisites.map(String);
    if (prerequisites.includes(String(id))) throw Object.assign(new Error('A skill cannot depend on itself.'), { statusCode: 400 });
    await assertPrerequisitesExist(prerequisites);
    await assertNoCycle(id, prerequisites);
    const skill = await Skill.findByIdAndUpdate(id, normalized, { new: true, runValidators: true }).populate('prerequisites');
    return skill;
  }

  async deleteSkill(id) {
    const references = await Skill.countDocuments({ prerequisites: id });
    if (references > 0) throw Object.assign(new Error('Skill is referenced as a prerequisite and cannot be deleted.'), { statusCode: 409 });
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) throw Object.assign(new Error('Skill not found'), { statusCode: 404 });
    return skill;
  }
}

module.exports = new SkillService();
