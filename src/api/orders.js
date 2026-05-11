import api from './index'

export const ordersApi = {
  createOrder: (payload) =>
    api.post('/orders', payload),

  getOrders: (params) =>
    api.get('/orders', { params }),

  getOrder: (id) =>
    api.get(`/orders/${id}`),

  cancelOrder: (id) =>
    api.put(`/orders/${id}/cancel`),

  createPaymentIntent: (payload) =>
    api.post('/payments/create_intent', payload),

  confirmPayment: (orderId, payload) =>
    api.post(`/payments/${orderId}/confirm`, payload)
}
