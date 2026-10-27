const axios = require('axios');
const SteadfastConfig = require('../models/SteadfastConfigModel');

const configCache = {
  config: null,
  expiry: null,
};

const getSteadfastConfig = async () => {
  const now = new Date();

  if (configCache.config && configCache.expiry > now) {
    return configCache.config;
  }

  const config = await SteadfastConfig.findOne({ isActive: true });
  if (!config) {
    throw new Error('No active Steadfast config found in DB');
  }

  configCache.config = config;
  configCache.expiry = new Date(now.getTime() + 10 * 60 * 1000); // Cache for 10 minutes

  return config;
};

const createSteadfastOrderService = async (orderData) => {
  const config = await getSteadfastConfig();

  const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } =
    orderData;

  const payload = {
    invoice,
    recipient_name,
    recipient_phone,
    recipient_address,
    cod_amount,
    note,
  };

  const response = await axios.post(`${config.baseUrl}/create_order`, payload, {
    headers: {
      'Api-Key': config.apiKey,
      'Secret-Key': config.secretKey,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const getSteadfastOrderStatusByInvoiceService = async (invoiceId) => {
  const config = await getSteadfastConfig();

  const response = await axios.get(`${config.baseUrl}/status_by_invoice/${invoiceId}`, {
    headers: {
      'Api-Key': config.apiKey,
      'Secret-Key': config.secretKey,
    },
  });

  return response.data;
};

const bulkCreateSteadfastOrderService = async (orders) => {
  const config = await getSteadfastConfig();

  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error('Orders must be a non-empty array');
  }

  if (orders.length > 500) {
    throw new Error('Maximum 500 items allowed');
  }

  // Send data as JSON string (as per Steadfast docs example)
  const payload = {
    data: JSON.stringify(orders),
  };

  console.log('Sending to Steadfast API with payload:', JSON.stringify(payload, null, 2));
  console.log('Orders being sent:', orders);

  try {
    const response = await axios.post(`${config.baseUrl}/create_order/bulk-order`, payload, {
      headers: {
        'Api-Key': config.apiKey,
        'Secret-Key': config.secretKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('Steadfast API response status:', response.status);
    console.log('Steadfast API full response:', JSON.stringify(response.data, null, 2));

    // Steadfast returns data wrapped in response object: { status: 200, message: "...", data: [...] }
    const responseData = response.data?.data || response.data;
    console.log('Extracted response data:', JSON.stringify(responseData, null, 2));

    return Array.isArray(responseData) ? responseData : [];
  } catch (error) {
    console.error('Steadfast API error response:', JSON.stringify(error.response?.data, null, 2));
    console.error('Steadfast API error message:', error.message);
    console.error('Steadfast API error status:', error.response?.status);
    throw error;
  }
};

module.exports = {
  createSteadfastOrderService,
  getSteadfastOrderStatusByInvoiceService,
  bulkCreateSteadfastOrderService,
};
