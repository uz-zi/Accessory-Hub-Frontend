import api from './index'

export const productsApi = {
  getAll: (params) =>
    api.get('/products', { params }),

  getById: (id) =>
    api.get(`/products/${id}`),

  getBySlug: (slug) =>
    api.get(`/products/slug/${slug}`),

  getFeatured: () =>
    api.get('/products/featured'),

  getCategories: () =>
    api.get('/categories'),

  search: (query, params) =>
    api.get('/products/search', { params: { q: query, ...params } }),

  getReviews: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),

  createReview: (productId, payload) =>
    api.post(`/products/${productId}/reviews`, payload)
}
