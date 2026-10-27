const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.__MONGO_URI__ = uri;

  fs.writeFileSync(path.join(__dirname, '.test-env'), JSON.stringify({ uri }));
};
