const { createClient } = require('redis');
const config = require('./env');

const client = createClient({
  socket: {
    host: config.redisHost,
    port: config.redisPort,
    reconnectStrategy: () => config.redisRequired ? 1000 : false
  }
});

client.on('error', (err) => console.error('[Redis Client Error]', err));

async function connectRedis() {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('[Redis Connected successfully]');
    } catch (error) {
      if (config.redisRequired) throw error;
      console.warn(`[Redis Optional Dependency Unavailable] ${error.message}`);
    }
  }
  return client;
}

async function disconnectRedis() {
  if (client.isOpen) {
    await client.quit();
  }
}

module.exports = client;
module.exports.connectRedis = connectRedis;
module.exports.disconnectRedis = disconnectRedis;
