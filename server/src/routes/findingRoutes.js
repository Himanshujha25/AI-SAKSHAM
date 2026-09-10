const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/findingController');

const router = express.Router();
router.use(protect);
router.get('/', c.list);
router.get('/:id', c.get);
router.patch('/:id', authorize('ADMIN', 'ANALYST'), c.update);
router.post('/:id/verify', authorize('ADMIN', 'ANALYST'), c.verify);
router.post('/:id/ai-analysis', authorize('ADMIN', 'ANALYST'), c.aiAnalysis);
module.exports = router;
