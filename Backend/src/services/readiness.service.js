const axios = require('axios');
const mongoose = require('mongoose');
const config = require('../config/env');

async function checkReadiness() {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    // Redis is optional in the current deployment. Keep it in the readiness
    // contract so enabling REDIS_REQUIRED later fails closed.
    redis: process.env.REDIS_REQUIRED !== 'true'
  };
  
  try {
    const response = await axios.get(`${config.mlServiceUrl}/health`, { timeout: 1000 });
    checks.ml = response.status >= 200 && response.status < 300;
  } catch (_error) {
    checks.ml = false;
  }
  
  return { ready: Object.values(checks).every(Boolean), checks };
}

module.exports = { checkReadiness };
