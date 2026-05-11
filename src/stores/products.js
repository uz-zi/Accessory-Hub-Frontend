import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api/products'
import { wishlistApi } from '@/api/wishlist'

export const useProductsStore = defineStore('products', () => {
  const products      = ref([])
  const featured      = ref([])
  const categories    = ref([])
  const current       = ref(null)
  const wishlistIds   = ref(new Set())
  const loading       = ref(false)
  const listLoading   = ref(false)
  const error         = ref(null)
  const pagination    = ref({ page: 1, per_page: 12, total: 0, total_pages: 1 })
  const activeFilters = ref({ category: '', min_price: '', max_price: '', sort: 'newest', search: '' })

  const hasMore = computed(() => pagination.value.page < pagination.value.total_pages)

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  async function fetchProducts(params = {}, append = false) {
    listLoading.value = true
    error.value       = null
    try {
      const query = { ...activeFilters.value, ...params, page: pagination.value.page }
      const { data } = await productsApi.getAll(query)
      products.value  = append ? [...products.value, ...(data.products || [])] : (data.products || [])
      pagination.value = {
        page:        data.page        || 1,
        per_page:    data.per_page    || 12,
        total:       data.total       || 0,
        total_pages: data.total_pages || 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load products.'
    } finally {
      listLoading.value = false
    }
  }

  async function fetchFeatured() {
    try {
      const { data } = await productsApi.getFeatured()
      featured.value = data.products || data
    } catch { /* ignore */ }
  }

  async function fetchCategories() {
    try {
      const { data } = await productsApi.getCategories()
      categories.value = data
    } catch { /* ignore */ }
  }

  async function fetchProduct(id) {
    loading.value = true
    error.value   = null
    current.value = null
    try {
      const { data } = await productsApi.getById(id)
      current.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Product not found.'
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    activeFilters.value[key] = value
    pagination.value.page = 1
  }

  function resetFilters() {
    activeFilters.value = { category: '', min_price: '', max_price: '', sort: 'newest', search: '' }
    pagination.value.page = 1
  }

  function nextPage() {
    if (hasMore.value) {
      pagination.value.page++
      fetchProducts({}, true)
    }
  }

  // ── Wishlist ──────────────────────────────────────────────────────────────
  async function fetchWishlist() {
    try {
      const { data } = await wishlistApi.getWishlist()
      wishlistIds.value = new Set((data.items || data).map(i => i.product_id || i.id))
    } catch { /* ignore */ }
  }

  async function toggleWishlist(productId) {
    if (wishlistIds.value.has(productId)) {
      wishlistIds.value.delete(productId)
      try { await wishlistApi.removeItem(productId) } catch { wishlistIds.value.add(productId) }
    } else {
      wishlistIds.value.add(productId)
      try { await wishlistApi.addItem(productId) } catch { wishlistIds.value.delete(productId) }
    }
    // trigger reactivity
    wishlistIds.value = new Set(wishlistIds.value)
  }

  function isWishlisted(productId) {
    return wishlistIds.value.has(productId)
  }

  return {
    products, featured, categories, current, wishlistIds,
    loading, listLoading, error, pagination, activeFilters, hasMore,
    fetchProducts, fetchFeatured, fetchCategories, fetchProduct,
    setFilter, resetFilters, nextPage,
    fetchWishlist, toggleWishlist, isWishlisted
  }
})
