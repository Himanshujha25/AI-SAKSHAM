const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const Project = require('../models/Project');

const revokedTokens = new Set();

function revokeToken(token) {
  if (token) revokedTokens.add(token);
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });
    if (revokedTokens.has(token)) return res.status(401).json({ message: 'Not authorized, token revoked' });
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

async function getUserProjectIds(user) {
  if (!user) return [];
  if (user.role === 'ADMIN') {
    const all = await Project.find({}).select('_id');
    return all.map((p) => p._id);
  }
  const projects = await Project.find({
    $or: [{ owner: user._id }, { members: user._id }],
  }).select('_id');
  return projects.map((p) => p._id);
}

function hasProjectAccess(user, project) {
  if (!user || !project) return false;
  if (user.role === 'ADMIN') return true;
  const userIdStr = String(user._id);
  const ownerStr = String(project.owner?._id || project.owner);
  if (userIdStr === ownerStr) return true;
  const members = (project.members || []).map((m) => String(m._id || m));
  return members.includes(userIdStr);
}

module.exports = { signToken, protect, authorize, getUserProjectIds, hasProjectAccess, revokeToken };

