const { getPathaoConfig, updatePathaoConfig } = require('../services/pathaoConfigService');

const getPathaoConfigController = async (req, res) => {
  try {
    const config = await getPathaoConfig();
    res.status(200).json({ status: 'success', data: config });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve Pathao config',
    });
  }
};

const updatePathaoConfigController = async (req, res) => {
  try {
    const config = await updatePathaoConfig(req.body);
    res.status(200).json({ status: 'success', data: config });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update Pathao config',
    });
  }
};

module.exports = {
  getPathaoConfigController,
  updatePathaoConfigController,
};
