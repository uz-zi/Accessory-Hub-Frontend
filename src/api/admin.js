import api from './index'

export const adminApi = {
  // Uploads
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  // Products
  getProducts: (params) =>
    api.get('/admin/products', { params }),
  getProduct: (id) =>
    api.get(`/admin/products/${id}`),
  createProduct: (payload) =>
    api.post('/admin/products', payload),
  updateProduct: (id, payload) =>
    api.put(`/admin/products/${id}`, payload),
  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`),

  // Categories
  getCategories: (params) =>
    api.get('/admin/categories', { params }),
  createCategory: (payload) =>
    api.post('/admin/categories', payload),
  updateCategory: (id, payload) =>
    api.put(`/admin/categories/${id}`, payload),
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`),

  // Orders
  getOrders: (params) =>
    api.get('/admin/orders', { params }),
  getOrder: (id) =>
    api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/update_status`, { status }),

  // Users
  getUsers: (params) =>
    api.get('/admin/users', { params }),
  getUser: (id) =>
    api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/update_role`, { role }),

  // Homepage config
  getHomepageConfig: () =>
    api.get('/homepage'),
  updateHomepageSlides: (slides) =>
    api.put('/admin/homepage/slides', { slides }),
  updateHomepageCategories: (categories) =>
    api.put('/admin/homepage/categories', { categories }),
}
