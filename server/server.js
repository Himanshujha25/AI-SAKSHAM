const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');

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
  const io = new Server(server, { cors: { origin: env.clientUrls, methods: ['GET', 'POST', 'PATCH'] } });
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('assessment:subscribe', (assessmentId) => {
      if (assessmentId) socket.join(`assessment:${assessmentId}`);
    });
  });

  server.listen(env.port, () => {
    console.log(`[server] Saksham AI API on :${env.port} (health: /health)`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
