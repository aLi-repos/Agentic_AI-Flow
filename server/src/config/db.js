const mongoose = require('mongoose');
const env = require('./env');

let mongoServer = null;

const connectDB = async () => {
  try {
    if (env.MONGODB_URI) {
      console.log(`[DB] Attempting connection to MongoDB at: ${env.MONGODB_URI.replace(/:\/\/.*@/, '://***:***@')}`);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('✅ [DB] Connected to external MongoDB successfully.');
      return mongoose.connection;
    }
  } catch (err) {
    console.warn(`⚠️ [DB] Could not connect to external MongoDB: ${err.message}. Falling back to In-Memory MongoDB...`);
  }

  try {
    console.log('🚀 [DB] Initializing In-Memory MongoDB Server for local dev...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ [DB] In-Memory MongoDB Server started & connected at: ${uri}`);
    return mongoose.connection;
  } catch (fallbackErr) {
    console.error('❌ [DB] Failed to start In-Memory MongoDB fallback:', fallbackErr);
    throw fallbackErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
