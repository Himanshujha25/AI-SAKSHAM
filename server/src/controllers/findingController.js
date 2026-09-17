const Finding = require('../models/Finding');
const Project = require('../models/Project');
const Assessment = require('../models/Assessment');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');
const {
  analyzeFinding,
  generateFallbackRemediationWiki,
  generateFallbackCombinedConclusion,
  generateFallbackKillChainStep,
} = require('../services/aiService');
const { getUserProjectIds, hasProjectAccess } = require('../middleware/auth');

const list = asyncHandler(async (req, res) => {
  const userProjectIds = await getUserProjectIds(req.user);
  const filter = { projectId: { $in: userProjectIds } };

  if (req.query.assessmentId) filter.assessmentId = String(req.query.assessmentId);
  if (req.query.projectId) {
    if (!userProjectIds.map(String).includes(String(req.query.projectId))) {
      return res.status(403).json({ message: 'Access denied to requested project findings' });
    }
    filter.projectId = String(req.query.projectId);
  }
  if (req.query.severity) filter.severity = String(req.query.severity);
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.search) {
    const cleanSearch = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: cleanSearch, $options: 'i' } },
      { category: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      { affectedAssets: { $regex: cleanSearch, $options: 'i' } },
    ];
  }
  const findings = await Finding.find(filter).sort({ cvssScore: -1, updatedAt: -1 }).limit(200);
  res.json({ findings });
});

const get = asyncHandler(async (req, res) => {
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to view this finding' });
  }

  const fObj = finding.toObject();
  const endpoint = (fObj.affectedAssets || [])[0] || '';

  if (!fObj.combinedConclusion || !fObj.combinedConclusion.executiveVerdict) {
    fObj.combinedConclusion = generateFallbackCombinedConclusion(
      fObj.title,
      fObj.category,
      fObj.severity,
      fObj.evidence,
      endpoint,
      fObj.cvssScore
    );
  }
  if (!fObj.remediationWiki || !fObj.remediationWiki.configs || fObj.remediationWiki.configs.length === 0) {
    fObj.remediationWiki = generateFallbackRemediationWiki(
      fObj.title,
      fObj.category,
      fObj.severity,
      endpoint
    );
  }
  if (!fObj.killChainStep || !fObj.killChainStep.achievementTitle) {
    fObj.killChainStep = generateFallbackKillChainStep(
      fObj.title,
      fObj.category,
      fObj.severity,
      endpoint,
      fObj.cvssScore
    );
  }

  res.json({ finding: fObj });
});

const update = asyncHandler(async (req, res) => {
  const existing = await Finding.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(existing.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to update this finding' });
  }
  const finding = await Finding.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ finding });
});

const verify = asyncHandler(async (req, res) => {
  const { status, evidence, confidence, notes } = req.body;
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to verify this finding' });
  }
  if (status) finding.status = status;
  if (evidence !== undefined) finding.evidence = evidence;
  if (confidence !== undefined) finding.confidence = confidence;
  if (notes !== undefined) finding.verificationNotes = notes;
  finding.verified = finding.status === 'Verified';
  finding.verifiedBy = req.user._id;
  finding.verificationDate = new Date();
  await finding.save();
  await logActivity(Activity, { projectId: finding.projectId, actor: req.user._id, action: `Finding ${finding.status}`, detail: `${finding.findingId} ${finding.title}` });
  res.json({ finding });
});

const aiAnalysis = asyncHandler(async (req, res) => {  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized for AI analysis on this finding' });
  }
  const result = await analyzeFinding({
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    endpoint: (finding.affectedAssets || [])[0] || '',
    evidence: finding.evidence,
    verificationStatus: finding.status,
  });
  finding.aiAnalysis = {
    summary: result.summary,
    classification: result.classification,
    confidence: result.confidence,
    impact: result.impact,
    businessImpact: result.businessImpact,
    technicalExplanation: result.technicalExplanation,
    stepsToReproduce: result.stepsToReproduce,
    proofOfConcept: result.proofOfConcept,
    remediation: result.remediation,
    priorityReason: result.priorityReason,
  };
  finding.combinedConclusion = result.combinedConclusion;
  finding.remediationWiki = result.remediationWiki;
  finding.killChainStep = result.killChainStep;

  if (!finding.stepsToReproduce || finding.stepsToReproduce.length === 0) finding.stepsToReproduce = result.stepsToReproduce;
  if (!finding.proofOfConcept) finding.proofOfConcept = result.proofOfConcept;
  if (!finding.businessImpact) finding.businessImpact = result.businessImpact;
  if (!finding.remediation || finding.remediation.length === 0) finding.remediation = result.remediation;
  await finding.save();
  res.json({ finding, meta: result._meta });
});

