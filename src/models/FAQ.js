const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Account', 'Finance', 'Inventory', 'General', 'Technical', 'Admin']
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
faqSchema.index({ category: 1, published: 1, order: 1 });
faqSchema.index({ published: 1, viewCount: -1 });

module.exports = mongoose.model('FAQ', faqSchema);
