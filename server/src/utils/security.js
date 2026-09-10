function severityFromScore(score) {
  const s = Number(score) || 0;
  if (s >= 9.0) return 'Critical';
  if (s >= 7.0) return 'High';
  if (s >= 4.0) return 'Medium';
  if (s > 0) return 'Low';
  return 'Informational';
}

// Weighted deduction: Critical 15, High 10, Medium 5, Low 2, Info 0.5
function securityScoreFromCounts({ critical = 0, high = 0, medium = 0, low = 0, informational = 0 }) {
  const deduction = critical * 15 + high * 10 + medium * 5 + low * 2 + informational * 0.5;
  return Math.max(0, Math.min(100, Math.round(100 - deduction)));
}

async function nextFindingId(projectId, Finding) {
  const count = await Finding.countDocuments({ projectId });
  return `VUL-${String(count + 1).padStart(3, '0')}`;
}

async function logActivity(Activity, { projectId = null, assessmentId = null, actor = null, action, detail = '' }) {
  try {
    await Activity.create({ projectId, assessmentId, actor, action, detail });
  } catch (e) {
    console.warn('[activity] log failed:', e.message);
  }
}

module.exports = { severityFromScore, securityScoreFromCounts, nextFindingId, logActivity };
