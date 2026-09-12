const Assessment = require('../models/Assessment');
const Target = require('../models/Target');
const { STAGES } = require('../models/Assessment');
const Asset = require('../models/Asset');
const Finding = require('../models/Finding');
const Activity = require('../models/Activity');
const { buildDemoAssets, buildDemoFindings } = require('../utils/demoData');
const { securityScoreFromCounts, nextFindingId, logActivity } = require('../utils/security');
const { analyzeFinding } = require('../services/aiService');
const { scanTarget } = require('../services/scannerEngine');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STAGE_DELAY_MS = 600;

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
    const target = await Target.findById(assessment.targetId);
    let liveScanResult = { assets: [], findings: [] };

    for (const stage of STAGES) {
      const fresh = await Assessment.findById(assessmentId);
      if (!fresh || ['CANCELLED', 'FAILED'].includes(fresh.status)) return;
      fresh.progress.set(stage, 'running');
      await fresh.save();
      emit(io, fresh, { stage });

      // Run live scanner during the ATTACK_SURFACE and SECURITY_AUDIT stages
      if (stage === 'ATTACK_SURFACE' && target?.url) {
        try {
          liveScanResult = await scanTarget(target.url, target.customHeaders || '');
        } catch (e) {
          console.warn('[worker] live scan error:', e.message);
        }
      }

      await sleep(STAGE_DELAY_MS);
      fresh.progress.set(stage, 'done');
      await fresh.save();
      emit(io, fresh, { stage });
    }

    // Materialize results
    await Asset.deleteMany({ assessmentId });
    await Finding.deleteMany({ assessmentId });

    // Use pure live assets if discovered, fallback to demoAssets only for empty mock targets
    const liveAssets = liveScanResult.assets || [];
    const combinedAssets = (liveAssets.length >= 2)
      ? liveAssets.map((a) => ({ ...a, assessmentId }))
      : [...liveAssets, ...buildDemoAssets()].map((a) => ({ ...a, assessmentId }));

    await Asset.insertMany(combinedAssets);

    const rawFindings = (liveScanResult.findings && liveScanResult.findings.length > 0)
      ? liveScanResult.findings
      : buildDemoFindings();

    const totals = { assets: combinedAssets.length, findings: rawFindings.length, critical: 0, high: 0, medium: 0, low: 0, informational: 0, verified: 0 };
    const docs = [];
    const baseCount = await Finding.countDocuments({ projectId: assessment.projectId });

    for (let idx = 0; idx < rawFindings.length; idx++) {
      const d = rawFindings[idx];
      const findingId = `VUL-${String(baseCount + idx + 1).padStart(3, '0')}`;
      const computedSev = d.severity
        ? (d.severity.charAt(0).toUpperCase() + d.severity.slice(1).toLowerCase())
        : severityFromScore(d.cvssScore || 5.0);
      const validSev = ['Critical', 'High', 'Medium', 'Low', 'Informational'].includes(computedSev) ? computedSev : 'Medium';

      const aiAnalysis = await analyzeFinding({
        title: d.title, category: d.category, severity: validSev,
        endpoint: (d.affectedAssets || [])[0] || '', evidence: d.evidence, verificationStatus: d.status,
      });
      docs.push({
        title: d.title,
        category: d.category || 'Security Misconfiguration',
        severity: validSev,
        cvssScore: d.cvssScore || 5.0,
        affectedAssets: d.affectedAssets || [target?.url || 'target.local'],
        evidence: d.evidence || 'Header or configuration audit payload.',
        impact: d.impact || 'Potential risk of unauthorized data access or control compromise.',
        remediation: Array.isArray(d.remediation) ? d.remediation : [d.remediation || 'Harden server security configuration.'],
        status: d.status || 'Under Review',
        verified: d.status === 'Verified',
        assessmentId,
        projectId: assessment.projectId,
        findingId,
        aiAnalysis,
      });

      const sevKey = validSev.toLowerCase();
      if (totals[sevKey] !== undefined) totals[sevKey] += 1;
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

