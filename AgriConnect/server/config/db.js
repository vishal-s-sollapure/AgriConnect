const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI must be configured in production.');
    }

    const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/agriconnect');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn(`[Database Warning] Running in decoupled state. Database features will fallback to memory layer if database is unavailable.`);
  }
};

module.exports = connectDB;
