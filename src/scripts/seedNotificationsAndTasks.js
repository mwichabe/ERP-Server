const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get or create test user with role 'user'
    let testUser = await User.findOne({ email: 'user@erp.local' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Regular User',
        email: 'user@erp.local',
        password: 'UserPassword123!',
        role: 'user'
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }

    // Get admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@erp.local',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log('✅ Created admin user');
    }

    // Clear existing notifications and tasks for this user
    await Notification.deleteMany({ userId: testUser._id });
    await Task.deleteMany({ userId: testUser._id });
    console.log('🗑️  Cleared existing notifications and tasks');

    // Seed Notifications
    const notifications = await Notification.insertMany([
      {
        userId: testUser._id,
        title: 'Welcome to ERP System',
        message: 'Welcome! Your account has been activated. You can now access your personal dashboard and submit feedback.',
        type: 'success',
        read: false,
        actionUrl: '/dashboard'
      },
      {
        userId: testUser._id,
        title: 'Task Assigned: Q4 Inventory Review',
        message: 'You have been assigned a new task to review Q4 inventory levels. Please complete by end of month.',
        type: 'info',
        read: false,
        actionUrl: '/dashboard?tab=tasks'
      },
      {
        userId: testUser._id,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday 23:00 UTC. Services will be temporarily unavailable.',
        type: 'warning',
        read: false,
        actionUrl: null
      },
      {
        userId: testUser._id,
        title: 'New Feature Available',
        message: 'Check out our new task comment feature! You can now collaborate with your team directly in the system.',
        type: 'info',
        read: true,
        actionUrl: '/help'
      },
      {
        userId: testUser._id,
        title: 'Finance Report Ready',
        message: 'Your requested Q3 financial report has been generated and is ready for download.',
        type: 'success',
        read: true,
        actionUrl: '/finance'
      },
      {
        userId: testUser._id,
        title: 'Budget Alert',
        message: 'Current spending has reached 85% of monthly budget. Please review expenditures.',
        type: 'warning',
        read: false,
        actionUrl: '/finance'
      }
    ]);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Seed Tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    const tasks = await Task.insertMany([
      {
        userId: testUser._id,
        title: 'Review Monthly Budget Report',
        description: 'Analyze the monthly budget report and identify any discrepancies. Check vendor invoices against recorded amounts.',
        status: 'pending',
        priority: 'high',
        dueDate: tomorrow.toISOString(),
        assignedBy: admin._id,
        tags: ['budget', 'finance', 'urgent'],
        attachments: [],
        comments: [
          {
            userId: admin._id,
            text: 'Please prioritize this - needed for board meeting',
            createdAt: new Date()
          }
        ]
      },
      {
        userId: testUser._id,
        title: 'Update Inventory Stock Levels',
        description: 'Go through warehouse inventory and update stock levels in the system. Pay special attention to items marked as low stock.',
        status: 'in-progress',
        priority: 'medium',
        dueDate: nextWeek.toISOString(),
        assignedBy: admin._id,
        tags: ['inventory', 'stock', 'warehouse'],
        attachments: [],
        comments: []
      },
      {
        userId: testUser._id,
        title: 'Complete User Training Module',
        description: 'Complete the mandatory ERP system training module. This should take approximately 2-3 hours. Access the training portal from the Help menu.',
        status: 'pending',
        priority: 'medium',
        dueDate: nextWeek.toISOString(),
        assignedBy: admin._id,
        tags: ['training', 'compliance'],
        attachments: [],
        comments: []
      },
      {
        userId: testUser._id,
        title: 'Generate Q3 Financial Report',
        description: 'Generate comprehensive Q3 financial report including revenue analysis, expense breakdown, and profit/loss summary. Use the Finance Dashboard analytics tool.',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
        assignedBy: admin._id,
        tags: ['finance', 'reporting', 'quarterly'],
        attachments: [],
        comments: [
          {
            userId: admin._id,
            text: 'Include trend analysis from previous quarters',
            createdAt: new Date()
          }
        ]
      },
      {
        userId: testUser._id,
        title: 'Reconcile Bank Statements',
        description: 'Match all bank transactions from the past month against recorded transactions in the system. Document any discrepancies found.',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        assignedBy: admin._id,
        tags: ['finance', 'reconciliation'],
        attachments: [],
        comments: [
          {
            userId: testUser._id,
            text: 'All transactions reconciled successfully',
            createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        userId: testUser._id,
        title: 'Audit Supplier Contracts',
        description: 'Review all active supplier contracts and verify terms, pricing, and renewal dates. Update the supplier database with any changes.',
        status: 'pending',
        priority: 'low',
        dueDate: nextMonth.toISOString(),
        assignedBy: admin._id,
        tags: ['procurement', 'contracts'],
        attachments: [],
        comments: []
      }
    ]);
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ✅ DATABASE SEEDING COMPLETE        ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n📊 DATA SUMMARY:');
    console.log(`   • ${notifications.length} Notifications seeded`);
    console.log(`   • ${tasks.length} Tasks seeded`);
    console.log(`   • Test User: ${testUser.email}`);
    console.log(`   • Test User Role: ${testUser.role}`);
    console.log(`\n🔐 Test Credentials:`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: UserPassword123!`);
    console.log(`\n📋 Task Summary:`);
    console.log(`   • High Priority: 2 tasks`);
    console.log(`   • Medium Priority: 2 tasks`);
    console.log(`   • Low Priority: 1 task`);
    console.log(`   • Completed: 1 task`);
    console.log(`\n✨ Your dashboard should now display all seeded data!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
