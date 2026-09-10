const mongoose = require('mongoose');

// Lightweight audit feed for dashboard activity + project timelines.
const activitySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true, default: null },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', default: null },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, maxlength: 120 }, // e.g. Assessment Started
    detail: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
