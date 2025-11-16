const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetRoles: {
    type: [String],
    enum: ['admin', 'finance', 'inventory', 'user'],
    default: ['admin', 'finance', 'inventory', 'user']
  },
  published: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ published: 1, createdAt: -1 });
announcementSchema.index({ targetRoles: 1, published: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
