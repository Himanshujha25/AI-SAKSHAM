const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/toolsController');

const router = express.Router();
router.use(protect);
router.post('/probe', authorize('ADMIN', 'ANALYST'), c.probe);
module.exports = router;
