const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Notification = require('./src/models/Notification');
const Task = require('./src/models/Task');
const Announcement = require('./src/models/Announcement');
const FAQ = require('./src/models/FAQ');
const HelpTopic = require('./src/models/HelpTopic');
const User = require('./src/models/User');

const connectDB = require('./src/config/database');

const verifyData = async () => {
  try {
    await connectDB();
    console.log('\n📊 CURRENT DATABASE CONTENTS:\n');

    // Get test user
    const testUser = await User.findOne({ email: 'user@erp.local' });
    if (testUser) {
      console.log(`👤 Test User Found: ${testUser.email} (ID: ${testUser._id})`);
      console.log(`   Role: ${testUser.role}\n`);
    }

    // Count all data
    const notifCount = await Notification.countDocuments();
    const taskCount = await Task.countDocuments();
    const announcementCount = await Announcement.countDocuments();
    const faqCount = await FAQ.countDocuments();
    const helpCount = await HelpTopic.countDocuments();

    console.log('📈 DATA COUNTS:');
    console.log(`   • Notifications: ${notifCount}`);
    console.log(`   • Tasks: ${taskCount}`);
    console.log(`   • Announcements: ${announcementCount}`);
    console.log(`   • FAQs: ${faqCount}`);
    console.log(`   • Help Topics: ${helpCount}\n`);

    // Get sample notifications
    const notifications = await Notification.find({ userId: testUser._id }).limit(3);
    if (notifications.length > 0) {
      console.log('🔔 SAMPLE NOTIFICATIONS:');
      notifications.forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.title}`);
        console.log(`      Type: ${n.type} | Read: ${n.read}`);
      });
      console.log('');
    }

    // Get sample tasks
    const tasks = await Task.find({ userId: testUser._id }).limit(3);
    if (tasks.length > 0) {
      console.log('✓ SAMPLE TASKS:');
      tasks.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title}`);
        console.log(`      Status: ${t.status} | Priority: ${t.priority}`);
      });
      console.log('');
    }

    // Get sample announcements
    const announcements = await Announcement.find().limit(2);
    if (announcements.length > 0) {
      console.log('📢 SAMPLE ANNOUNCEMENTS:');
      announcements.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.title}`);
        console.log(`      Importance: ${a.importance}`);
      });
      console.log('');
    }

    console.log('✅ Verification complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  }
};

verifyData();
