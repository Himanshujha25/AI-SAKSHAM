const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');

async function main() {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.clientUrl, methods: ['GET', 'POST', 'PATCH'] } });
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('assessment:subscribe', (assessmentId) => {
      if (assessmentId) socket.join(`assessment:${assessmentId}`);
    });
  });

  server.listen(env.port, () => {
    console.log(`[server] SentinelAI API on :${env.port} (health: /health)`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
