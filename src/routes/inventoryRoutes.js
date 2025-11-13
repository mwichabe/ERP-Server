const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { authMiddleware, authorize } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/inventory/products
 * Fetch all inventory products with filtering and pagination
 */
router.get('/products', async (req, res) => {
  try {
    const { 
      category, 
      lowStock,
      active,
      search,
      page = 1, 
      limit = 50 
    } = req.query;

    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    let productsQuery = Product.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const products = await productsQuery;

    // Filter low stock if requested (after query to use virtual)
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(p => p.isLowStock);
    }

    const total = await Product.countDocuments(query);

    res.json({
      products: filteredProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/inventory/products/:id
 * Fetch a single product by ID
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/inventory/products
 * Create a new product
 */
router.post('/products', [
  authorize('admin', 'inventory'),
  body('sku').trim().notEmpty().toUpperCase(),
  body('name').trim().notEmpty(),
  body('unitCost').isFloat({ min: 0 }),
  body('quantityOnHand').optional().isInt({ min: 0 }),
  body('reorderLevel').optional().isInt({ min: 0 }),
  body('category').trim().notEmpty()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this SKU already exists' });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/inventory/products/:id
 * Update a product
 */
router.put('/products/:id', [
  authorize('admin', 'inventory'),
  body('sku').optional().trim().notEmpty().toUpperCase(),
  body('name').optional().trim().notEmpty(),
  body('unitCost').optional().isFloat({ min: 0 }),
  body('quantityOnHand').optional().isInt({ min: 0 }),
  body('reorderLevel').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If updating SKU, check for duplicates
    if (req.body.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku,
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({ error: 'Product with this SKU already exists' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * PATCH /api/inventory/products/:id/restock
 * Restock a product (increase quantity)
 */
router.patch('/products/:id/restock', [
  authorize('admin', 'inventory'),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.quantityOnHand += req.body.quantity;
    product.lastRestocked = new Date();
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ error: 'Failed to restock product' });
  }
});

/**
 * PATCH /api/inventory/products/:id/adjust
 * Adjust product quantity (increase or decrease)
 */
router.patch('/products/:id/adjust', [
  authorize('admin', 'inventory'),
  body('quantity').isInt(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = product.quantityOnHand + req.body.quantity;
    
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient quantity' });
    }

    product.quantityOnHand = newQuantity;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error adjusting product:', error);
    res.status(500).json({ error: 'Failed to adjust product' });
  }
});

/**
 * DELETE /api/inventory/products/:id
 * Delete a product (soft delete by setting isActive to false)
 */
router.delete('/products/:id', authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deactivated successfully', product });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/**
 * GET /api/inventory/metrics
 * Fetch inventory metrics summary
 */
router.get('/metrics', async (req, res) => {
  try {
    // Get all active products
    const products = await Product.find({ isActive: true });

    // Calculate metrics
    const totalItems = products.reduce((sum, p) => sum + p.quantityOnHand, 0);
    const lowStockItems = products.filter(p => p.isLowStock).length;
    const totalValue = products.reduce((sum, p) => sum + p.totalValue, 0);
    
    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];

    res.json({
      totalItems,
      lowStockItems,
      totalValue: Math.round(totalValue * 100) / 100,
      categoriesCount: categories.length,
      totalProducts: products.length,
      categories
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/inventory/low-stock
 * Fetch products with low stock
 */
router.get('/low-stock', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const lowStockProducts = products.filter(p => p.isLowStock);

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

module.exports = router;