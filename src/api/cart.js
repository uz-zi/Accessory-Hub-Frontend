import api from './index'

export const cartApi = {
  getCart: () =>
    api.get('/cart'),

  addItem: (payload) =>
    api.post('/cart/items', payload),

  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`),

  clearCart: () =>
    api.delete('/cart'),

  applyCoupon: (code) =>
    api.post('/cart/coupon', { code }),

  removeCoupon: () =>
    api.delete('/cart/coupon')
}
