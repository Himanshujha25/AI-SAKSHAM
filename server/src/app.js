const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errors');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const targetRoutes = require('./routes/targetRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const findingRoutes = require('./routes/findingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const toolsRoutes = require('./routes/toolsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
app.set('io', null);

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / curl / mobile / server-to-server (no Origin header)
    if (!origin) return cb(null, true);

    const cleanOrigin = origin.trim().replace(/\/$/, '');
    const isWhitelisted =
      env.clientUrls.includes(cleanOrigin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin) ||
      /^https:\/\/ai-saksham.*\.vercel\.app$/.test(cleanOrigin);

    if (isWhitelisted) return cb(null, true);
    return cb(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
const { protect } = require('./middleware/auth');
app.use('/uploads/reports', protect, express.static(path.join(__dirname, '..', 'uploads', 'reports')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const { mongoose, connectDB } = require('./config/db');

app.get('/health', (req, res) => res.json({
  ok: true,
  service: 'saksham-ai-server',
  dbReady: mongoose.connection.readyState === 1,
  time: new Date().toISOString()
}));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/v1', apiLimiter);

// Guard against 10-second query buffering timeouts when DB is offline or reconnecting
app.use('/api/v1', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    connectDB().catch(() => {});
    return res.status(503).json({
      message: 'Database connection is in progress. Please wait a moment and try again.',
      dbReady: false,
    });
  }
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes); // before targetRoutes: its global protect would 401 guest chat
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1', targetRoutes); // nested /projects/:projectId/targets + /targets/:id
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/findings', findingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/tools', toolsRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
