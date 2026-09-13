const mongoose = require('mongoose');

const STAGES = [
  'reconnaissance',
  'endpointDiscovery',
  'technologyAnalysis',
  'securityChecks',
  'verification',
  'aiAnalysis',
  'riskScoring',
  'reportGeneration',
];

const assessmentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Target', required: true, index: true },
    type: { type: String, enum: ['Quick', 'Standard', 'Comprehensive', 'API Audit', 'Infrastructure'], default: 'Standard' },
    status: {
      type: String,
      enum: ['CREATED', 'QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'CREATED',
    },
    progress: {
      type: Map,
      of: String, // 'pending' | 'running' | 'done'
      default: () => {
        const m = {};
        STAGES.forEach((s) => { m[s] = 'pending'; });
        return m;
      },
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    summary: {
      securityScore: { type: Number, default: null },
      totals: {
        assets: { type: Number, default: 0 },
        findings: { type: Number, default: 0 },
        critical: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        low: { type: Number, default: 0 },
        informational: { type: Number, default: 0 },
        verified: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
module.exports.STAGES = STAGES;
