process.env.JWT_SECRET = 'unit-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'unit-test-refresh-secret';
process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const axios = require('axios');
const mlRecommendationService = require('../src/services/mlRecommendation.service');

test('ML adapter accepts valid versioned recommendations', async () => {
  const originalPost = axios.post;
  axios.post = async () => ({ data: {
    success: true,
    modelVersion: 'tfidf-v1',
    recommendations: [{ courseId: 'course-1', score: 0.8, explanation: 'content match' }]
  } });
  try {
    const result = await mlRecommendationService.recommend({ goal: 'Python', availableCourses: [] });
    assert.equal(result.modelVersion, 'tfidf-v1');
    assert.equal(result.recommendations[0].courseId, 'course-1');
  } finally {
    axios.post = originalPost;
  }
});

test('ML adapter rejects invalid recommendation scores', async () => {
  const originalPost = axios.post;
  axios.post = async () => ({ data: {
    success: true,
    modelVersion: 'tfidf-v1',
    recommendations: [{ courseId: 'course-1', score: 2, explanation: 'invalid' }]
  } });
  try {
    await assert.rejects(() => mlRecommendationService.recommend({ goal: 'Python', availableCourses: [] }), /temporarily unavailable/);
  } finally {
    axios.post = originalPost;
  }
});
