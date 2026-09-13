const Target = require('../models/Target');
const Project = require('../models/Project');
const { asyncHandler } = require('../middleware/errors');
const { hasProjectAccess } = require('../middleware/auth');

const listByProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view targets for this project' });
  }
  const targets = await Target.find({ projectId: req.params.projectId }).sort({ updatedAt: -1 });
  res.json({ targets });
});

const create = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to add targets to this project' });
  }
  const { name, url, method, requestBody, environment, authorizationConfirmed, description, metadata, customHeaders } = req.body;
  if (!name || !url) return res.status(400).json({ message: 'name, url required' });

  const headersString = Array.isArray(customHeaders) ? customHeaders.join('\n') : (typeof customHeaders === 'string' ? customHeaders : String(customHeaders || ''));

  const target = await Target.create({
    projectId: req.params.projectId,
    name,
    url,
    method: method || 'GET',
    requestBody: requestBody || '',
    environment: environment || 'Testing',
    customHeaders: headersString,
    authorizationConfirmed: !!authorizationConfirmed,
    description: description || '',
    metadata: metadata || {},
  });
  res.status(201).json({ target });
});

const get = asyncHandler(async (req, res) => {
  const target = await Target.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  const project = await Project.findById(target.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this target' });
  }
  res.json({ target });
});

const update = asyncHandler(async (req, res) => {
  const target = await Target.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  const project = await Project.findById(target.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to update this target' });
  }
  const { name, url, method, requestBody, environment, authorizationConfirmed, description, metadata, customHeaders } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (url !== undefined) updateData.url = url;
  if (method !== undefined) updateData.method = method;
  if (requestBody !== undefined) updateData.requestBody = requestBody;
  if (environment !== undefined) updateData.environment = environment;
  if (customHeaders !== undefined) {
    updateData.customHeaders = Array.isArray(customHeaders) ? customHeaders.join('\n') : (typeof customHeaders === 'string' ? customHeaders : String(customHeaders || ''));
  }
  if (authorizationConfirmed !== undefined) updateData.authorizationConfirmed = !!authorizationConfirmed;
  if (description !== undefined) updateData.description = description;
  if (metadata !== undefined) updateData.metadata = metadata;

  const updated = await Target.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  res.json({ target: updated });
});

const remove = asyncHandler(async (req, res) => {
  const target = await Target.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Target not found' });
  const project = await Project.findById(target.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to delete this target' });
  }
  await Target.findByIdAndDelete(req.params.id);
  res.json({ message: 'Target deleted' });
});

module.exports = { listByProject, create, get, update, remove };

