const mongoose = require('mongoose');

// Helper function to check if a string is non-empty
const isNonEmptyString = (str) => typeof str === 'string' && str.trim().length > 0;

const connectDB = async () => {
  // Use the MONGODB_URI environment variable
  const mongoUri = process.env.MONGODB_URI;
  
  try {
    // Correctly check if the connection string is missing or empty
    if (!isNonEmptyString(mongoUri)) {
      throw new Error('MONGODB_URI is not defined or is empty in environment variables');
    }

    // Connection options for Mongoose 8.x
    const conn = await mongoose.connect(mongoUri, {
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
    // Only display the connection string status without revealing the secret itself
    console.error(`Connection String Status: ${isNonEmptyString(mongoUri) ? 'Provided (check connection details)' : 'Missing'}`);
    
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ENETUNREACH')) {
      console.error('Unable to reach MongoDB server. Please check:');
      console.error('1. Is the MongoDB server running?');
      console.error('2. Is the connection string correct?');
      console.error('3. Are there firewall/network restrictions?');
      console.error('4. For remote servers, is the IP whitelisted?');
    } else if (error.message.includes('MONGODB_URI is not defined')) {
        // Specific error for missing URI
        console.error('ACTION REQUIRED: Please set the MONGODB_URI variable in your .env file.');
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