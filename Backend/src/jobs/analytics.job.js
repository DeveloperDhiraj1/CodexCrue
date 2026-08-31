const logger = require('../utils/logger');

const runAnalyticsAggregationJob = () => {
  logger.info('Background Job: Aggregating daily active learner stats and course completions...');
};

module.exports = { runAnalyticsAggregationJob };