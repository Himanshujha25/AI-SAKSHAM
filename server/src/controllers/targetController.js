const Target = require('../models/Target');
const { asyncHandler } = require('../middleware/errors');

const listByProject = asyncHandler(async (req, res) => {
  const targets = await Target.find({ projectId: req.params.projectId }).sort({ updatedAt: -1 });
  res.json({ targets });
});

const create = asyncHandler(async (req, res) => {
  const { name, url, environment, authorizationConfirmed, description, metadata } = req.body;
  if (!name || !url) return res.status(400).json({ message: 'name, url required' });
  const target = await Target.create({
    projectId: req.params.projectId,
    name, url, environment: environment || 'Testing',
    authorizationConfirmed: !!authorizationConfirmed,
    description: description || '', metadata: metadata || {},
  });
  res.status(201).json({ target });
});

const get = asyncHandler(async (req, res) => {
  const target = await Target.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  res.json({ target });
});

const update = asyncHandler(async (req, res) => {
  const target = await Target.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!target) return res.status(404).json({ message: 'Target not found' });
  res.json({ target });
});

const remove = asyncHandler(async (req, res) => {
  const target = await Target.findByIdAndDelete(req.params.id);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  res.json({ message: 'Target deleted' });
});

module.exports = { listByProject, create, get, update, remove };
