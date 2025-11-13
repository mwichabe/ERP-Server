/**
 * Database Seeding Script
 * Run this script to populate the database with initial data
 * Usage: node src/scripts/seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mwichabecollins:CYncuUqsdWkX7F7q@cluster0.wrcfgw9.mongodb.net/');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@erp.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'finance@erp.com',
      password: 'finance123',
      name: 'Finance Manager',
      role: 'finance'
    },
    {
      email: 'inventory@erp.com',
      password: 'inventory123',
      name: 'Inventory Manager',
      role: 'inventory'
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✓ Seeded ${createdUsers.length} users`);
  return createdUsers;
};

const seedProducts = async () => {
  const products = [
    {
      sku: 'PROD-001',
      name: 'Premium Widget A',
      quantityOnHand: 450,
      unitCost: 25.50,
      reorderLevel: 100,
      category: 'Electronics',
      supplier: 'TechSupply Inc',
      location: 'Warehouse A'
    },
    {
      sku: 'PROD-002',
      name: 'Standard Component B',
      quantityOnHand: 230,
      unitCost: 18.75,
      reorderLevel: 150,
      category: 'Components',
      supplier: 'Parts Direct',
      location: 'Warehouse A'
    },
    {
      sku: 'PROD-003',
      name: 'Industrial Tool C',
      quantityOnHand: 85,
      unitCost: 150.00,
      reorderLevel: 50,
      category: 'Tools',
      supplier: 'Industrial Supplies Co',
      location: 'Warehouse B'
    },
    {
      sku: 'PROD-004',
      name: 'Safety Equipment D',
      quantityOnHand: 320,
      unitCost: 45.25,
      reorderLevel: 200,
      category: 'Safety',
      supplier: 'SafetyFirst Ltd',
      location: 'Warehouse A'
    },
    {
      sku: 'PROD-005',
      name: 'Office Supply E',
      quantityOnHand: 890,
      unitCost: 8.50,
      reorderLevel: 300,
      category: 'Office',
      supplier: 'Office Depot',
      location: 'Warehouse C'
    },
    {
      sku: 'PROD-006',
      name: 'Professional Monitor F',
      quantityOnHand: 45,
      unitCost: 320.00,
      reorderLevel: 20,
      category: 'Electronics',
      supplier: 'TechSupply Inc',
      location: 'Warehouse B'
    },
    {
      sku: 'PROD-007',
      name: 'Network Cable G',
      quantityOnHand: 1200,
      unitCost: 2.75,
      reorderLevel: 500,
      category: 'Components',
      supplier: 'NetworkPro',
      location: 'Warehouse C'
    },
    {
      sku: 'PROD-008',
      name: 'Power Tool H',
      quantityOnHand: 65,
      unitCost: 185.50,
      reorderLevel: 40,
      category: 'Tools',
      supplier: 'Industrial Supplies Co',
      location: 'Warehouse B'
    }
  ];

  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(products);
  console.log(`✓ Seeded ${createdProducts.length} products`);
  return createdProducts;
};

const seedTransactions = async (users) => {
  const adminUser = users.find(u => u.role === 'admin');
  
  const transactions = [
    {
      date: new Date('2024-01-15'),
      vendor: 'Acme Corp',
      amount: 15000,
      status: 'completed',
      category: 'Revenue',
      description: 'Product sales - January batch',
      invoiceNumber: 'INV-2024-001',
      paymentMethod: 'bank_transfer',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-01-20'),
      vendor: 'TechSupply Inc',
      amount: 3500,
      status: 'completed',
      category: 'Expense',
      description: 'Electronic components purchase',
      invoiceNumber: 'INV-2024-002',
      paymentMethod: 'credit',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-01-25'),
      vendor: 'Global Industries',
      amount: 22000,
      status: 'completed',
      category: 'Revenue',
      description: 'Bulk order fulfillment',
      invoiceNumber: 'INV-2024-003',
      paymentMethod: 'bank_transfer',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-01'),
      vendor: 'Office Depot',
      amount: 850,
      status: 'completed',
      category: 'Expense',
      description: 'Office supplies',
      invoiceNumber: 'INV-2024-004',
      paymentMethod: 'debit',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-05'),
      vendor: 'Manufacturing Co',
      amount: 28000,
      status: 'pending',
      category: 'Revenue',
      description: 'Contract manufacturing project',
      invoiceNumber: 'INV-2024-005',
      paymentMethod: 'bank_transfer',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-10'),
      vendor: 'Industrial Supplies Co',
      amount: 5200,
      status: 'completed',
      category: 'Expense',
      description: 'Industrial tools and equipment',
      invoiceNumber: 'INV-2024-006',
      paymentMethod: 'credit',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-15'),
      vendor: 'Retail Partners Ltd',
      amount: 18500,
      status: 'completed',
      category: 'Revenue',
      description: 'Retail distribution',
      invoiceNumber: 'INV-2024-007',
      paymentMethod: 'bank_transfer',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-20'),
      vendor: 'Logistics Express',
      amount: 1500,
      status: 'completed',
      category: 'Expense',
      description: 'Shipping and logistics',
      invoiceNumber: 'INV-2024-008',
      paymentMethod: 'debit',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-02-25'),
      vendor: 'Enterprise Solutions',
      amount: 32000,
      status: 'completed',
      category: 'Revenue',
      description: 'Enterprise licensing deal',
      invoiceNumber: 'INV-2024-009',
      paymentMethod: 'bank_transfer',
      createdBy: adminUser._id
    },
    {
      date: new Date('2024-03-01'),
      vendor: 'Parts Direct',
      amount: 4500,
      status: 'completed',
      category: 'Expense',
      description: 'Component restocking',
      invoiceNumber: 'INV-2024-010',
      paymentMethod: 'credit',
      createdBy: adminUser._id
    }
  ];

  await Transaction.deleteMany({});
  const createdTransactions = await Transaction.insertMany(transactions);
  console.log(`✓ Seeded ${createdTransactions.length} transactions`);
  return createdTransactions;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting database seeding...\n');
    
    const users = await seedUsers();
    const products = await seedProducts();
    const transactions = await seedTransactions(users);
    
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Default login credentials:');
    console.log('  Admin:     admin@erp.com / admin123');
    console.log('  Finance:   finance@erp.com / finance123');
    console.log('  Inventory: inventory@erp.com / inventory123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();