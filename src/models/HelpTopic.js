const mongoose = require('mongoose');

const helpTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Getting Started', 'Finance', 'Inventory', 'Admin', 'Troubleshooting', 'Best Practices']
  },
  tags: [String],
  viewCount: {
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
  },
  related: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'HelpTopic',
    default: []
  }
}, {
  timestamps: true
});

// Index for faster queries
helpTopicSchema.index({ category: 1, published: 1, order: 1 });
helpTopicSchema.index({ published: 1, viewCount: -1 });
helpTopicSchema.index({ tags: 1, published: 1 });

module.exports = mongoose.model('HelpTopic', helpTopicSchema);
