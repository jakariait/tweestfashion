// controllers/steadfastController.js
const {
  createSteadfastOrderService,
  getSteadfastOrderStatusByInvoiceService,
  bulkCreateSteadfastOrderService,
} = require('../services/steadfastService');

const createSteadfastOrder = async (req, res) => {
  try {
    const response = await createSteadfastOrderService(req.body);
    res.status(200).json({ status: 'success', data: response });
  } catch (err) {
    console.error('Steadfast order error:', err.response?.data || err.message);
    res.status(500).json({
      status: 'error',
      message: err.response?.data?.message || 'Something went wrong',
    });
  }
};

const getSteadfastOrderStatusByInvoice = async (req, res) => {
  try {
    const { invoice } = req.query; // <-- use req.query here
    if (!invoice) {
      return res.status(400).json({ status: 'error', message: 'Invoice parameter is required' });
    }

    const response = await getSteadfastOrderStatusByInvoiceService(invoice);
    res.status(200).json({ status: 'success', data: response });
  } catch (err) {
    console.error('Steadfast status fetch error:', err.response?.data || err.message);
    res.status(500).json({
      status: 'error',
      message: err.response?.data?.message || 'Unable to fetch order status',
    });
  }
};

const bulkCreateSteadfastOrder = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: "Invalid request. 'data' must be a JSON encoded array",
      });
    }

    if (data.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 500 items are allowed',
      });
    }

    console.log('Bulk order received:', JSON.stringify(data, null, 2));

    const response = await bulkCreateSteadfastOrderService(data);

    console.log('Steadfast bulk response:', JSON.stringify(response, null, 2));

    // Ensure response is always an array
    const responseArray = Array.isArray(response) ? response : [];

    res.status(200).json({ status: 'success', data: responseArray });
  } catch (err) {
    console.error('Steadfast bulk order error:', err.response?.data || err.message);
    res.status(500).json({
      status: 'error',
      message: err.response?.data?.message || err.message || 'Something went wrong',
    });
  }
};

module.exports = {
  createSteadfastOrder,
  getSteadfastOrderStatusByInvoice,
  bulkCreateSteadfastOrder,
};
