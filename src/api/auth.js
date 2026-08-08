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

  resetPassword: (token, password, passwordConfirmation) =>
    api.put('/auth/reset_password', {
      reset_token: token,
      password,
      password_confirmation: passwordConfirmation
    }),

  verifyEmail: (token) =>
    api.post('/auth/verify_email', { token }),

  resendVerification: (email) =>
    api.post('/auth/resend_verification', { email }),

  getProfile: () =>
    api.get('/auth/me'),

  updateProfile: (payload) =>
    api.put('/auth/me', payload),

  changePassword: (payload) =>
    api.put('/auth/change_password', payload)
}
