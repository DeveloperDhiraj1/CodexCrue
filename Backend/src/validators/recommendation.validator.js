const sendResponse = require('../utils/response');

const validateRecommendationRequest = (req, res, next) => {
  // Add specific checks if needed
  next();
};

module.exports = { validateRecommendationRequest };