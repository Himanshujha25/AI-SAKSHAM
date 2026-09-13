const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 2000 },
    image: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Active', 'Paused', 'Completed', 'Archived'], default: 'Active' },
    category: { type: String, enum: ['Web Application', 'API', 'Reconnaissance', 'Monitoring'], default: 'Web Application' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
