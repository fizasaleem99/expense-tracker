const mongoose = require('mongoose');

async function connectDB() {
  try {
    const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
