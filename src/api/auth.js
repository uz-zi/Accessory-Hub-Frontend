import api from './index'

export const authApi = {
  login: (credentials) =>
    api.post('/auth/login', credentials),

  register: (payload) =>
    api.post('/auth/register', payload),

  logout: () =>
    api.delete('/auth/logout'),

  forgotPassword: (email) =>
    api.post('/auth/forgot_password', { email }),

  resetPassword: (token, password) =>
    api.put('/auth/reset_password', { token, password }),

  getProfile: () =>
    api.get('/auth/me'),

  updateProfile: (payload) =>
    api.put('/auth/me', payload),

  changePassword: (payload) =>
    api.put('/auth/change_password', payload)
}
