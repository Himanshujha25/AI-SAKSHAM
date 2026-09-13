const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
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

// PATCH /auth/me { name } — rename only. Email/role/provider can never be
// changed here (identity stays locked to the login account).
const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'name is required' });
  }
  if (name.trim().length > 80) {
    return res.status(400).json({ message: 'name is too long (max 80 chars)' });
  }
  req.user.name = name.trim().slice(0, 80);
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: client discards token. Endpoint exists for symmetrical API.
  res.json({ message: 'Logged out' });
});

// POST /auth/google { idToken } or { code } — verify with Google, then
// find-or-create the user by googleId/email and return our own JWT.
// Two paths, same result:
//   • idToken — from Google One Tap (no secret needed)
//   • code    — from the popup consent screen, exchanged server-side with the
//               client secret (works even when the browser blocks FedCM/One Tap)
// New Gmail users get an account in one tap; existing password users with the
// same email get linked (role + password login stay intact).
const google = asyncHandler(async (req, res) => {
  if (!env.googleClientId) {
    return res.status(500).json({ message: 'Google login is not configured on the server (GOOGLE_CLIENT_ID missing)' });
  }
  const { idToken, code } = req.body || {};
  if ((!idToken || typeof idToken !== 'string') && (!code || typeof code !== 'string')) {
    return res.status(400).json({ message: 'idToken or code is required' });
  }

  const client = new OAuth2Client(env.googleClientId, env.googleClientSecret || undefined, 'postmessage');
  let payload;
  try {
    if (code) {
      if (!env.googleClientSecret) {
        return res.status(500).json({ message: 'Google login is not configured on the server (GOOGLE_CLIENT_SECRET missing)' });
      }
      const { tokens } = await client.getToken({ code, redirect_uri: 'postmessage' });
      if (!tokens || !tokens.id_token) {
        return res.status(401).json({ message: 'Google verification failed' });
      }
      const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.googleClientId });
      payload = ticket.getPayload();
    } else {
      const ticket = await client.verifyIdToken({ idToken, audience: env.googleClientId });
      payload = ticket.getPayload();
    }
  } catch (e) {
    const details = (e && e.message) || '';
    console.error('[auth/google] verification failed:', details);
    if (/redirect_uri_mismatch/i.test(details)) {
      return res.status(401).json({ message: 'Google origin not allowed — add this site URL to Authorized JavaScript origins in Google Cloud Console' });
    }
    return res.status(401).json({ message: 'Invalid Google credential' });
  }

  if (!payload || !payload.email || payload.email_verified !== true) {
    return res.status(401).json({ message: 'Google email is not verified' });
  }
  // Defense in depth: the library already checks this, but never trust a
  // token minted for a different app — it could belong to another account.
  if (payload.aud !== env.googleClientId) {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    // Link Google identity to the existing account (keeps role + password login intact).
    // Avatar always refreshes to the latest Google photo (dynamic sync).
    let changed = false;
    if (!user.googleId) { user.googleId = payload.sub; changed = true; }
    if (payload.picture && user.avatar !== payload.picture) { user.avatar = payload.picture; changed = true; }
    if (changed) await user.save();
  } else {
    user = await User.create({
      name: (payload.name || email.split('@')[0]).slice(0, 80),
      email,
      password: crypto.randomBytes(32).toString('hex'), // unusable random secret; Google is the login
      role: 'ANALYST',
      avatar: payload.picture || '',
      provider: 'google',
      googleId: payload.sub,
    });
  }
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

module.exports = { register, login, me, updateMe, logout, google };
