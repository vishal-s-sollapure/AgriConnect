const mongoose = require('mongoose');

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  let cleaned = rawUri.trim();
  // Strip accidental < > brackets around username and password
  cleaned = cleaned.replace(/\/\/<([^:>]+)>:<([^@>]+)>@/, '//$1:$2@');
  cleaned = cleaned.replace(/\/\/([^:]+):<([^@>]+)>@/, '//$1:$2@');
  cleaned = cleaned.replace(/\/\/<([^:>]+)>:([^@]+)@/, '//$1:$2@');
  // Strip accidental double slash before database path
  cleaned = cleaned.replace(/(\.mongodb\.net|\.net)\/\/+/, '$1/');
  return cleaned;
}

const connectDB = async () => {
  try {
    const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!rawMongoUri && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI must be configured in production.');
    }

    const mongoUri = sanitizeMongoUri(rawMongoUri);
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
