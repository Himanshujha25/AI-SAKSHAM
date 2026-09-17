require('dotenv').config();

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'https://ai-saksham-mocha.vercel.app',
  'https://ai-saksham.vercel.app',
];

const envUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

const clientUrls = Array.from(new Set([...defaultOrigins, ...envUrls]));

let rawMongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakshamai';
if (rawMongoUri.includes('.mongodb.net/') && (rawMongoUri.includes('.mongodb.net/?') || rawMongoUri.endsWith('.mongodb.net/'))) {
  rawMongoUri = rawMongoUri.replace('.mongodb.net/', '.mongodb.net/sakshamai');
}

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: clientUrls[0],
  clientUrls,
  mongoUri: rawMongoUri,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
};

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = env;
