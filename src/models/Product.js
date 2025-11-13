const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantityOnHand: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  supplier: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.quantityOnHand <= this.reorderLevel;
});

// Virtual for total value
productSchema.virtual('totalValue').get(function() {
  return this.quantityOnHand * this.unitCost;
});

// Include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for faster queries
//productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);