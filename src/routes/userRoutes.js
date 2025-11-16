const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const Notification = require('../models/Notification');
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');
const FAQ = require('../models/FAQ');
const HelpTopic = require('../models/HelpTopic');
const Feedback = require('../models/Feedback');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * ========================================
 * NOTIFICATIONS ENDPOINTS
 * ========================================
 */

/**
 * GET /api/user/notifications
 * Fetch all notifications for the authenticated user
 * Query params: limit (default 20), skip (default 0)
 */
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments({ userId });

    return res.json({
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/user/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * ========================================
 * TASKS ENDPOINTS
 * ========================================
 */

/**
 * GET /api/user/tasks
 * Fetch all tasks assigned to the authenticated user
 * Query params: status, priority, limit, skip
 */
router.get('/tasks', async (req, res) => {
  try {
    const { status, priority, limit = 20, skip = 0 } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Task.countDocuments(filter);

    return res.json({
      tasks,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * PATCH /api/user/tasks/:id
 * Update a task status or other fields
 * Body: { status, priority, description, dueDate }
 */
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, priority, description, dueDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (description !== undefined) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * POST /api/user/tasks
 * Create a new task for the authenticated user
 * Body: { title, description, priority, dueDate }
 */
router.post('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority = 'medium', dueDate } = req.body;

    // Validation 
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    const task = new Task({
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: 'pending',
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      assignedBy: userId, // Self-assigned
      tags: [],
      attachments: [],
      comments: []
    });

    await task.save();

    // Populate assignedBy for response
    await task.populate('assignedBy', 'name email');

    return res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * ========================================
 * ANNOUNCEMENTS ENDPOINT
 * ========================================
 */

/**
 * GET /api/user/announcements
 * Fetch announcements visible to the authenticated user's role
 * Query params: limit, skip
 */
router.get('/announcements', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const userRole = req.user.role;

    const announcements = await Announcement.find({
      published: true,
      targetRoles: { $in: [userRole] },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Announcement.countDocuments({
      published: true,
      targetRoles: { $in: [userRole] }
    });

    return res.json({
      announcements,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

/**
 * ========================================
 * HELP TOPICS ENDPOINT
 * ========================================
 */

/**
 * GET /api/user/help-topics
 * Fetch all published help topics
 * Query params: category, limit, skip
 */
router.get('/help-topics', async (req, res) => {
  try {
    const { category, limit = 20, skip = 0 } = req.query;

    const filter = { published: true };
    if (category) filter.category = category;

    const topics = await HelpTopic.find(filter)
      .select('_id title category tags viewCount order')
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HelpTopic.countDocuments(filter);

    return res.json({
      topics,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching help topics:', error);
    return res.status(500).json({ error: 'Failed to fetch help topics' });
  }
});

/**
 * ========================================
 * FAQ ENDPOINT
 * ========================================
 */

/**
 * GET /api/user/faqs
 * Fetch all published FAQs
 * Query params: category, limit, skip
 */
router.get('/faqs', async (req, res) => {
  try {
    const { category, limit = 20, skip = 0 } = req.query;

    const filter = { published: true };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter)
      .select('_id question answer category helpful notHelpful order')
      .sort({ order: 1, viewCount: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await FAQ.countDocuments(filter);

    return res.json({
      faqs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

/**
 * ========================================
 * FEEDBACK ENDPOINT
 * ========================================
 */

/**
 * POST /api/user/feedback
 * Submit user feedback
 * Body: { message, category (bug|feature|general|performance) }
 */
router.post('/feedback', async (req, res) => {
  try {
    const { message, category = 'general' } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    // Validate message length
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message must not exceed 5000 characters' });
    }

    // Create feedback document
    const feedback = new Feedback({
      userId,
      message: message.trim(),
      category,
      email,
      userAgent: req.headers['user-agent'] || null
    });

    await feedback.save();

    // Send email notification to admin (optional)
    try {
      const adminEmail = process.env.SUPPORT_EMAIL_TO || 'mwichabecollins@gmail.com';
      let transporter;

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 465,
          secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject: `New Feedback: ${category.toUpperCase()} from ${req.user.name}`,
        html: `
          <h2>New User Feedback</h2>
          <p><strong>User:</strong> ${req.user.name} (${email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Feedback ID: ${feedback._id}</small></p>
        `
      });
    } catch (emailError) {
      console.error('Error sending feedback notification email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
