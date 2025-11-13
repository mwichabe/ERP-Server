const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if connection string is provided
    if (!process.env.MONGODB_URI || 'mongodb+srv://mwichabecollins:CYncuUqsdWkX7F7q@cluster0.wrcfgw9.mongodb.net/') {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options for Mongoose 8.x
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mwichabecollins:CYncuUqsdWkX7F7q@cluster0.wrcfgw9.mongodb.net/', {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      retryWrites: true, // Enable retryable writes
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Create indexes for better performance
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Connection String: ${process.env.MONGODB_URI||"mongodb+srv://mwichabecollins:CYncuUqsdWkX7F7q@cluster0.wrcfgw9.mongodb.net/" ? 'Provided' : 'Missing'}`);
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ENETUNREACH')) {
      console.error('Unable to reach MongoDB server. Please check:');
      console.error('1. Is the MongoDB server running?');
      console.error('2. Is the connection string correct?');
      console.error('3. Are there firewall/network restrictions?');
      console.error('4. For remote servers, is the IP whitelisted?');
    }
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Indexes will be created by mongoose schemas
    console.log('Database indexes ready');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;