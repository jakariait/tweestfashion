import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('token');
  const userToken = localStorage.getItem('user_token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const authHeader = error?.config?.headers?.Authorization || '';
      const userToken = localStorage.getItem('user_token');
      const adminToken = localStorage.getItem('token');

      if (adminToken && authHeader === `Bearer ${adminToken}`) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      } else if (userToken && authHeader === `Bearer ${userToken}`) {
        localStorage.removeItem('user_token');
      }
    }
    return Promise.reject(error);
  },
);

export default http;
