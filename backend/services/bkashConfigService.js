const BkashConfig = require('../models/BkashConfigModel');

async function getBkashConfig() {
  const config = await BkashConfig.findOne().select('-appSecret -password').lean();
  if (!config) return null;
  return config;
}

async function updateBkashConfig(data) {
  let config = await BkashConfig.findOne();

  if (!config) {
    config = new BkashConfig(data);
  } else {
    Object.assign(config, data);
  }

  await config.save();
  return config;
}

module.exports = {
  getBkashConfig,
  updateBkashConfig,
};
