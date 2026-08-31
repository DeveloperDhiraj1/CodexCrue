const axios = require('axios');
const config = require('../config/env');

class MLRecommendationService {
  async recommend(payload) {
    try {
      const response = await axios.post(`${config.mlServiceUrl}/recommend`, payload, { timeout: 5000 });
      const body = response.data;
      if (!body?.success || !Array.isArray(body.recommendations) || !body.modelVersion) {
        throw new Error('ML service returned an invalid recommendation response.');
      }

      const recommendations = body.recommendations.map((recommendation) => {
        if (!recommendation.courseId || typeof recommendation.score !== 'number' || recommendation.score < 0 || recommendation.score > 1) {
          throw new Error('ML service returned an invalid recommendation item.');
        }
        return {
          courseId: String(recommendation.courseId),
          score: recommendation.score,
          explanation: String(recommendation.explanation || '')
        };
      });
      return { recommendations, modelVersion: String(body.modelVersion) };
    } catch (error) {
      const statusCode = error.response?.status === 503 ? 503 : 502;
      throw Object.assign(new Error('Recommendation model is temporarily unavailable.'), { statusCode, cause: error });
    }
  }
}

module.exports = new MLRecommendationService();
