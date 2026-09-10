const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

async function startServer() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[CortexCrew Backend] Server is running on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`[CortexCrew Backend] ${signal} received; shutting down`);
    server.close(async () => {
      const { disconnectDB } = require('./src/config/db');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error(`[CortexCrew Backend] Startup failed: ${error.message}`);
  process.exit(1);
});