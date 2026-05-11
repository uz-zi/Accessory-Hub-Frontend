import api from './index'

export const wishlistApi = {
  getWishlist: () =>
    api.get('/wishlist'),

  addItem: (productId) =>
    api.post('/wishlist', { product_id: productId }),

  removeItem: (productId) =>
    api.delete(`/wishlist/${productId}`)
}
