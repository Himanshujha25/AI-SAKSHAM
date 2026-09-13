const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const Project = require('../models/Project');
const Assessment = require('../models/Assessment');
const Finding = require('../models/Finding');
const Report = require('../models/Report');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { getUserProjectIds } = require('../middleware/auth');
const { generateExecutiveSummary } = require('../services/aiService');

// Optional auth: logged-in users get full data access, guests get limited intro mode.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (e) {
    // invalid/expired token → guest mode, never a crash
  }
  next();
}

const FULL_SYSTEM = `You are Saksham Bot, the friendly in-app assistant of Saksham AI (a security assessment platform).
Rules:
- Talk like a helpful human (like ChatGPT): warm, concise, natural. Match the user's language exactly — Hindi, Hinglish, or English. Default to Hinglish if mixed.
- You have LIVE read-only access to the user's workspace, summarized below as LIVE DATA. Answer questions about THEIR projects, assessments, findings, reports and activity using those exact numbers/names. Never invent data not present below.
- You can also do normal chit-chat (greetings, jokes, general questions, basic cybersecurity concepts).
- You CANNOT change anything (no creating/deleting/scanning) — for actions, tell the user which button/page to use.
- Never reveal other users' data, passwords, tokens, or API keys. Never help with unauthorized hacking — only authorized assessments.
- Keep replies short (under 120 words) unless the user asks for detail. Format for chat: short paragraphs, "- " bullets for lists, **bold** for key terms only. No headings, no tables, no code blocks unless asked.`;

const GUEST_SYSTEM = `You are Saksham Bot on the public landing page of Saksham AI (a security assessment platform).
Rules:
- Talk like a helpful human (like ChatGPT). Match the user's language: Hindi, Hinglish, or English.
- You may ONLY introduce the app: what Saksham AI does (authorized attack-surface discovery, evidence-backed findings, CVSS risk scoring, AI remediation help, PDF reports, RBAC testing sandbox).
- You have NO access to any user data. If asked for specifics, live data, demo, prices, or anything beyond the intro, politely say: login first ("Pehle login karo, phir main tumhara poora workspace dekh ke sab bata dunga").
- Keep replies short (under 80 words). Format for chat: short paragraphs, "- " bullets, **bold** for key terms. No headings or tables.`;

async function buildWorkspaceSnapshot(user) {
  const projectIds = await getUserProjectIds(user);
  const [projects, assessments, findings, reports, activity] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).select('name status category').limit(20),
    Assessment.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).limit(10)
      .populate('projectId', 'name').populate('targetId', 'name url'),
    Finding.find({ projectId: { $in: projectIds } }).sort({ cvssScore: -1 }).limit(8),
    Report.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).limit(5),
    Activity.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).limit(6),
  ]);
  const sev = {};
  findings.forEach((f) => { sev[f.severity] = (sev[f.severity] || 0) + 1; });
  const totalFindings = await Finding.countDocuments({ projectId: { $in: projectIds } });
  const lines = [
    `Projects (${projects.length}): ${projects.map((p) => `${p.name} [${p.status}]`).join('; ') || 'none yet'}`,
    `Recent assessments: ${assessments.map((a) => `${a.type} on ${(a.projectId && a.projectId.name) || '?'} → ${a.status} (score ${a.summary?.securityScore ?? 'n/a'})`).join('; ') || 'none yet'}`,
    `Findings: ${totalFindings} total. Top: ${findings.map((f) => `${f.findingId} ${f.title} [${f.severity} ${f.cvssScore}] (${f.status})`).join('; ') || 'none yet'}`,
    `Reports: ${reports.map((r) => `${r.type} ${r.format} (${r.status})`).join('; ') || 'none yet'}`,
    `Recent activity: ${activity.map((a) => `${a.action} — ${a.detail || ''}`).join('; ') || 'none yet'}`,
  ];
  return lines.join('\n');
}

// POST /api/v1/chat { message, history?: [{role, content}] }
const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ message: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ message: 'message too long (max 2000 chars)' });
  }
  const cleanHistory = Array.isArray(history)
    ? history.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
      .slice(-8)
    : [];

  if (req.user) {
    const snapshot = await buildWorkspaceSnapshot(req.user);
    const convo = cleanHistory.map((m) => `${m.role === 'user' ? 'User' : 'Saksham Bot'}: ${m.content}`).join('\n');
    const userPrompt = `LIVE DATA (read-only snapshot of this user's workspace):\n${snapshot}\n\nConversation so far:\n${convo}\nUser: ${message.trim()}\nSaksham Bot:`;
    // Reuse the report-summary path (raw text completion + same failover chain).
    const { completeText } = require('../services/aiService');
    try {
      const out = await completeText(FULL_SYSTEM, userPrompt, 500);
      return res.json({ reply: out.text, mode: 'full', provider: out.provider });
    } catch (e) {
      return res.status(e.statusCode || 502).json({ message: 'AI temporarily unavailable, please retry shortly.' });
    }
  }

  const convo = cleanHistory.map((m) => `${m.role === 'user' ? 'User' : 'Saksham Bot'}: ${m.content}`).join('\n');
  const userPrompt = `${convo}\nUser: ${message.trim()}\nSaksham Bot:`;
  const { completeText } = require('../services/aiService');
  try {
    const out = await completeText(GUEST_SYSTEM, userPrompt, 300);
    return res.json({ reply: out.text, mode: 'limited', provider: out.provider });
  } catch (e) {
    return res.status(e.statusCode || 502).json({ message: 'AI temporarily unavailable, please retry shortly.' });
  }
});

module.exports = { chat, optionalAuth };
