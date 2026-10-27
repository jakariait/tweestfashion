const fs = require('fs');
const path = require('path');

const testEnvPath = path.join(__dirname, '.test-env');
if (fs.existsSync(testEnvPath)) {
  const { uri } = JSON.parse(fs.readFileSync(testEnvPath, 'utf8'));
  process.env.MONGO_URI = uri;
}

process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test-pass';
