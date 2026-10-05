const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;
let activeDatabaseType = 'None';

const connectDB = async () => {
  const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  // 1. When MONGO_URI is provided in environment, connect to MongoDB Atlas / configured remote database
  if (uri) {
    const maskedUri = uri.replace(/:[^:]*@/, ':****@');
    console.log(`[Database] MONGO_URI provided. Connecting to remote database (${maskedUri})...`);
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      activeDatabaseType = uri.includes('mongodb+srv') || uri.includes('mongodb.net') 
        ? 'MongoDB Atlas' 
        : 'Remote MongoDB';
      console.log(`[Database] Connected to ${activeDatabaseType}: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[Database] FATAL: Failed to connect to MongoDB Atlas (${maskedUri}): ${err.message}`);
      console.error(`[Database] Please check your Atlas IP access whitelist, network connectivity, and credentials.`);
      throw err;
    }
  }

  // 2. When MONGO_URI is NOT provided, explicitly use persistent embedded MongoDB engine for local development
  console.log('[Database] No MONGO_URI configured in environment.');
  console.log('[Database] Using local development database (embedded persistent storage)');

  const dataDir = path.join(__dirname, '../.data/db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir,
        storageEngine: 'wiredTiger',
      },
    });

    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    activeDatabaseType = 'Local Development Database (Embedded Persistent)';
    console.log(`[Database] Local development database connected: ${memUri}`);
    console.log(`[Database] Persistent storage path: ${dataDir}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Failed to start local development database engine: ${err.message}`);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    activeDatabaseType = 'None';
  } catch (err) {
    console.error(`[Database] Disconnect error: ${err.message}`);
  }
};

const getDatabaseStatus = () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const state = mongoose.connection ? readyStates[mongoose.connection.readyState] || 'unknown' : 'disconnected';
  return {
    status: state,
    type: activeDatabaseType,
    isAtlas: activeDatabaseType.includes('Atlas'),
  };
};

module.exports = { connectDB, disconnectDB, getDatabaseStatus };
