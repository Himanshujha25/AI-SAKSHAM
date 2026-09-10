const mongoose = require('mongoose');
const env = require('./env');

let connected = false;

async function connectDB() {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.warn('[db] MongoDB connection failed:', err.message);
    console.warn('[db] Server keeps running (health check OK). Set MONGODB_URI to enable APIs.');
  }
  return mongoose.connection;
}

module.exports = { connectDB, get mongoose() { return mongoose; } };
