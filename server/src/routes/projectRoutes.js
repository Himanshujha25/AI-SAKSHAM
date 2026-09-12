const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/projectController');

const router = express.Router();
router.use(protect);
router.get('/', c.list);
router.post('/', authorize('ADMIN', 'ANALYST'), c.create);
router.get('/:id', c.get);
router.patch('/:id', authorize('ADMIN', 'ANALYST'), c.update);
router.put('/:id', authorize('ADMIN', 'ANALYST'), c.update);
router.delete('/:id', authorize('ADMIN'), c.remove);
module.exports = router;
