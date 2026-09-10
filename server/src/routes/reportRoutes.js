const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/reportController');

const router = express.Router();
router.use(protect);
router.post('/generate', authorize('ADMIN', 'ANALYST'), c.generate);
router.get('/', c.list);
router.get('/:id', c.get);
module.exports = router;
