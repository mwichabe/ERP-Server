const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: 10,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'general', 'performance'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'review', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  attachments: [String],
  adminNotes: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
