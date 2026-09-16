const Assessment = require('../models/Assessment');
const Target = require('../models/Target');
const Project = require('../models/Project');
const Asset = require('../models/Asset');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const { enqueueAssessment, cancelAssessment } = require('../queues/assessmentQueue');
const { runAssessment } = require('../workers/assessmentWorker');
const { getUserProjectIds, hasProjectAccess } = require('../middleware/auth');

function getIO(req) {
  return req.app.get('io');
}

const create = asyncHandler(async (req, res) => {
  const { projectId, targetId, type, authorizationConfirmed } = req.body;
  if (!projectId || !targetId) return res.status(400).json({ message: 'projectId, targetId required' });
  if (!authorizationConfirmed) return res.status(400).json({ message: 'Authorization confirmation required: confirm you are authorized to assess this target.' });
  
  const project = await Project.findById(projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to start assessment for this project' });
  }

  const target = await Target.findById(targetId);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  if (String(target.projectId) !== String(projectId)) {
    return res.status(403).json({ message: 'Target does not belong to the specified project' });
  }
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
  const userProjectIds = await getUserProjectIds(req.user);
  const filter = { projectId: { $in: userProjectIds } };
  if (req.query.projectId) {
    if (!userProjectIds.map(String).includes(String(req.query.projectId))) {
      return res.status(403).json({ message: 'Access denied to requested project assessments' });
    }
    filter.projectId = req.query.projectId;
  }
  if (req.query.targetId) filter.targetId = req.query.targetId;
  const assessments = await Assessment.find(filter).sort({ createdAt: -1 }).limit(100)
    .populate('projectId', 'name')
    .populate('targetId', 'name url');
  res.json({ assessments });
});

const get = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id).populate('targetId projectId');
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  const project = assessment.projectId?._id ? assessment.projectId : await Project.findById(assessment.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this assessment' });
  }
  const assets = await Asset.find({ assessmentId: assessment._id }).limit(200);
  res.json({ assessment, assets });
});

const cancel = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  const project = await Project.findById(assessment.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to cancel this assessment' });
  }
  cancelAssessment(assessment._id);
  assessment.status = 'CANCELLED';
  await assessment.save();
  await logActivity(Activity, { projectId: assessment.projectId, assessmentId: assessment._id, actor: req.user._id, action: 'Assessment Cancelled' });
  res.json({ assessment });
});

module.exports = { create, list, get, cancel };

