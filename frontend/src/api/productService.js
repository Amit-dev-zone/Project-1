import apiClient from './client';

export const productService = {
  async getVendorProducts(params = {}) {
    const response = await apiClient.get('/products/vendor', { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    // If productData is an instance of FormData, send with multipart headers
    const isFormData = productData instanceof FormData;
    const response = await apiClient.post('/products', productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async updateProduct(id, productData) {
    const isFormData = productData instanceof FormData;
    const response = await apiClient.put(`/products/${id}`, productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async deleteProduct(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
