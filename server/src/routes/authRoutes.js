const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
});

const router = express.Router();
router.post('/register', authLimiter, c.register);
router.post('/login', authLimiter, c.login);
router.get('/me', protect, c.me);
router.post('/logout', protect, c.logout);
module.exports = router;

