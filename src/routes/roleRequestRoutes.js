const express = require('express');
const RoleRequest = require('../models/RoleRequest');
const User = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// User creates a role request
router.post('/', async (req, res) => {
  try {
    const { requestedRole, message } = req.body;
    if (!['admin','finance','inventory'].includes(requestedRole)) {
      return res.status(400).json({ error: 'Invalid requested role' });
    }
    const existingPending = await RoleRequest.findOne({ user: req.user.id, status: 'pending' });
    if (existingPending) {
      return res.status(400).json({ error: 'You already have a pending request' });
    }
    const request = await RoleRequest.create({
      user: req.user.id,
      requestedRole,
      message,
    });
    res.status(201).json(request);
  } catch (error) {
    console.error('Create role request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// User lists own requests
router.get('/mine', async (req, res) => {
  try {
    const items = await RoleRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error('List my requests error:', error);
    res.status(500).json({ error: 'Failed to list requests' });
  }
});

// Admin: list all requests
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const items = await RoleRequest.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error('List all requests error:', error);
    res.status(500).json({ error: 'Failed to list requests' });
  }
});

// Admin: approve
router.post('/:id/approve', authorize('admin'), async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });
    request.status = 'approved';
    request.decidedBy = req.user.id;
    request.decidedAt = new Date();
    await request.save();
    // Update user role
    await User.findByIdAndUpdate(request.user, { role: request.requestedRole });
    res.json({ message: 'Approved', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Admin: decline
router.post('/:id/decline', authorize('admin'), async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });
    request.status = 'declined';
    request.decidedBy = req.user.id;
    request.decidedAt = new Date();
    await request.save();
    res.json({ message: 'Declined', request });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({ error: 'Failed to decline request' });
  }
});

module.exports = router;


