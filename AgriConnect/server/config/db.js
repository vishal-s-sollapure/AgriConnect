const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Non-fatal warning log for offline development environments
    console.warn(`[Database Warning] Running in decoupled state. Database features will fallback to memory layer if database is unavailable.`);
  }
};

module.exports = connectDB;
