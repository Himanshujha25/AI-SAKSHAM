const Finding = require('../models/Finding');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const { analyzeFinding } = require('../services/aiService');

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.assessmentId) filter.assessmentId = req.query.assessmentId;
  if (req.query.projectId) filter.projectId = req.query.projectId;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
  const findings = await Finding.find(filter).sort({ cvssScore: -1, updatedAt: -1 }).limit(200);
  res.json({ findings });
});

const get = asyncHandler(async (req, res) => {
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  res.json({ finding });
});

const update = asyncHandler(async (req, res) => {
  const finding = await Finding.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  res.json({ finding });
});

const verify = asyncHandler(async (req, res) => {
  const { status, evidence, confidence, notes } = req.body;
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  if (status) finding.status = status;
  if (evidence !== undefined) finding.evidence = evidence;
  if (confidence !== undefined) finding.confidence = confidence;
  if (notes !== undefined) finding.verificationNotes = notes;
  finding.verified = finding.status === 'Verified';
  finding.verifiedBy = req.user._id;
  finding.verificationDate = new Date();
  await finding.save();
  await logActivity(Activity, { projectId: finding.projectId, actor: req.user._id, action: `Finding ${finding.status}`, detail: `${finding.findingId} ${finding.title}` });
  res.json({ finding });
});

const aiAnalysis = asyncHandler(async (req, res) => {
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const result = await analyzeFinding({
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    endpoint: (finding.affectedAssets || [])[0] || '',
    evidence: finding.evidence,
    verificationStatus: finding.status,
  });
  finding.aiAnalysis = {
    summary: result.summary,
    classification: result.classification,
    confidence: result.confidence,
    impact: result.impact,
    technicalExplanation: result.technicalExplanation,
    remediation: result.remediation,
    priorityReason: result.priorityReason,
  };
  if (!finding.remediation || finding.remediation.length === 0) finding.remediation = result.remediation;
  await finding.save();
  res.json({ finding, meta: result._meta });
});

module.exports = { list, get, update, verify, aiAnalysis };
