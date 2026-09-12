const Finding = require('../models/Finding');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const { analyzeFinding } = require('../services/aiService');
const { getUserProjectIds, hasProjectAccess } = require('../middleware/auth');

const list = asyncHandler(async (req, res) => {
  const userProjectIds = await getUserProjectIds(req.user);
  const filter = { projectId: { $in: userProjectIds } };

  if (req.query.assessmentId) filter.assessmentId = String(req.query.assessmentId);
  if (req.query.projectId) {
    if (!userProjectIds.map(String).includes(String(req.query.projectId))) {
      return res.status(403).json({ message: 'Access denied to requested project findings' });
    }
    filter.projectId = String(req.query.projectId);
  }
  if (req.query.severity) filter.severity = String(req.query.severity);
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.search) {
    const cleanSearch = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: cleanSearch, $options: 'i' };
  }
  const findings = await Finding.find(filter).sort({ cvssScore: -1, updatedAt: -1 }).limit(200);
  res.json({ findings });
});

const get = asyncHandler(async (req, res) => {
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this finding' });
  }
  res.json({ finding });
});

const update = asyncHandler(async (req, res) => {
  const existing = await Finding.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(existing.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to update this finding' });
  }
  const finding = await Finding.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ finding });
});

const verify = asyncHandler(async (req, res) => {
  const { status, evidence, confidence, notes } = req.body;
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to verify this finding' });
  }
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
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized for AI analysis on this finding' });
  }
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

