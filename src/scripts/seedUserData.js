const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const FAQ = require('../models/FAQ');
const HelpTopic = require('../models/HelpTopic');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await FAQ.deleteMany({});
    await HelpTopic.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data');

    // Get or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@erp.local',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log('Created admin user');
    }

    // Seed FAQs
    const faqs = await FAQ.insertMany([
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your inbox. You will receive a link to reset your password within 10 minutes.',
        category: 'Account',
        order: 1,
        published: true
      },
      {
        question: 'How do I request access to the Finance dashboard?',
        answer: 'Go to your User Dashboard and click "Request Access". Select "Finance Dashboard" from the options and provide a message explaining why you need access. Your request will be reviewed by an administrator.',
        category: 'Finance',
        order: 1,
        published: true
      },
      {
        question: 'What is the difference between pending and in-progress status for tasks?',
        answer: 'Pending means the task has been assigned but not started. In-Progress means you have started working on the task. Complete the status to "Completed" when finished.',
        category: 'General',
        order: 1,
        published: true
      },
      {
        question: 'How do I create a new transaction?',
        answer: 'Navigate to the Finance section and click "Create Transaction". Fill in the required fields: vendor, amount, category, and date. You can optionally add a description and select a payment method.',
        category: 'Finance',
        order: 2,
        published: true
      },
      {
        question: 'What does "low stock" alert mean?',
        answer: 'When a product\'s quantity on hand falls below the reorder level, it triggers a "low stock" alert. This prompts you to reorder the product to avoid stockouts.',
        category: 'Inventory',
        order: 1,
        published: true
      },
      {
        question: 'How do I report a bug?',
        answer: 'Go to your dashboard and click "Send Feedback". Select "Bug Report" as the category and provide detailed steps to reproduce the issue. Include information about what you expected vs. what actually happened.',
        category: 'Technical',
        order: 1,
        published: true
      },
      {
        question: 'Can I undo a completed task?',
        answer: 'Yes, you can change a task status back to "In-Progress" or "Pending" at any time by clicking on the task and updating its status from the dropdown menu.',
        category: 'General',
        order: 2,
        published: true
      },
      {
        question: 'How often are notifications sent?',
        answer: 'Notifications are sent in real-time when events occur (new task assigned, announcement published, etc.). You can view all notifications in the "Notifications" tab of your dashboard.',
        category: 'Account',
        order: 2,
        published: true
      }
    ]);
    console.log(`Created ${faqs.length} FAQs`);

    // Seed Help Topics
    const helpTopics = await HelpTopic.insertMany([
      {
        title: 'Getting Started with Your Dashboard',
        content: `Welcome to the ERP System! Here's a quick guide to get you started:\n\n1. Login with your credentials\n2. You'll see your personalized dashboard\n3. Check the "Notifications" tab for important alerts\n4. Review your assigned tasks in the "Tasks" tab\n5. Read announcements for system updates\n\nIf you need access to additional dashboards (Finance or Inventory), click "Request Access" and provide a message explaining your need.`,
        category: 'Getting Started',
        tags: ['onboarding', 'dashboard', 'first-time'],
        order: 1,
        published: true
      },
      {
        title: 'Understanding Task Priority Levels',
        content: `Tasks are assigned priority levels to help you manage your workload:\n\n**High Priority**: Must be completed urgently. Usually deadline-critical.\n**Medium Priority**: Important but not immediately urgent. Standard workflow tasks.\n**Low Priority**: Can be completed when other tasks are done. Nice-to-have improvements.\n\nAlways focus on high priority tasks first to ensure critical work is completed on time.`,
        category: 'Best Practices',
        tags: ['tasks', 'priority', 'management'],
        order: 2,
        published: true
      },
      {
        title: 'How to Manage Your Notifications',
        content: `Notifications keep you informed about important events:\n\n1. **View Notifications**: Go to the "Notifications" tab on your dashboard\n2. **Mark as Read**: Click "Mark read" to indicate you've seen a notification\n3. **Notification Types**:\n   - Info (blue): General information\n   - Warning (yellow): Requires attention\n   - Error (red): Something went wrong\n   - Success (green): Action completed successfully\n\nUnread notification count appears on the dashboard for quick reference.`,
        category: 'Getting Started',
        tags: ['notifications', 'alerts'],
        order: 3,
        published: true
      },
      {
        title: 'Finance Dashboard Overview',
        content: `The Finance Dashboard provides insights into financial transactions and metrics:\n\n**Key Metrics**:\n- Total Revenue: Sum of all income transactions\n- Outstanding AR: Money owed to you by customers\n- Total Expenses: Sum of all expense transactions\n- Net Profit: Revenue minus expenses\n\n**Features**:\n- Create and manage transactions\n- View transaction history\n- Generate financial reports\n- Track payment status\n\nTo access the Finance Dashboard, request access from your User Dashboard.`,
        category: 'Finance',
        tags: ['finance', 'transactions', 'metrics'],
        order: 1,
        published: true
      },
      {
        title: 'Inventory Management Best Practices',
        content: `Effective inventory management prevents stockouts and reduces waste:\n\n**Key Steps**:\n1. **Monitor Stock Levels**: Check for low stock alerts regularly\n2. **Reorder Proactively**: Don't wait until stock hits zero\n3. **Track Products**: Use SKUs for easy product identification\n4. **Categorize Items**: Organize products by type for better management\n5. **Review Metrics**: Check inventory value and turnover rates\n\n**Tips**:\n- Set appropriate reorder levels based on usage patterns\n- Keep supplier contact information updated\n- Document inventory adjustments with reasons\n- Review ABC analysis for inventory optimization`,
        category: 'Inventory',
        tags: ['inventory', 'stock', 'optimization'],
        order: 1,
        published: true
      },
      {
        title: 'Providing Effective Feedback',
        content: `Help us improve the system by providing detailed feedback:\n\n**Feedback Categories**:\n- **Bug**: Report technical issues or unexpected behavior\n- **Feature**: Suggest new features or improvements\n- **General**: Share general comments or observations\n- **Performance**: Report system speed or responsiveness issues\n\n**How to Provide Good Feedback**:\n1. Be specific about what you observed\n2. Describe the steps to reproduce (for bugs)\n3. Include what you expected vs. what happened\n4. Mention your browser and device if relevant\n5. Attach screenshots if helpful\n\nYour feedback helps us create a better system for everyone!`,
        category: 'Troubleshooting',
        tags: ['feedback', 'support'],
        order: 2,
        published: true
      }
    ]);
    console.log(`Created ${helpTopics.length} Help Topics`);

    // Seed Announcements
    const announcements = await Announcement.insertMany([
      {
        title: 'Welcome to the ERP System',
        content: 'Welcome to our new Enterprise Resource Planning (ERP) system! This platform is designed to streamline your business operations and improve collaboration across departments.',
        author: admin._id,
        importance: 'high',
        targetRoles: ['admin', 'finance', 'inventory', 'user'],
        published: true
      },
      {
        title: 'System Maintenance Window This Sunday',
        content: 'Please note that the system will be undergoing scheduled maintenance on Sunday, 23:00 UTC to 05:00 UTC Monday. Services will be temporarily unavailable during this window. Thank you for your patience.',
        author: admin._id,
        importance: 'high',
        targetRoles: ['admin', 'finance', 'inventory', 'user'],
        published: true
      },
      {
        title: 'New Feature: Task Comments',
        content: 'We\'re excited to announce the new task comment feature! You can now add comments and collaborate on tasks directly in the system. This helps teams communicate without switching applications.',
        author: admin._id,
        importance: 'medium',
        targetRoles: ['admin', 'finance', 'inventory', 'user'],
        published: true
      },
      {
        title: 'Finance Dashboard: Q4 Reporting Ready',
        content: 'The Finance Dashboard now includes Q4 reporting features. Access advanced analytics, export reports, and generate custom financial statements for your business intelligence needs.',
        author: admin._id,
        importance: 'medium',
        targetRoles: ['admin', 'finance'],
        published: true
      },
      {
        title: 'Inventory Module: Demand Forecasting Available',
        content: 'Our AI-powered demand forecasting is now available in the Inventory module. Get intelligent predictions for product demand and optimize your stock levels accordingly.',
        author: admin._id,
        importance: 'medium',
        targetRoles: ['admin', 'inventory'],
        published: true
      }
    ]);
    console.log(`Created ${announcements.length} Announcements`);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
