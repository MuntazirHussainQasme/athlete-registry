const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri || uri === 'memory') {
    // Self-contained MongoDB that stores its files in server/.data (downloads the binary on first run)
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({ instance: { dbPath, port: 27018, storageEngine: 'wiredTiger' } });
    uri = mongod.getUri('athlete_system');
    console.log('Using built-in local database (server/.data)');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
