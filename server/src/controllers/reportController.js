const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const Project = require('../models/Project');
const Target = require('../models/Target');
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const { asyncHandler } = require('../middleware/errors');
const { generateReportFile } = require('../services/reportService');
const { executiveSummary, generateExecutiveSummary } = require('../services/aiService');
const { getUserProjectIds, hasProjectAccess } = require('../middleware/auth');
const Activity = require('../models/Activity');
const { logActivity } = require('../utils/security');

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
  const totals = assessment.summary?.totals || { critical: 0, high: 0, medium: 0, low: 0 };
  // Prefer an AI-written summary grounded in real findings; fall back to the
  // factual template only when all AI providers are unreachable.
  let summary;
  let summarySource = 'template';
  try {
    const ai = await generateExecutiveSummary({
      projectName: project?.name || 'Target',
      targetUrl: target?.url,
      score: assessment.summary?.securityScore ?? 0,
      totals,
      topFindings: findings,
    });
    summary = ai.text;
    summarySource = `ai:${ai.provider}`;
  } catch (e) {
    console.warn('[reports] AI summary unavailable, using template:', e.message);
    summary = executiveSummary({
      projectName: project?.name || 'Target',
      score: assessment.summary?.securityScore ?? 0,
      totals,
    });
  }
  const reportType = ['Executive', 'Technical', 'Summary', 'Vulnerability', 'Remediation', 'Compliance'].includes(type) ? type : 'Technical';
  const reportFormat = String(format || 'PDF').toUpperCase().includes('HTML')
    ? 'HTML'
    : String(format || '').toUpperCase().includes('JSON')
    ? 'JSON'
    : 'PDF';

  const { fileName, fileUrl } = await generateReportFile({ project, target, assessment, findings, type: reportType, format: reportFormat, executiveSummary: summary });
  const report = await Report.create({
    projectId: assessment.projectId, assessmentId, type: reportType, format: reportFormat,
    generatedBy: req.user._id, fileUrl, fileName, status: 'Ready', executiveSummary: summary,
    summarySource,
    meta: {
      securityScore: assessment.summary?.securityScore ?? 82,
      findingsCount: findings.length,
      targetUrl: target?.url,
      targetName: target?.name,
    },
  });
  await logActivity(Activity, { projectId: assessment.projectId, assessmentId, actor: req.user._id, action: 'Report Generated', detail: `${reportType} ${reportFormat} (${summarySource})` });
  
  const populatedReport = await Report.findById(report._id)
    .populate('projectId', 'name')
    .populate({ path: 'assessmentId', select: 'type status createdAt summary targetId', populate: { path: 'targetId', select: 'name url method environment' } })
    .populate('generatedBy', 'name email role');

  res.status(201).json({ report: populatedReport || report });
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
  const reports = await Report.find(filter)
    .populate('projectId', 'name')
    .populate({ path: 'assessmentId', select: 'type status createdAt summary targetId', populate: { path: 'targetId', select: 'name url method environment' } })
    .populate('generatedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ reports });
});

const get = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('projectId', 'name')
    .populate({ path: 'assessmentId', select: 'type status createdAt summary targetId', populate: { path: 'targetId', select: 'name url method environment' } })
    .populate('generatedBy', 'name email role');

  if (!report) return res.status(404).json({ message: 'Report not found' });
  const project = await Project.findById(report.projectId?._id || report.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this report' });
  }

  // Fetch findings for in-app interactive preview
  const findings = await Finding.find({ assessmentId: report.assessmentId?._id || report.assessmentId }).sort({ cvssScore: -1 });

  res.json({ report, findings });
});

const remove = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const project = await Project.findById(report.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to delete this report' });
  }

  // Try to clean up file from uploads if it exists
  if (report.fileName) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', report.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('[reports] Could not delete report file:', err.message);
      }
    }
  }

  await Report.findByIdAndDelete(req.params.id);
  await logActivity(Activity, {
    projectId: report.projectId,
    assessmentId: report.assessmentId,
    actor: req.user._id,
    action: 'Report Deleted',
    detail: `${report.type} ${report.format} (${report.fileName})`,
  });

  res.json({ message: 'Report deleted successfully', id: req.params.id });
});

const download = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const project = await Project.findById(report.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to download this report' });
  }

  if (!report.fileName) {
    return res.status(404).json({ message: 'Report file missing' });
  }

  const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', report.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Report file not found on disk' });
  }

  res.download(filePath, report.fileName);
});

module.exports = { generate, list, get, remove, download };

