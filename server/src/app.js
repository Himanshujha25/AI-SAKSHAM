const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
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

const app = express();
app.set('io', null);

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true, service: 'saksham-ai-server', time: new Date().toISOString() }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/v1', apiLimiter);

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
