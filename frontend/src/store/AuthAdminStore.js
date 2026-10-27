import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const useAuthAdminStore = create((set) => ({
  admin: null,
  token: localStorage.getItem('token') || null,
  error: null,
  loading: false,

  // Initialize function to fetch admin data
  initialize: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ loading: true });
      try {
        const res = await axios.get(`${apiUrl}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` }, // Attach token in header
        });
        set({ admin: res.data.admin, token, loading: false });
      } catch (error) {
        console.error('Error initializing admin:', error.response || error);
        if (error?.response?.status === 403) {
          // Token expired or invalid, log out the user
          localStorage.removeItem('token');
          set({
            admin: null,
            token: null,
            error: 'Token expired or invalid',
            loading: false,
          });
        } else {
          set({
            error: 'Authentication failed',
            loading: false,
          });
        }
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.post(`${apiUrl}/admin/login`, {
        email,
        password,
      });

      const { admin } = res.data;
      const token = admin.token;
      localStorage.setItem('token', token);
      set({ admin, token, loading: false });
      return true;
    } catch (error) {
      set({
        error: 'Login failed. Please check your credentials.',
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ admin: null, token: null });
  },
}));

export default useAuthAdminStore;
