const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/toolsController');

const probeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 single probes per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many API probe requests. Rate limit is 30 requests per minute.' },
});

const bulkProbeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 batch runs per minute (up to 250 requests)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many bulk probe executions. Rate limit is 10 batches per minute.' },
});

const router = express.Router();
router.use(protect);
router.post('/probe', authorize('ADMIN', 'ANALYST'), probeLimiter, c.probe);
router.post('/probe-bulk', authorize('ADMIN', 'ANALYST'), bulkProbeLimiter, c.probeBulk);
module.exports = router;

