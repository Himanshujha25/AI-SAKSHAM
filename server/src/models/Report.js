const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    type: { type: String, default: 'Technical' },
    format: { type: String, default: 'PDF' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, default: '' }, // local path under /uploads
    fileName: { type: String, default: '' },
    status: { type: String, enum: ['Generating', 'Ready', 'Failed'], default: 'Ready' },
    executiveSummary: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Report', reportSchema);
