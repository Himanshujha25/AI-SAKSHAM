const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    environment: {
      type: String,
      enum: ['Testing', 'Staging', 'Demo', 'Production-authorized', 'Production'],
      default: 'Testing',
    },
    authorizationConfirmed: { type: Boolean, default: false },
    customHeaders: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    description: { type: String, default: '', maxlength: 2000 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastAssessment: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Target', targetSchema);
