const mongoose = require('mongoose');

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
const FINDING_STATUSES = [
  'Detected',
  'Potential',
  'Under Review',
  'Verified',
  'False Positive',
  'Resolved',
  'Accepted Risk',
];
const REMEDIATION_STATUSES = ['OPEN', 'IN PROGRESS', 'RESOLVED', 'ACCEPTED RISK'];

const findingSchema = new mongoose.Schema(
  {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    findingId: { type: String, required: true, index: true }, // VUL-001
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 120 },
    severity: { type: String, enum: SEVERITIES, required: true, index: true },
    cvssScore: { type: Number, min: 0, max: 10, default: 0 },
    status: { type: String, enum: FINDING_STATUSES, default: 'Potential', index: true },
    confidence: { type: Number, min: 0, max: 100, default: 50 },
    affectedAssets: { type: [String], default: [] },
    description: { type: String, default: '' },
    evidence: { type: String, default: '' },
    impact: { type: String, default: '' },
    remediation: { type: [String], default: [] },
    remediationStatus: { type: String, enum: REMEDIATION_STATUSES, default: 'OPEN' },
    aiAnalysis: {
      summary: { type: String, default: '' },
      classification: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      impact: { type: String, default: '' },
      technicalExplanation: { type: String, default: '' },
      remediation: { type: [String], default: [] },
      priorityReason: { type: String, default: '' },
    },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verificationDate: { type: Date, default: null },
    verificationNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

findingSchema.index({ projectId: 1, findingId: 1 }, { unique: true });

module.exports = mongoose.model('Finding', findingSchema);
module.exports.SEVERITIES = SEVERITIES;
module.exports.FINDING_STATUSES = FINDING_STATUSES;
module.exports.REMEDIATION_STATUSES = REMEDIATION_STATUSES;
