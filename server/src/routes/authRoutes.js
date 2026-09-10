const express = require('express');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

const router = express.Router();
router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', protect, c.me);
router.post('/logout', protect, c.logout);
module.exports = router;
