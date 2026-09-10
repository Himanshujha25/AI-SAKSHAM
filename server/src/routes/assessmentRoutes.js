const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/assessmentController');

const router = express.Router();
router.use(protect);
router.post('/', authorize('ADMIN', 'ANALYST'), c.create);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/:id/cancel', authorize('ADMIN', 'ANALYST'), c.cancel);
module.exports = router;
