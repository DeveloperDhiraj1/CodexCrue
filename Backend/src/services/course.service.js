const Course = require('../models/Course');
const mongoose = require('mongoose');

const COURSE_FIELDS = ['title', 'description', 'instructor', 'provider', 'sourceUrl', 'isFree', 'qualityScore', 'skills', 'difficulty', 'duration', 'prerequisites', 'category', 'tags', 'resources', 'rating', 'thumbnail', 'status'];

function normalizeCourseData(data) {
  const normalized = {};
  for (const field of COURSE_FIELDS) {
    if (data[field] !== undefined) normalized[field] = data[field];
  }
  if (normalized.skills) normalized.skills = [...new Set(normalized.skills.map((skill) => String(skill).trim()).filter(Boolean))];
  if (normalized.tags) normalized.tags = [...new Set(normalized.tags.map((tag) => String(tag).trim()).filter(Boolean))];
  if (normalized.prerequisites) normalized.prerequisites = [...new Set(normalized.prerequisites.map(String))];
  return normalized;
}

function hasPrerequisiteCycle(graph, target) {
  const visiting = new Set();
  const visited = new Set();
  function visit(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const prerequisite of graph.get(node) || []) if (visit(prerequisite)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  return visit(String(target));
}

async function assertCoursePrerequisites(courseId, prerequisites = []) {
  const ids = [...new Set(prerequisites.map(String))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw Object.assign(new Error('Course prerequisites must be valid course IDs.'), { statusCode: 400 });
  }
  if (courseId && ids.includes(String(courseId))) {
    throw Object.assign(new Error('A course cannot depend on itself.'), { statusCode: 400 });
  }
  if (ids.length > 0) {
    const count = await Course.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) throw Object.assign(new Error('One or more course prerequisites do not exist.'), { statusCode: 400 });
  }
  if (!courseId) return;

  const nodes = await Course.find({}, { _id: 1, prerequisites: 1 }).lean();
  const graph = new Map(nodes.map((node) => [String(node._id), node.prerequisites.map(String)]));
  graph.set(String(courseId), ids);
  if (hasPrerequisiteCycle(graph, courseId)) {
    throw Object.assign(new Error('Course prerequisite relationships cannot contain cycles.'), { statusCode: 400 });
  }
}

class CourseService {
  async getAllCourses(query = {}, options = {}) {
    const { category, difficulty, skills, search } = query;
    const requestedStatus = options.includeDrafts && query.status ? String(query.status) : 'published';
    const filter = requestedStatus === 'all' && options.includeDrafts ? {} : { status: requestedStatus };

    if (category) filter.category = String(category);
    if (difficulty) filter.difficulty = String(difficulty);
    if (skills) {
      filter.skills = { $in: String(skills).split(',').map((skill) => skill.trim()).filter(Boolean) };
    }
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }

    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = Math.max(Number(query.skip) || 0, 0);
    const [items, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('prerequisites'),
      Course.countDocuments(filter)
    ]);
    return { items, pagination: { total, limit, skip, hasMore: skip + items.length < total } };
  }

  async getCourseById(courseId, options = {}) {
    const course = await Course.findOne({
      _id: courseId,
      ...(options.includeDrafts ? {} : { status: 'published' })
    }).populate('prerequisites');
    if (!course) {
      throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    }
    return course;
  }

  async createCourse(courseData) {
    const normalized = normalizeCourseData(courseData);
    await assertCoursePrerequisites(null, normalized.prerequisites || []);
    return await Course.create(normalized);
  }

  async updateCourse(courseId, updateData) {
    const normalized = normalizeCourseData(updateData);
    const current = await Course.findById(courseId).select('prerequisites');
    if (!current) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    await assertCoursePrerequisites(courseId, normalized.prerequisites || current.prerequisites);
    const course = await Course.findByIdAndUpdate(courseId, normalized, { new: true, runValidators: true }).populate('prerequisites');
    if (!course) {
      throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    }
    return course;
  }

  async deleteCourse(courseId) {
    const references = await Course.countDocuments({ prerequisites: courseId });
    if (references > 0) throw Object.assign(new Error('Course is referenced as a prerequisite and cannot be deleted.'), { statusCode: 409 });
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    }
    return course;
  }

  async setStatus(courseId, status) {
    if (!['published', 'draft'].includes(status)) {
      throw Object.assign(new Error('Invalid course status.'), { statusCode: 400 });
    }
    const course = await Course.findByIdAndUpdate(courseId, { $set: { status } }, { new: true, runValidators: true });
    if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
    return course;
  }
}

module.exports = new CourseService();
module.exports.normalizeCourseData = normalizeCourseData;
module.exports.hasPrerequisiteCycle = hasPrerequisiteCycle;