const getKillChainMap = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
  const project = await Project.findById(assessment.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied to assessment kill chain' });
  }

  const rawFindings = await Finding.find({ assessmentId }).sort({ cvssScore: -1 });

  const nodes = rawFindings.map((f, idx) => {
    const endpoint = (f.affectedAssets || [])[0] || '192.168.100.2';
    const fallbackStep = generateFallbackKillChainStep(f.title, f.category, f.severity, endpoint, f.cvssScore);
    const step = (f.killChainStep && f.killChainStep.achievementTitle) ? f.killChainStep : fallbackStep;
    const fallbackWiki = generateFallbackRemediationWiki(f.title, f.category, f.severity, endpoint);
    const wiki = (f.remediationWiki && f.remediationWiki.insight) ? f.remediationWiki : fallbackWiki;
    const conclusion = (f.combinedConclusion && f.combinedConclusion.executiveVerdict)
      ? f.combinedConclusion
      : generateFallbackCombinedConclusion(f.title, f.category, f.severity, f.evidence, endpoint, f.cvssScore);

    return {
      id: String(f._id),
      findingId: f.findingId || `VUL-${idx + 1}`,
      title: f.title,
      category: f.category,
      severity: f.severity,
      cvssScore: f.cvssScore,
      status: f.status,
      phase: step.phase || 'Initial Access',
      order: step.order || (idx + 1),
      achievementTitle: step.achievementTitle || f.title,
      score: Number((step.score || f.cvssScore || 5.0).toFixed(1)),
      adversaryLevel: step.adversaryLevel || 'Opportunistic',
      sourceAsset: step.sourceAsset || 'External Gateway',
      targetAsset: step.targetAsset || endpoint,
      vector: step.vector || 'HTTP Network Vector',
      insight: wiki.insight,
      impact: wiki.impact,
      mitreTechnique: wiki.mitreTechnique,
      mitreUrl: wiki.mitreUrl,
      configs: wiki.configs,
      validationMethod: wiki.validationMethod,
      combinedConclusion: conclusion,
    };
  });

  const phaseRank = {
    'Reconnaissance': 1,
    'Initial Access': 2,
    'Credential Access': 3,
    'Lateral Movement': 4,
    'Privilege Escalation': 5,
    'Impact': 6,
  };

  nodes.sort((a, b) => {
    const rankDiff = (phaseRank[a.phase] || 3) - (phaseRank[b.phase] || 3);
    if (rankDiff !== 0) return rankDiff;
    return b.score - a.score;
  });

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
      from: nodes[i].id,
      to: nodes[i + 1].id,
      label: nodes[i + 1].vector || 'Attack Vector Pivot',
      phaseTransition: `${nodes[i].phase} -> ${nodes[i + 1].phase}`,
    });
  }

  const achievements = [...nodes].sort((a, b) => b.score - a.score);

  res.json({
    assessmentId,
    target: assessment.targetId,
    totalAchievements: achievements.length,
    highestScore: achievements.length > 0 ? achievements[0].score : 0,
    killChainProgression: {
      reconnaissance: nodes.filter(n => n.phase === 'Reconnaissance').length,
      initialAccess: nodes.filter(n => n.phase === 'Initial Access').length,
      credentialAccess: nodes.filter(n => n.phase === 'Credential Access').length,
      lateralMovement: nodes.filter(n => n.phase === 'Lateral Movement').length,
      privilegeEscalation: nodes.filter(n => n.phase === 'Privilege Escalation').length,
      impact: nodes.filter(n => n.phase === 'Impact').length,
    },
    nodes,
    edges,
    achievements,
  });
});

const retest = asyncHandler(async (req, res) => {
  const { result, notes } = req.body; // result: REQUIRED | PASSED | FAILED
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied: not authorized to retest this finding' });
  }
  if (result === 'REQUIRED') {
    finding.retestStatus = 'REQUIRED';
    if (finding.status === 'Resolved') finding.status = 'Under Review';
  } else if (result === 'PASSED') {
    finding.retestStatus = 'PASSED';
    finding.status = 'Verified';
    finding.verified = true;
    finding.verifiedBy = req.user._id;
    finding.verificationDate = new Date();
  } else if (result === 'FAILED') {
    finding.retestStatus = 'FAILED';
    finding.status = 'Potential';
    finding.verified = false;
  } else {
    return res.status(400).json({ message: 'result must be REQUIRED, PASSED or FAILED' });
  }
  if (notes !== undefined) finding.retestNotes = String(notes);
  finding.retestDate = new Date();
  await finding.save();
  await logActivity(Activity, { projectId: finding.projectId, actor: req.user._id, action: `Retest ${finding.retestStatus}`, detail: `${finding.findingId} ${finding.title}` });
  res.json({ finding });
});

const downloadPdf = asyncHandler(async (req, res) => {
  const finding = await Finding.findById(req.params.id);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });
  const project = await Project.findById(finding.projectId);
  if (!project || !hasProjectAccess(req.user, project)) {
    return res.status(403).json({ message: 'Access denied to this finding PDF' });
  }

  const { generateSingleFindingPdf } = require('../services/reportService');
  const { fileName, fileUrl } = await generateSingleFindingPdf({ project, finding });
  res.json({ fileName, fileUrl });
});

module.exports = { list, get, update, verify, aiAnalysis, getKillChainMap, retest, downloadPdf };

