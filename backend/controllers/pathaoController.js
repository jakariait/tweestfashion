const pathaoService = require('../services/pathaoService');

const getCitiesController = async (req, res) => {
  try {
    const data = await pathaoService.getCities();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const getZonesController = async (req, res) => {
  try {
    const { cityId } = req.params;
    const data = await pathaoService.getZones(cityId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const getAreasController = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const data = await pathaoService.getAreas(zoneId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const getStoresController = async (req, res) => {
  try {
    const data = await pathaoService.getStores();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const createStoreController = async (req, res) => {
  try {
    const data = await pathaoService.createStore(req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const createOrderController = async (req, res) => {
  try {
    const data = await pathaoService.createOrder(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const createBulkOrderController = async (req, res) => {
  try {
    const data = await pathaoService.createBulkOrder(req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const getOrderInfoController = async (req, res) => {
  try {
    const { consignmentId } = req.params;
    const data = await pathaoService.getOrderInfo(consignmentId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

const calculatePriceController = async (req, res) => {
  try {
    const data = await pathaoService.calculatePrice(req.body);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || err.response?.data?.message || 'Something went wrong',
      errors: err.details || null,
    });
  }
};

module.exports = {
  getCitiesController,
  getZonesController,
  getAreasController,
  getStoresController,
  createStoreController,
  createOrderController,
  createBulkOrderController,
  getOrderInfoController,
  calculatePriceController,
};
