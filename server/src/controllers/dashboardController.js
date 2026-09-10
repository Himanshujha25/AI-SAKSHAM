const Project = require('../models/Project');
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');

const overview = asyncHandler(async (req, res) => {
  const projectFilter = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
  const projects = await Project.find(projectFilter).select('_id');
  const projectIds = projects.map((p) => p._id);

  const [assessments, findings, activity] = await Promise.all([
    Assessment.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).limit(10),
    Finding.find({ projectId: { $in: projectIds } }).sort({ cvssScore: -1 }).limit(10),
    Activity.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).limit(10),
  ]);

  const allCounts = await Finding.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: '$severity', count: { $sum: 1 } } },
  ]);
  const severity = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
  allCounts.forEach((c) => { if (severity[c._id] !== undefined) severity[c._id] = c.count; });
  const verified = await Finding.countDocuments({ projectId: { $in: projectIds }, status: 'Verified' });
  const total = Object.values(severity).reduce((a, b) => a + b, 0);
  const latestScore = assessments.find((a) => a.summary?.securityScore != null)?.summary?.securityScore ?? null;

  res.json({
    securityScore: latestScore,
    totalFindings: total,
    severity,
    verifiedFindings: verified,
    recentFindings: findings,
    recentAssessments: assessments,
    activity,
  });
});

module.exports = { overview };
