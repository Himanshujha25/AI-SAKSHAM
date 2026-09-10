// Simulates the 8-stage assessment pipeline, then materializes demo assets/findings.
// Replace stage bodies with real scanners later; keep the stage contract + socket events.
const Assessment = require('../models/Assessment');
const { STAGES } = require('../models/Assessment');
const Asset = require('../models/Asset');
const Finding = require('../models/Finding');
const Activity = require('../models/Activity');
const { buildDemoAssets, buildDemoFindings } = require('../utils/demoData');
const { securityScoreFromCounts, nextFindingId, logActivity } = require('../utils/security');
const { analyzeFinding } = require('../services/aiService');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STAGE_DELAY_MS = 700;

function emit(io, assessment, extra = {}) {
  try {
    io?.to(`assessment:${assessment._id}`).emit('assessment:progress', {
      assessmentId: String(assessment._id),
      status: assessment.status,
      progress: Object.fromEntries(assessment.progress || []),
      ...extra,
    });
  } catch (e) {
    console.warn('[socket] emit failed', e.message);
  }
}

async function runAssessment(assessmentId, io) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) return;
  if (['CANCELLED', 'COMPLETED'].includes(assessment.status)) return;

  assessment.status = 'RUNNING';
  assessment.startedAt = assessment.startedAt || new Date();
  await assessment.save();
  await logActivity(Activity, { projectId: assessment.projectId, assessmentId: assessment._id, action: 'Assessment Started', detail: assessment.type });
  emit(io, assessment);

  try {
    for (const stage of STAGES) {
      const fresh = await Assessment.findById(assessmentId);
      if (!fresh || ['CANCELLED', 'FAILED'].includes(fresh.status)) return;
      fresh.progress.set(stage, 'running');
      await fresh.save();
      emit(io, fresh, { stage });
      await sleep(STAGE_DELAY_MS);
      fresh.progress.set(stage, 'done');
      await fresh.save();
      emit(io, fresh, { stage });
    }

    // Materialize results (idempotent-ish: wipe previous auto results)
    await Asset.deleteMany({ assessmentId });
    await Finding.deleteMany({ assessmentId });

    const assets = buildDemoAssets().map((a) => ({ ...a, assessmentId }));
    await Asset.insertMany(assets);

    const demos = buildDemoFindings();
    const totals = { assets: assets.length, findings: demos.length, critical: 0, high: 0, medium: 0, low: 0, informational: 0, verified: 0 };
    const docs = [];
    for (const d of demos) {
      const findingId = await nextFindingId(assessment.projectId, Finding);
      const aiAnalysis = await analyzeFinding({
        title: d.title, category: d.category, severity: d.severity,
        endpoint: d.affectedAssets[0] || '', evidence: d.evidence, verificationStatus: d.status,
      });
      docs.push({ ...d, assessmentId, projectId: assessment.projectId, findingId, aiAnalysis });
      totals[d.severity.toLowerCase()] += 1;
      if (d.status === 'Verified') totals.verified += 1;
    }
    await Finding.insertMany(docs);

    const done = await Assessment.findById(assessmentId);
    done.status = 'COMPLETED';
    done.completedAt = new Date();
    done.summary = { securityScore: securityScoreFromCounts(totals), totals };
    await done.save();
    await logActivity(Activity, { projectId: done.projectId, assessmentId: done._id, action: 'Assessment Completed', detail: `Score ${done.summary.securityScore}/100` });
    emit(io, done, { done: true });
  } catch (err) {
    console.error('[worker] assessment failed', err);
    await Assessment.findByIdAndUpdate(assessmentId, { status: 'FAILED' });
    emit(io, await Assessment.findById(assessmentId), { error: err.message });
  }
}

module.exports = { runAssessment };
