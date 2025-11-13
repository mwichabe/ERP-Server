const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { authMiddleware, authorize } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/finance/transactions
 * Fetch all financial transactions with filtering and pagination
 */
router.get('/transactions', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/finance/transactions/:id
 * Fetch a single transaction by ID
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * POST /api/finance/transactions
 * Create a new transaction
 */
router.post('/transactions', [
  authorize('admin', 'finance'),
  body('vendor').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('category').isIn(['Revenue', 'Expense', 'Asset', 'Liability']),
  body('status').optional().isIn(['pending', 'completed', 'cancelled', 'failed'])
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transactionData = {
      ...req.body,
      createdBy: req.user.id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * PUT /api/finance/transactions/:id
 * Update a transaction
 */
router.put('/transactions/:id', [
  authorize('admin', 'finance'),
  body('vendor').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'completed', 'cancelled', 'failed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

/**
 * DELETE /api/finance/transactions/:id
 * Delete a transaction
 */
router.delete('/transactions/:id', authorize('admin', 'finance'), async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

/**
 * GET /api/finance/metrics
 * Fetch financial metrics summary
 */
router.get('/metrics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Calculate metrics using aggregation
    const metrics = await Transaction.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const metricsMap = metrics.reduce((acc, item) => {
      acc[item._id.toLowerCase()] = item.total;
      return acc;
    }, {});

    const totalRevenue = metricsMap.revenue || 0;
    const totalExpenses = metricsMap.expense || 0;
    const outstandingAR = await Transaction.aggregate([
      { 
        $match: { 
          status: 'pending', 
          category: 'Revenue',
          ...dateFilter
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0);

    res.json({
      totalRevenue,
      outstandingAR,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalAssets: metricsMap.asset || 0,
      totalLiabilities: metricsMap.liability || 0
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;