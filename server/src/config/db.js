const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Fix for Windows ISP DNS SRV lookup failures on mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if setServers is restricted
}

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
