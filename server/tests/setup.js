const mongoose = require('mongoose');

let mongod = null;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'flowdeck_test_secret_key_12345';
  process.env.JWT_EXPIRES_IN = '1d';

  let uri = 'mongodb://127.0.0.1:27017/flowdeck_test';

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  } catch (err) {
    console.warn('[Test Setup] MongoMemoryServer unavailable, falling back to local MongoDB test db:', err.message);
  }

  // Disconnect if previously connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests to guarantee state isolation
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  if (mongod) {
    await mongod.stop();
  }
});
