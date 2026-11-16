const pathaoService = require('../services/pathaoService');

const getCitiesController = async (req, res) => {
  try {
    const result = await pathaoService.getCityList();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const getZonesController = async (req, res) => {
  try {
    const { cityId } = req.params;
    const result = await pathaoService.getZoneList(cityId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const getAreasController = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const result = await pathaoService.getAreaList(zoneId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const getStoresController = async (req, res) => {
  try {
    const result = await pathaoService.getStoreList();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const createStoreController = async (req, res) => {
  try {
    const { name, contactName, contactNumber, secondaryContact, address, cityId, zoneId, areaId } =
      req.body;

    const result = await pathaoService.makeRequest('/aladdin/api/v1/stores', 'POST', {
      name,
      contact_name: contactName,
      contact_number: contactNumber,
      secondary_contact: secondaryContact,
      address,
      city_id: cityId,
      zone_id: zoneId,
      area_id: areaId,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const createOrderController = async (req, res) => {
  try {
    const config = await pathaoService.getConfig();
    const storeId = config.storeId;

    const {
      merchantOrderId,
      recipientName,
      recipientPhone,
      recipientAddress,
      deliveryType,
      itemType,
      itemQuantity,
      itemWeight,
      itemDescription,
      amountToCollect,
      specialInstruction,
      recipientCity,
      recipientZone,
      recipientArea,
    } = req.body;

    const result = await pathaoService.createOrder({
      storeId,
      merchantOrderId,
      recipientName,
      recipientPhone,
      recipientAddress,
      deliveryType: deliveryType || 48,
      itemType: itemType || 2,
      itemQuantity: itemQuantity || 1,
      itemWeight: itemWeight || '0.5',
      itemDescription,
      amountToCollect: amountToCollect || 0,
      specialInstruction,
      recipientCity,
      recipientZone,
      recipientArea,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Pathao create order error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to create Pathao order',
      error: err.response?.data,
    });
  }
};

const createBulkOrderController = async (req, res) => {
  try {
    const { orders } = req.body;
    const result = await pathaoService.makeRequest('/aladdin/api/v1/orders/bulk', 'POST', {
      orders,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const getOrderInfoController = async (req, res) => {
  try {
    const { consignmentId } = req.params;
    const result = await pathaoService.getOrderInfo(consignmentId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

const calculatePriceController = async (req, res) => {
  try {
    const result = await pathaoService.calculatePrice(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

// Get Order Status by consignment ID
const getOrderStatusController = async (req, res) => {
  try {
    const { consignmentId } = req.params;
    const result = await pathaoService.getOrderInfo(consignmentId);

    if (result.success && result.data?.data) {
      const orderData = result.data.data;
      res.status(200).json({
        success: true,
        data: {
          status: orderData.order_status || orderData.order_status_slug,
          statusText: getStatusText(orderData.order_status_slug),
          updatedAt: orderData.updated_at,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

// Helper to get readable status text
const getStatusText = (slug) => {
  const statusMap = {
    Pending: 'Order Pending',
    Picked: 'Picked Up',
    'In Transit': 'In Transit',
    'Partial Delivered': 'Partially Delivered',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Returned: 'Returned',
    Lost: 'Lost',
    'Ready For Delivery': 'Ready For Delivery',
    'Out For Delivery': 'Out For Delivery',
  };
  return statusMap[slug] || slug;
};

// Issue new token manually (for admin)
const issueTokenController = async (req, res) => {
  try {
    const result = await pathaoService.issueNewToken();
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Token issued successfully',
        data: {
          expires_in: result.expires_in,
        },
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to issue token',
        error: result.error,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
    });
  }
};

// Force refresh token (for admin)
const refreshTokenController = async (req, res) => {
  try {
    const result = await pathaoService.forceRefreshToken();
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          expires_in: result.expires_in,
        },
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to refresh token',
        error: result.error,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong',
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
  getOrderStatusController,
  calculatePriceController,
  issueTokenController,
  refreshTokenController,
};
