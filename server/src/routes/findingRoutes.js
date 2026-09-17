const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/findingController');

const router = express.Router();
router.use(protect);
router.get('/', c.list);
router.get('/kill-chain/:assessmentId', c.getKillChainMap);
router.get('/:id', c.get);
router.patch('/:id', authorize('ADMIN', 'ANALYST'), c.update);
router.post('/:id/verify', authorize('ADMIN', 'ANALYST'), c.verify);
router.post('/:id/retest', authorize('ADMIN', 'ANALYST'), c.retest);
router.post('/:id/ai-analysis', authorize('ADMIN', 'ANALYST'), c.aiAnalysis);
router.get('/:id/pdf', c.downloadPdf);
module.exports = router;
