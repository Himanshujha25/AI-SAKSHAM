const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getKnowledgeSummary, loadKnowledge } = require('../services/aiKnowledgeService');

const router = express.Router();
router.use(protect);

/**
 * GET /api/v1/ai/knowledge
 * Returns summary of loaded custom cybersecurity documents from ai_files/
 */
router.get('/knowledge', (req, res) => {
  const summary = getKnowledgeSummary();
  res.json({
    ok: true,
    knowledge: summary,
  });
});

/**
 * POST /api/v1/ai/knowledge/reload
 * Force reloads custom documentation from ai_files/
 */
router.post('/knowledge/reload', authorize('ADMIN', 'ANALYST'), (req, res) => {
  loadKnowledge(true);
  const summary = getKnowledgeSummary();
  res.json({
    ok: true,
    message: 'Knowledge base successfully reloaded from ai_files/',
    knowledge: summary,
  });
});

module.exports = router;
