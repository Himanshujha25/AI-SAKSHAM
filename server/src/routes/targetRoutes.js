const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/targetController');

const router = express.Router();
router.use(protect);
router.get('/projects/:projectId/targets', c.listByProject);
router.post('/projects/:projectId/targets', authorize('ADMIN', 'ANALYST'), c.create);
router.get('/targets/:id', c.get);
router.patch('/targets/:id', authorize('ADMIN', 'ANALYST'), c.update);
router.delete('/targets/:id', authorize('ADMIN'), c.remove);
module.exports = router;
