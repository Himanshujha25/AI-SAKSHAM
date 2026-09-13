const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { getUserProjectIds } = require('../middleware/auth');

// GET /api/v1/activity?projectId=&limit=50
const list = asyncHandler(async (req, res) => {
  const userProjectIds = await getUserProjectIds(req.user);
  const filter = { projectId: { $in: userProjectIds } };
  if (req.query.projectId) {
    if (!userProjectIds.map(String).includes(String(req.query.projectId))) {
      return res.status(403).json({ message: 'Access denied to requested project activity' });
    }
    filter.projectId = String(req.query.projectId);
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const events = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor', 'name email role')
    .populate('projectId', 'name status category');
  res.json({ events });
});

module.exports = { list };
