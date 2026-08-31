process.env.JWT_SECRET = 'unit-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'unit-test-refresh-secret';
process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const { rankRecommendations, isPrerequisiteEligible, prerequisiteScore, feedbackScore } = require('../src/services/recommendationRanking.service');

const profile = {
  learningGoal: 'Python Data Science',
  careerGoal: 'Machine Learning Engineer',
  interests: ['machine learning'],
  learningComment: 'I want practical Python projects and machine learning exercises.',
  experienceLevel: 'beginner'
};

const courses = [
  { _id: 'course-python', title: 'Python Machine Learning', description: 'Python algorithms and data science', category: 'data', difficulty: 'Beginner', skills: ['Python', 'Machine Learning'], tags: [], prerequisites: [] },
  { _id: 'course-advanced', title: 'Advanced ML Systems', description: 'Production ML systems', category: 'data', difficulty: 'Advanced', skills: ['Machine Learning'], tags: [], prerequisites: [{ _id: 'course-missing' }] },
  { _id: 'course-basics', title: 'Data Foundations', description: 'Statistics foundations', category: 'data', difficulty: 'Beginner', skills: ['Statistics'], tags: [], prerequisites: [] }
];

test('prerequisite eligibility blocks courses with incomplete prerequisites', () => {
  assert.equal(isPrerequisiteEligible(courses[1], []), false);
  assert.equal(isPrerequisiteEligible(courses[1], ['course-missing']), true);
  assert.equal(prerequisiteScore(courses[1], []), 0);
});

test('hybrid ranking excludes blocked courses and returns deterministic ranks', () => {
  const ranked = rankRecommendations([
    { courseId: 'course-advanced', score: 0.99, explanation: 'ML match' },
    { courseId: 'course-python', score: 0.65, explanation: 'ML match' },
    { courseId: 'course-basics', score: 0.6, explanation: 'ML match' }
  ], courses, profile, [], { 'course-python': { averageRating: 4.5, sentiment: 'relevant' } });
  assert.equal(ranked.some((item) => item.courseId === 'course-advanced'), false);
  assert.equal(ranked[0].courseId, 'course-python');
  assert.equal(ranked[0].rank, 1);
  assert.ok(ranked[0].rankingSignals.goal >= 0);
  assert.ok(ranked[0].rankingSignals.comment > 0);
});

test('feedback signal is bounded and sentiment-aware', () => {
  assert.equal(feedbackScore({ averageRating: 5, sentiment: 'relevant' }), 1);
  assert.equal(feedbackScore({ averageRating: 5, sentiment: 'not_relevant' }), 0.25);
  assert.equal(feedbackScore({ averageRating: 0, sentiment: undefined }), 0);
  assert.equal(feedbackScore({ averageRating: 100 }), 1);
});
