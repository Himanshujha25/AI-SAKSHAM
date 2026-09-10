const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role && ['ADMIN', 'ANALYST', 'VIEWER'].includes(role) ? role : 'ANALYST',
  });
  res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email, password required' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: client discards token. Endpoint exists for symmetrical API.
  res.json({ message: 'Logged out' });
});

module.exports = { register, login, me, logout };
