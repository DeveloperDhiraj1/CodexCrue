const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const app = require('./src/app');

async function startServer() {
  await connectDB();
  await connectRedis();

  const server = app.listen(config.port, () => {
    console.log(`[CortexCrew Backend] Server is running on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`[CortexCrew Backend] ${signal} received; shutting down`);
    server.close(async () => {
      const { disconnectDB } = require('./src/config/db');
      const { disconnectRedis } = require('./src/config/redis');
      await Promise.all([disconnectDB(), disconnectRedis()]);
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
