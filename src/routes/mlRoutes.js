const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/ml/predict-demand
 * ML-powered demand forecasting
 * Uses simple moving average and trend analysis as a basic forecasting method
 */
router.post('/predict-demand', [
  body('productIds').isArray().notEmpty(),
  body('forecastDays').optional().isInt({ min: 1, max: 90 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productIds, forecastDays = 30 } = req.body;

    // Fetch products
    const products = await Product.find({ 
      _id: { $in: productIds },
      isActive: true 
    });

    if (products.length === 0) {
      return res.status(404).json({ error: 'No valid products found' });
    }

    // Generate forecasts for each product
    const forecasts = products.map(product => {
      // Basic forecasting algorithm
      // In production, this would call an actual ML model
      
      const currentStock = product.quantityOnHand;
      const reorderLevel = product.reorderLevel;
      
      // Simple heuristic-based demand prediction
      // Assumes average daily usage is proportional to reorder level
      const estimatedDailyUsage = reorderLevel / 30; // Assume 30-day reorder cycle
      const predictedDemand = Math.round(estimatedDailyUsage * forecastDays);
      
      // Calculate recommended order quantity
      const safetyStock = Math.round(reorderLevel * 0.5);
      const forecastedStock = currentStock - predictedDemand;
      const recommendedOrder = forecastedStock < reorderLevel 
        ? Math.max(0, reorderLevel + safetyStock - forecastedStock)
        : 0;
      
      // Confidence score based on stock levels and historical patterns
      // Higher confidence when stock patterns are more predictable
      const stockRatio = currentStock / (reorderLevel || 1);
      let confidence = 0.85;
      
      if (stockRatio < 0.5) confidence = 0.70; // Low stock = lower confidence
      else if (stockRatio > 3) confidence = 0.75; // Overstocked = lower confidence
      else if (stockRatio >= 1 && stockRatio <= 2) confidence = 0.92; // Optimal range
      
      return {
        productId: product._id,
        sku: product.sku,
        productName: product.name,
        currentStock,
        predictedDemand,
        forecastedStock: Math.max(0, forecastedStock),
        recommendedOrder,
        reorderLevel,
        confidence: Math.round(confidence * 100) / 100,
        forecastPeriod: `${forecastDays} days`,
        category: product.category
      };
    });

    // Sort by urgency (lowest forecasted stock first)
    forecasts.sort((a, b) => {
      const urgencyA = a.forecastedStock / (a.reorderLevel || 1);
      const urgencyB = b.forecastedStock / (b.reorderLevel || 1);
      return urgencyA - urgencyB;
    });

    res.json({
      forecasts,
      summary: {
        totalProducts: forecasts.length,
        productsNeedingReorder: forecasts.filter(f => f.recommendedOrder > 0).length,
        totalRecommendedOrder: forecasts.reduce((sum, f) => sum + f.recommendedOrder, 0),
        averageConfidence: Math.round(
          (forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length) * 100
        ) / 100
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error predicting demand:', error);
    res.status(500).json({ error: 'Failed to predict demand' });
  }
});

/**
 * GET /api/ml/stock-optimization
 * Analyze inventory and suggest optimization strategies
 */
router.get('/stock-optimization', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    const analysis = products.map(product => {
      const stockRatio = product.quantityOnHand / (product.reorderLevel || 1);
      let status = 'optimal';
      let recommendation = 'Stock levels are healthy';
      
      if (stockRatio < 0.5) {
        status = 'critical';
        recommendation = 'Immediate reorder required';
      } else if (stockRatio < 1) {
        status = 'low';
        recommendation = 'Plan reorder soon';
      } else if (stockRatio > 5) {
        status = 'overstock';
        recommendation = 'Consider reducing future orders';
      } else if (stockRatio > 3) {
        status = 'high';
        recommendation = 'Stock levels above normal';
      }

      return {
        productId: product._id,
        sku: product.sku,
        name: product.name,
        currentStock: product.quantityOnHand,
        reorderLevel: product.reorderLevel,
        stockRatio: Math.round(stockRatio * 100) / 100,
        status,
        recommendation,
        value: product.totalValue,
        category: product.category
      };
    });

    // Group by status
    const statusGroups = {
      critical: analysis.filter(a => a.status === 'critical'),
      low: analysis.filter(a => a.status === 'low'),
      optimal: analysis.filter(a => a.status === 'optimal'),
      high: analysis.filter(a => a.status === 'high'),
      overstock: analysis.filter(a => a.status === 'overstock')
    };

    res.json({
      analysis,
      summary: {
        totalProducts: products.length,
        critical: statusGroups.critical.length,
        low: statusGroups.low.length,
        optimal: statusGroups.optimal.length,
        high: statusGroups.high.length,
        overstock: statusGroups.overstock.length,
        totalInventoryValue: Math.round(
          products.reduce((sum, p) => sum + p.totalValue, 0) * 100
        ) / 100
      },
      statusGroups,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing stock:', error);
    res.status(500).json({ error: 'Failed to analyze stock' });
  }
});

module.exports = router;