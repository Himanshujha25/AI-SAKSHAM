const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    type: {
      type: String,
      enum: ['route', 'api', 'technology', 'header', 'js', 'dependency'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    url: { type: String, default: '' },
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'ANY'], default: 'GET' },
    authentication: { type: String, enum: ['Public', 'Required', 'Admin'], default: 'Public' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

assetSchema.index({ assessmentId: 1, url: 1, method: 1 });

module.exports = mongoose.model('Asset', assetSchema);
