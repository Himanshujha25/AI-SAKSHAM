const Report = require('../models/Report');
const Project = require('../models/Project');
const Target = require('../models/Target');
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const { asyncHandler } = require('../middleware/errors');
const { generateReportFile } = require('../services/reportService');
const { executiveSummary } = require('../services/aiService');
const { getUserProjectIds, hasProjectAccess } = require('../middleware/auth');

const generate = asyncHandler(async (req, res) => {
  const { assessmentId, type, format } = req.body;
  if (!assessmentId) return res.status(400).json({ message: 'assessmentId required' });
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  const project = await Project.findById(assessment.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to generate report for this project' });
  }

  const [target, findings] = await Promise.all([
    Target.findById(assessment.targetId),
    Finding.find({ assessmentId }).sort({ cvssScore: -1 }),
  ]);
  const summary = executiveSummary({
    projectName: project?.name || 'Target',
    score: assessment.summary?.securityScore ?? 0,
    totals: assessment.summary?.totals || { critical: 0, high: 0, medium: 0, low: 0 },
  });
  const reportType = ['Executive', 'Technical', 'Summary'].includes(type) ? type : 'Technical';
  const reportFormat = String(format || 'PDF').toUpperCase().includes('HTML')
    ? 'HTML'
    : String(format || '').toUpperCase().includes('JSON')
    ? 'JSON'
    : 'PDF';

  const { fileName, fileUrl } = await generateReportFile({ project, target, assessment, findings, type: reportType, format: reportFormat, executiveSummary: summary });
  const report = await Report.create({
    projectId: assessment.projectId, assessmentId, type: reportType, format: reportFormat,
    generatedBy: req.user._id, fileUrl, fileName, status: 'Ready', executiveSummary: summary,
  });
  res.status(201).json({ report });
});

const list = asyncHandler(async (req, res) => {
  const userProjectIds = await getUserProjectIds(req.user);
  const filter = { projectId: { $in: userProjectIds } };
  if (req.query.projectId) {
    if (!userProjectIds.map(String).includes(String(req.query.projectId))) {
      return res.status(403).json({ message: 'Access denied to requested project reports' });
    }
    filter.projectId = req.query.projectId;
  }
  if (req.query.assessmentId) filter.assessmentId = req.query.assessmentId;
  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ reports });
});

const get = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const project = await Project.findById(report.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this report' });
  }
  res.json({ report });
});

module.exports = { generate, list, get };

