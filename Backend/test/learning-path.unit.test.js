process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  topologicalSortCourses,
  buildMilestones,
  estimateDuration
} = require('../src/services/learningPathPlanner.service');
const { selectGoalCourses, calculateOverallProgress } = require('../src/services/learningPath.service');
const LearningPath = require('../src/models/LearningPath');

const foundation = { _id: 'foundation', title: 'Python Foundations', description: 'Python basics', skills: ['Python'], difficulty: 'Beginner', duration: '7 hours', prerequisites: [] };
const machineLearning = { _id: 'ml', title: 'Machine Learning', description: 'Machine learning with Python', skills: ['Machine Learning'], difficulty: 'Intermediate', duration: '2 weeks', prerequisites: [{ _id: 'foundation' }] };
const courses = [machineLearning, foundation];

test('topological planner places prerequisites before dependent courses', () => {
  const ordered = topologicalSortCourses(courses);
  assert.deepEqual(ordered.map((course) => course._id), ['foundation', 'ml']);
});

test('topological planner rejects cyclic course graphs', () => {
  assert.throws(() => topologicalSortCourses([
    { _id: 'a', title: 'A', prerequisites: [{ _id: 'b' }] },
    { _id: 'b', title: 'B', prerequisites: [{ _id: 'a' }] }
  ]), /cyclic/);
});

test('milestones derive completion and lock later phases', () => {
  const milestones = buildMilestones([foundation, machineLearning], {
    foundation: { completionPercentage: 100 },
    ml: { completionPercentage: 0 }
  }, ['foundation'], 2, 1);
  assert.equal(milestones[0].status, 'completed');
  assert.equal(milestones[0].progress, 100);
  assert.equal(milestones[1].status, 'in_progress');
  assert.equal(milestones[1].prerequisitePhases[0], 1);
});

test('duration and overall progress use learner/course data', () => {
  assert.equal(estimateDuration([foundation], 2), '1 weeks');
  assert.equal(calculateOverallProgress([foundation, machineLearning], { ml: { completionPercentage: 50 } }, ['foundation']), 75);
});

test('goal selection prefers known goal skills and excludes completed courses', () => {
  const result = selectGoalCourses([
    foundation,
    machineLearning,
    { _id: 'web', title: 'Web Design', description: 'CSS design', skills: ['CSS'], rating: 5 }
  ], { learningGoal: 'AI Engineer', careerGoal: 'Machine Learning Engineer', interests: [] }, []);
  assert.equal(result.ranked[0]._id, 'ml');
  const excluded = selectGoalCourses([foundation, machineLearning], { learningGoal: 'AI Engineer', careerGoal: 'ML Engineer', interests: [] }, ['ml']);
  assert.equal(excluded.ranked.some((course) => course._id === 'ml'), false);
});

test('learning path milestones require stable identifiers', () => {
  assert.equal(LearningPath.schema.path('milestones').schema.path('milestoneId').options.required, true);
  assert.equal(LearningPath.schema.path('milestones').schema.path('progress').options.max, 100);
});
