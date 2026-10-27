const PathaoConfig = require('../models/PathaoConfigModel');

exports.getPathaoConfig = async () => {
  let config = await PathaoConfig.findOne().select(
    '-clientSecret -password -accessToken -refreshToken'
  );

  if (!config) {
    config = await PathaoConfig.create({});
  }

  return config;
};

exports.updatePathaoConfig = async (data) => {
  const existing = await PathaoConfig.findOne();

  if (!existing) {
    return await PathaoConfig.create(data);
  }

  return await PathaoConfig.findByIdAndUpdate(existing._id, data, { new: true });
};
