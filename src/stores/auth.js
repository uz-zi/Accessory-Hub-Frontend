import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const accessToken = ref(null)
  const loading     = ref(false)
  const error       = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const fullName        = computed(() =>
    user.value ? `${user.value.first_name} ${user.value.last_name}`.trim() : ''
  )

  function setTokens(access, refresh) {
    accessToken.value = access
    localStorage.setItem('access_token',  access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
  }

  function clearTokens() {
    accessToken.value = null
    user.value        = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function hydrateFromStorage() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    accessToken.value = token
    try {
      const { data } = await authApi.getProfile()
      user.value = data
    } catch {
      clearTokens()
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.login(credentials)
      setTokens(data.access_token, data.refresh_token)
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.register(payload)
      setTokens(data.access_token, data.refresh_token)
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    clearTokens()
    router.push({ name: 'home' })
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value   = null
    try {
      await authApi.forgotPassword(email)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Request failed.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.updateProfile(payload)
      user.value = data
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Update failed.'
      return false
    } finally {
      loading.value = false
    }
  }

  // Listen for forced logout from axios interceptor
  window.addEventListener('auth:logout', clearTokens)

  return {
    user, accessToken, loading, error,
    isAuthenticated, fullName,
    hydrateFromStorage, login, register,
    logout, forgotPassword, updateProfile, clearTokens
  }
})
