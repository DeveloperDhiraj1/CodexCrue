const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const errorHandler = require('./middleware/error.middleware');
const { checkReadiness } = require('./services/readiness.service');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const courseRoutes = require('./routes/course.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const learningPathRoutes = require('./routes/learningPath.routes');
const progressRoutes = require('./routes/progress.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const skillGapRoutes = require('./routes/skillGap.routes');
const skillRoutes = require('./routes/skill.routes');
const goalRoutes = require('./routes/goal.routes');
const learningResourceRoutes = require('./routes/learningResource.routes');
const rewardRoutes = require('./routes/reward.routes');

const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

app.use(helmet());
// CORS: allow all origins listed in env, plus any localhost port in development
const allowedOrigins = (config.corsOrigin || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost origin in development
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'CortexCrew API is running live! 🚀' 
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CodexCrue Backend API is alive.', data: { status: 'alive' } });
});

app.get('/ready', async (req, res, next) => {
  try {
    const result = await checkReadiness();
    return res.status(result.ready ? 200 : 503).json({
      success: result.ready,
      message: result.ready ? 'CodexCrue dependencies are ready.' : 'CodexCrue dependencies are not ready.',
      data: result
    });
  } catch (error) {
    return next(error);
  }
});

// Registering All Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/learning-resources', learningResourceRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/skills/gap', skillGapRoutes);
app.use('/api/skills', skillRoutes);

app.use(errorHandler);

module.exports = app;
