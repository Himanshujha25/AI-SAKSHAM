const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {
  // Fallback if setServers is restricted
}

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');

let serverInstance = null;

async function main() {
  await connectDB();
  // Crash recovery: jobs stuck in RUNNING from a previous process can never
  // complete (in-process queue). Mark them FAILED so DB state stays truthful.
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const Assessment = require('./src/models/Assessment');
      const res = await Assessment.updateMany(
        { status: { $in: ['RUNNING', 'QUEUED'] } },
        { $set: { status: 'FAILED' } }
      );
      if (res.modifiedCount > 0) console.log(`[server] recovered ${res.modifiedCount} stale assessment(s) -> FAILED`);
    }
  } catch (e) {
    console.warn('[server] recovery skipped:', e.message);
  }
  const server = http.createServer(app);
  serverInstance = server;
  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        const isWhitelisted =
          env.clientUrls.includes(cleanOrigin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin) ||
          /^https:\/\/ai-saksham.*\.vercel\.app$/.test(cleanOrigin);

        if (isWhitelisted) return cb(null, true);
        return cb(new Error('CORS blocked for socket origin'));
      },
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('error', (err) => {
      console.warn('[socket] client error:', err.message);
    });
    socket.on('assessment:subscribe', (assessmentId) => {
      if (assessmentId) socket.join(`assessment:${assessmentId}`);
    });
  });

  server.on('error', (err) => {
    console.error('[server] HTTP server error:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] Port ${env.port} is already in use. Retrying in 2s...`);
      setTimeout(() => {
        server.close();
        server.listen(env.port);
      }, 2000);
    }
  });

  server.listen(env.port, () => {
    console.log(`[server] Saksham AI API on :${env.port} (health: /health)`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err?.stack || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandledRejection:', reason?.stack || reason);
});

process.on('exit', (code) => {
  console.log(`[server] Process exiting with code ${code}`);
  console.trace('[server] Exit stack trace');
});

process.on('SIGTERM', () => {
  console.log('[server] Received SIGTERM, shutting down...');
  if (serverInstance) {
    serverInstance.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
  setTimeout(() => process.exit(0), 1000).unref();
});

process.on('SIGINT', () => {
  console.log('[server] Received SIGINT (Ctrl+C), shutting down...');
  if (serverInstance) {
    serverInstance.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
  setTimeout(() => process.exit(0), 1000).unref();
});

main().catch((e) => {
  console.error('[server] Fatal startup error:', e);
  process.exit(1);
});
