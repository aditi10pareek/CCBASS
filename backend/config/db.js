const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  const connString = process.env.MONGODB_URI;

  if (connString) {
    try {
      console.log('Connecting to configured MongoDB database...');
      const conn = await mongoose.connect(connString, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);

      // Auto-seed if database is completely empty
      try {
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('Database is empty. Seeding initial demo data...');
          const seedData = require('../seed');
          await seedData(false);
          console.log('Seeding completed.');
        }
      } catch (seedErr) {
        console.warn('Initial seeding check skipped:', seedErr.message);
      }

      return conn;
    } catch (error) {
      console.warn(`\n[WARNING] Configured MongoDB connection failed: ${error.message}`);
      console.warn('Switching to local In-Memory MongoDB so the server remains fully operational...\n');
    }
  }

  // Fallback to In-Memory MongoDB
  try {
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[NyaayFlow] In-Memory MongoDB ready at ${uri}`);

    // Auto-seed demo accounts and court data
    try {
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[NyaayFlow] Populating demo accounts (Admin, Clerk, Judge, Lawyer) and court cases...');
        const seedData = require('../seed');
        await seedData(false);
        console.log('[NyaayFlow] Demo accounts and court records populated successfully.');
      }
    } catch (seedErr) {
      console.error('[NyaayFlow] Demo seeding error:', seedErr.message);
    }

    return conn;
  } catch (err) {
    console.error(`Fatal: Failed to start database: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
