const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Fix for Windows ISP DNS SRV lookup failures on mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if setServers is restricted
}

let isConnecting = false;
let reconnectTimer = null;

// If an ISP or Windows firewall blocks local UDP SRV queries on port 53,
// automatically resolve the MongoDB Atlas SRV & TXT records over HTTPS.
async function resolveSrvFallback(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;
  try {
    const withoutPrefix = uri.replace('mongodb+srv://', '');
    const [authAndHost, query] = withoutPrefix.split('?');
    const atIdx = authAndHost.lastIndexOf('@');
    const auth = atIdx !== -1 ? authAndHost.slice(0, atIdx) : '';
    const hostPath = atIdx !== -1 ? authAndHost.slice(atIdx + 1) : authAndHost;
    const [hostname, dbName] = hostPath.split('/');

    const srvRes = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${hostname}&type=SRV`).then((r) => r.json());
    if (!srvRes.Answer || !srvRes.Answer.length) return uri;

    const hosts = srvRes.Answer.map((a) => {
      const parts = a.data.trim().split(/\s+/);
      const port = parts[2];
      const target = parts[3].replace(/\.$/, '');
      return `${target}:${port}`;
    }).join(',');

    const txtRes = await fetch(`https://dns.google/resolve?name=${hostname}&type=TXT`).then((r) => r.json()).catch(() => null);
    const txtData = txtRes?.Answer?.[0]?.data?.replace(/^"|"$/g, '') || '';

    const options = ['ssl=true'];
    if (txtData) options.push(txtData);
    if (query) options.push(query);

    const creds = auth ? `${auth}@` : '';
    const db = dbName || 'sakshamai';
    const fallbackUri = `mongodb://${creds}${hosts}/${db}?${options.join('&')}`;
    console.log('[db] Resolved SRV via secure DoH fallback');
    return fallbackUri;
  } catch (e) {
    return uri;
  }
}

async function connectDB(retryCount = 0) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return mongoose.connection;

  isConnecting = true;
  mongoose.set('strictQuery', true);

  let targetUri = env.mongoUri;
  try {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    isConnecting = false;
    console.log('[db] MongoDB connected successfully');
  } catch (err) {
    // If SRV ECONNREFUSED occurs, attempt instant DoH resolution fallback
    if (targetUri.startsWith('mongodb+srv://') && /ECONNREFUSED/i.test(err.message)) {
      try {
        console.warn('[db] SRV query blocked by ISP/firewall. Attempting DoH fallback...');
        const resolvedUri = await resolveSrvFallback(targetUri);
        if (resolvedUri !== targetUri) {
          await mongoose.connect(resolvedUri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
          });
          isConnecting = false;
          console.log('[db] MongoDB connected successfully via DoH fallback');
          return mongoose.connection;
        }
      } catch (fallbackErr) {
        console.warn('[db] DoH fallback failed:', fallbackErr.message);
      }
    }

    isConnecting = false;
    console.warn(`[db] MongoDB connection attempt ${retryCount + 1} failed:`, err.message);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB(retryCount + 1);
      }, 5000);
    }
  }

  return mongoose.connection;
}

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected. Attempting reconnection in 5s...');
  if (!reconnectTimer) {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectDB();
    }, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB connection error:', err.message);
});

module.exports = { connectDB, get mongoose() { return mongoose; } };
