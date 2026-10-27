const mongoose = require('mongoose');

const pathaoConfigSchema = new mongoose.Schema(
  {
    baseUrl: {
      type: String,
      default: 'https://courier-api-sandbox.pathao.com',
    },
    clientId: {
      type: String,
      default: '7N1aMJQbWm',
    },
    clientSecret: {
      type: String,
      default: 'wRcaibZkUdSNz2EI9ZyuXLlNrnAv0TdPUPXMnD39',
    },
    username: {
      type: String,
      default: 'test@pathao.com',
    },
    password: {
      type: String,
      default: 'lovePathao',
    },
    storeId: {
      type: String,
      default: '187785',
    },
    accessToken: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      default: '',
    },
    tokenType: {
      type: String,
      default: 'Bearer',
    },
    expiresIn: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PathaoConfig', pathaoConfigSchema);
