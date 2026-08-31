const mongoose = require('mongoose');
const dns = require('node:dns');
const config = require('./env');

if (config.mongoDnsServers.length > 0) {
  dns.setServers(config.mongoDnsServers);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, { family: 4 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
module.exports.disconnectDB = async () => mongoose.disconnect();
