const express = require('express');
const rateLimit = require('express-rate-limit');
const { chat, optionalAuth } = require('../controllers/chatController');

const router = express.Router();
// Stricter limit for LLM-backed chat: 30 msgs / 15 min per IP.
router.post('/', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), optionalAuth, chat);
module.exports = router;
