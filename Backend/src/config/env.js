const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production') {
  const missing = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN'].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cortexcrew',
  mongoDnsServers: (process.env.MONGO_DNS_SERVERS || '').split(',').map((server) => server.trim()).filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRE || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'codex_refresh_token',
  cookieSecure: process.env.NODE_ENV === 'production',
  // redisHost: process.env.REDIS_HOST || '127.0.0.1',
  // redisPort: Number(process.env.REDIS_PORT || 6379),
  // redisRequired: process.env.REDIS_REQUIRED === 'true' || process.env.NODE_ENV === 'production',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  mlCandidateLimit: Number(process.env.ML_CANDIDATE_LIMIT || 1000),
  aiApiUrl: process.env.AI_API_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || '',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 15000),
  aiMaxTokens: Number(process.env.AI_MAX_TOKENS || 600),
  aiHistoryLimit: Number(process.env.AI_HISTORY_LIMIT || 20),
  aiRecommendationLimit: Number(process.env.AI_RECOMMENDATION_LIMIT || 60),
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  youtubeSearchLimit: Number(process.env.YOUTUBE_SEARCH_LIMIT || 12),
  recommendationWeights: {
    ml: Number(process.env.RECOMMENDATION_WEIGHT_ML || 0.3),
    skill: Number(process.env.RECOMMENDATION_WEIGHT_SKILL || 0.15),
    goal: Number(process.env.RECOMMENDATION_WEIGHT_GOAL || 0.15),
    comment: Number(process.env.RECOMMENDATION_WEIGHT_COMMENT || 0.15),
    quality: Number(process.env.RECOMMENDATION_WEIGHT_QUALITY || 0.1),
    timeFit: Number(process.env.RECOMMENDATION_WEIGHT_TIME_FIT || 0.05),
    prerequisite: Number(process.env.RECOMMENDATION_WEIGHT_PREREQUISITE || 0.05),
    preference: Number(process.env.RECOMMENDATION_WEIGHT_PREFERENCE || 0.05),
    feedback: Number(process.env.RECOMMENDATION_WEIGHT_FEEDBACK || 0.05)
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
