const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Finding = require('../models/Finding');
const Assessment = require('../models/Assessment');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const { hasProjectAccess } = require('../middleware/auth');

const list = asyncHandler(async (req, res) => {
  const query = req.user.role === 'ADMIN'
    ? {}
    : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
  const projects = await Project.find(query).sort({ updatedAt: -1 });
  res.json({ projects });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, status, category, image } = req.body;
  if (!name) return res.status(400).json({ message: 'name required' });
  const project = await Project.create({ name, description: description || '', image: image || '', status: status || 'Active', category: category || 'Web Application', owner: req.user._id, members: [req.user._id] });
  await logActivity(Activity, { projectId: project._id, actor: req.user._id, action: 'Project Created', detail: name });
  res.status(201).json({ project });
});

const get = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner members', 'name email role');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not a member of this project' });
  }
  const [assessments, recentActivity, aggregation] = await Promise.all([
    Assessment.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(20),
    Activity.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(10),
    Finding.aggregate([
      { $match: { projectId: project._id } },
      { $group: {
          _id: null,
          critical: { $sum: { $cond: [{ $eq: ["$severity", "Critical"] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ["$severity", "High"] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$severity", "Medium"] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ["$severity", "Low"] }, 1, 0] } },
          informational: { $sum: { $cond: [{ $eq: ["$severity", "Informational"] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ["$status", "Verified"] }, 1, 0] } }
      }}
    ])
  ]);
  const counts = aggregation[0] || { critical: 0, high: 0, medium: 0, low: 0, informational: 0, verified: 0 };
  delete counts._id;
  res.json({ project, assessments, overview: { totalAssessments: assessments.length, ...counts, securityScore: assessments[0]?.summary?.securityScore ?? null }, recentActivity });
});

const update = asyncHandler(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  if (!hasProjectAccess(req.user, existing)) {
    return res.status(403).json({ message: 'Access denied: not authorized to update this project' });
  }
  const { name, description, status, category, image } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (category !== undefined) updateData.category = category;
  if (image !== undefined) updateData.image = image;

  const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  res.json({ project });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  if (String(existing.owner) !== String(req.user._id) && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: only project owner can delete project' });
  }
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});

module.exports = { list, create, get, update, remove };

