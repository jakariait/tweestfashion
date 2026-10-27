const axios = require('axios');
const { getPathaoConfig, updatePathaoConfig } = require('./pathaoConfigService');

const issueToken = async () => {
  const config = await getPathaoConfig();
  const { clientId, clientSecret, username, password, baseUrl } = config;

  const response = await axios.post(`${baseUrl}/aladdin/api/v1/issue-token`, {
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
    grant_type: 'password',
  });

  const { access_token, refresh_token, expires_in } = response.data;

  await updatePathaoConfig({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
  });

  return { access_token, refresh_token, expires_in };
};

const refreshToken = async () => {
  const config = await getPathaoConfig();
  const { clientId, clientSecret, refreshToken, baseUrl } = config;

  const response = await axios.post(`${baseUrl}/aladdin/api/v1/issue-token`, {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const { access_token, refresh_token, expires_in } = response.data;

  await updatePathaoConfig({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
  });

  return { access_token, refresh_token, expires_in };
};

const getAccessToken = async () => {
  const config = await getPathaoConfig();
  if (config.accessToken && config.expiresIn) {
    // Check if the token is expiring soon (e.g., within the next 5 minutes)
    const tokenExpiry = new Date(config.updatedAt.getTime() + config.expiresIn * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    if (tokenExpiry.getTime() - now.getTime() > fiveMinutes) {
      return config.accessToken;
    } else {
      const { access_token } = await refreshToken();
      return access_token;
    }
  } else {
    const { access_token } = await issueToken();
    return access_token;
  }
};

const getCities = async () => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.get(`${config.baseUrl}/aladdin/api/v1/city-list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const getZones = async (cityId) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.get(`${config.baseUrl}/aladdin/api/v1/cities/${cityId}/zone-list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const getAreas = async (zoneId) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.get(`${config.baseUrl}/aladdin/api/v1/zones/${zoneId}/area-list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const getStores = async () => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.get(`${config.baseUrl}/aladdin/api/v1/stores`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const createStore = async (storeData) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.post(`${config.baseUrl}/aladdin/api/v1/stores`, storeData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const createOrder = async (orderData) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.post(`${config.baseUrl}/aladdin/api/v1/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.data.type === 'error') {
    const error = new Error(response.data.message || 'Pathao API Error');
    error.details = response.data.errors;
    throw error;
  }

  return response.data;
};

const createBulkOrder = async (ordersData) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.post(`${config.baseUrl}/aladdin/api/v1/orders/bulk`, ordersData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const getOrderInfo = async (consignmentId) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.get(
    `${config.baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const calculatePrice = async (priceData) => {
  const config = await getPathaoConfig();
  const accessToken = await getAccessToken();
  const response = await axios.post(
    `${config.baseUrl}/aladdin/api/v1/merchant/price-plan`,
    priceData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const getPathaoOrderStatus = async (consignmentId) => {
  // This function can be expanded later to format or simplify the response
  return await getOrderInfo(consignmentId);
};

module.exports = {
  issueToken,
  refreshToken,
  getAccessToken,
  getCities,
  getZones,
  getAreas,
  getStores,
  createStore,
  createOrder,
  createBulkOrder,
  getOrderInfo,
  calculatePrice,
  getPathaoOrderStatus,
};
