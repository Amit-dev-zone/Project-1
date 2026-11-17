import apiClient from './client';

export const authService = {
  async register({ name, email, password, role = 'customer' }) {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  async login({ email, password }) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async getVendorDashboard() {
    const response = await apiClient.get('/auth/vendor/dashboard');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await apiClient.get('/auth/admin/dashboard');
    return response.data;
  },
};
