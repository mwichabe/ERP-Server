const mongoose = require('mongoose');

const roleRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedRole: { type: String, enum: ['admin','finance','inventory'], required: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['pending','approved','declined'], default: 'pending', index: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('RoleRequest', roleRequestSchema);


