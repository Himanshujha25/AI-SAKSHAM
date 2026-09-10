const Assessment = require('../models/Assessment');
const Target = require('../models/Target');
const Asset = require('../models/Asset');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const { enqueueAssessment, cancelAssessment } = require('../queues/assessmentQueue');
const { runAssessment } = require('../workers/assessmentWorker');

function getIO(req) {
  return req.app.get('io');
}

const create = asyncHandler(async (req, res) => {
  const { projectId, targetId, type, authorizationConfirmed } = req.body;
  if (!projectId || !targetId) return res.status(400).json({ message: 'projectId, targetId required' });
  if (!authorizationConfirmed) return res.status(400).json({ message: 'Authorization confirmation required: confirm you are authorized to assess this target.' });
  const target = await Target.findById(targetId);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  // Persist confirmation + touch last assessment
  target.authorizationConfirmed = true;
  target.lastAssessment = new Date();
  await target.save();

  const assessment = await Assessment.create({
    projectId, targetId, type: type || 'Standard', status: 'QUEUED', createdBy: req.user._id,
  });
  await logActivity(Activity, { projectId, assessmentId: assessment._id, actor: req.user._id, action: 'Assessment Queued', detail: assessment.type });
  enqueueAssessment(assessment._id, () => runAssessment(assessment._id, getIO(req)));
  res.status(201).json({ assessment });
});

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.projectId) filter.projectId = req.query.projectId;
  if (req.query.targetId) filter.targetId = req.query.targetId;
  const assessments = await Assessment.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ assessments });
});

const get = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id).populate('targetId projectId');
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  const assets = await Asset.find({ assessmentId: assessment._id }).limit(200);
  res.json({ assessment, assets });
});

const cancel = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  cancelAssessment(assessment._id);
  assessment.status = 'CANCELLED';
  await assessment.save();
  await logActivity(Activity, { projectId: assessment.projectId, assessmentId: assessment._id, actor: req.user._id, action: 'Assessment Cancelled' });
  res.json({ assessment });
});

module.exports = { create, list, get, cancel };
