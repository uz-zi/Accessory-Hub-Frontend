import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items    = ref([])   // { id, product, variant, quantity, price }
  const coupon   = ref(null) // { code, discount_type, discount_value }
  const loading  = ref(false)
  const synced   = ref(false) // true once fetched from API

  // ── Computed ──────────────────────────────────────────────────────────────
  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )
  const discount = computed(() => {
    if (!coupon.value) return 0
    if (coupon.value.discount_type === 'percent') {
      return +(subtotal.value * coupon.value.discount_value / 100).toFixed(2)
    }
    return Math.min(coupon.value.discount_value, subtotal.value)
  })
  const shipping  = computed(() => subtotal.value >= 50 ? 0 : 4.99)
  const total     = computed(() => +(subtotal.value - discount.value + shipping.value).toFixed(2))
  const itemCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  // ── Helpers ───────────────────────────────────────────────────────────────
  function localAdd(item) {
    const existing = items.value.find(
      i => i.product.id === item.product.id && i.variant?.id === item.variant?.id
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({ ...item, id: Date.now() })
    }
    persist()
  }

  function persist() {
    localStorage.setItem('cart_local', JSON.stringify(items.value))
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem('cart_local')
      if (raw) items.value = JSON.parse(raw)
    } catch { /* ignore */ }
  }

  // ── API actions ───────────────────────────────────────────────────────────
  async function fetchCart() {
    loading.value = true
    try {
      const { data } = await cartApi.getCart()
      items.value  = data.items  || []
      coupon.value = data.coupon || null
      synced.value = true
    } catch {
      loadLocal()
    } finally {
      loading.value = false
    }
  }

  async function addItem(product, variant = null, quantity = 1) {
    const payload = { product_id: product.id, variant_id: variant?.id, quantity }
    // Optimistic local update
    localAdd({ product, variant, quantity, price: variant?.price ?? product.price })
    try {
      const { data } = await cartApi.addItem(payload)
      items.value  = data.items
      coupon.value = data.coupon || null
      persist()
    } catch { /* already optimistically added */ }
  }

  async function updateItem(itemId, quantity) {
    const item = items.value.find(i => i.id === itemId)
    if (item) item.quantity = quantity
    persist()
    try {
      const { data } = await cartApi.updateItem(itemId, quantity)
      items.value  = data.items
      coupon.value = data.coupon || null
      persist()
    } catch { /* handled optimistically */ }
  }

  async function removeItem(itemId) {
    items.value = items.value.filter(i => i.id !== itemId)
    persist()
    try {
      const { data } = await cartApi.removeItem(itemId)
      items.value  = data.items
      coupon.value = data.coupon || null
      persist()
    } catch { /* handled optimistically */ }
  }

  async function clearCart() {
    items.value  = []
    coupon.value = null
    localStorage.removeItem('cart_local')
    try { await cartApi.clearCart() } catch { /* ignore */ }
  }

  async function applyCoupon(code) {
    try {
      const { data } = await cartApi.applyCoupon(code)
      coupon.value = data.coupon
      items.value  = data.items || items.value
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid coupon' }
    }
  }

  async function removeCoupon() {
    coupon.value = null
    try { await cartApi.removeCoupon() } catch { /* ignore */ }
  }

  // Initialize from local storage on store creation
  loadLocal()

  return {
    items, coupon, loading, synced,
    subtotal, discount, shipping, total, itemCount,
    fetchCart, addItem, updateItem, removeItem,
    clearCart, applyCoupon, removeCoupon
  }
})
