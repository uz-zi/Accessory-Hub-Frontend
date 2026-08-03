import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/api/admin'

const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'New Collection 2025',
    heading: 'Protect Your Phone\nin Style',
    desc: 'Ultra-slim cases engineered for drop protection without the bulk. Over 200 designs to match your personality.',
    cta: 'Shop Cases',
    link_category: 'cases',
    bg: 'https://picsum.photos/seed/phonecase1/1920/900',
  },
  {
    id: 2,
    tag: 'True Wireless Audio',
    heading: 'Sound That Moves\nWith You',
    desc: 'Premium earbuds with active noise cancellation, 36-hour battery life, and studio-quality sound.',
    cta: 'Shop Earbuds',
    link_category: 'earbuds',
    bg: 'https://picsum.photos/seed/earbuds2025/1920/900',
  },
  {
    id: 3,
    tag: 'Fast Charging Tech',
    heading: 'Power Up in\nMinutes, Not Hours',
    desc: 'GaN chargers and USB-C cables delivering up to 140W. Compatible with every device you own.',
    cta: 'Shop Chargers',
    link_category: 'chargers',
    bg: 'https://picsum.photos/seed/chargertech/1920/900',
  },
]

const DEFAULT_CATEGORIES = [
  { slug: 'cases',             name: 'Cases',         emoji: '📱', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { slug: 'chargers',          name: 'Chargers',      emoji: '⚡', bg: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { slug: 'earbuds',           name: 'Earbuds',       emoji: '🎧', bg: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { slug: 'screen-protectors', name: 'Screen Guards', emoji: '🛡️', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { slug: 'mounts',            name: 'Mounts',        emoji: '🚗', bg: 'linear-gradient(135deg,#f953c6,#b91d73)' },
  { slug: 'cables',            name: 'Cables',        emoji: '🔌', bg: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
]

const SLIDES_KEY = 'ah_hp_slides'
const CATS_KEY   = 'ah_hp_cats'

function fromLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback }
  catch { return fallback }
}
function toLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
}

export const useHomepageStore = defineStore('homepage', () => {
  // Initialise from localStorage so the homepage renders instantly on load
  const slides     = ref(fromLS(SLIDES_KEY, DEFAULT_SLIDES))
  const categories = ref(fromLS(CATS_KEY,   DEFAULT_CATEGORIES))

  // Sync-status flags used by the admin UI
  const loading       = ref(false)
  const saving        = ref(false)
  const backendOnline = ref(null)   // null = unknown, true = synced, false = offline
  const syncError     = ref('')

  // ── Fetch from backend ────────────────────────────────────────────────────
  async function fetchConfig() {
    loading.value   = true
    syncError.value = ''
    try {
      const { data } = await adminApi.getHomepageConfig()

      if (Array.isArray(data.slides) && data.slides.length) {
        slides.value = data.slides
        toLS(SLIDES_KEY, slides.value)
      }
      if (Array.isArray(data.categories) && data.categories.length) {
        categories.value = data.categories
        toLS(CATS_KEY, categories.value)
      }
      backendOnline.value = true
    } catch (err) {
      backendOnline.value = false
      syncError.value = err.response?.status === 404
        ? 'Backend endpoint not found — changes saved locally only.'
        : 'Cannot reach backend — changes saved locally only.'
    } finally {
      loading.value = false
    }
  }

  // ── Persist slides: local-first, then backend ─────────────────────────────
  async function persistSlides() {
    toLS(SLIDES_KEY, slides.value)
    saving.value    = true
    syncError.value = ''
    try {
      await adminApi.updateHomepageSlides(slides.value)
      backendOnline.value = true
    } catch (err) {
      backendOnline.value = false
      syncError.value = err.response?.status === 404
        ? 'Backend endpoint not found — saved locally only.'
        : 'Backend sync failed — saved locally only.'
    } finally {
      saving.value = false
    }
  }

  // ── Persist categories: local-first, then backend ─────────────────────────
  async function persistCats() {
    toLS(CATS_KEY, categories.value)
    saving.value    = true
    syncError.value = ''
    try {
      await adminApi.updateHomepageCategories(categories.value)
      backendOnline.value = true
    } catch (err) {
      backendOnline.value = false
      syncError.value = err.response?.status === 404
        ? 'Backend endpoint not found — saved locally only.'
        : 'Backend sync failed — saved locally only.'
    } finally {
      saving.value = false
    }
  }

  // ── Slide CRUD ────────────────────────────────────────────────────────────
  async function addSlide(slide) {
    slides.value.push({ ...slide, id: Date.now() })
    await persistSlides()
  }

  async function updateSlide(id, data) {
    const idx = slides.value.findIndex(s => s.id === id)
    if (idx >= 0) {
      slides.value[idx] = { ...slides.value[idx], ...data }
      await persistSlides()
    }
  }

  async function deleteSlide(id) {
    slides.value = slides.value.filter(s => s.id !== id)
    await persistSlides()
  }

  async function moveSlide(idx, dir) {
    const arr  = [...slides.value]
    const dest = idx + dir
    if (dest < 0 || dest >= arr.length) return
    ;[arr[idx], arr[dest]] = [arr[dest], arr[idx]]
    slides.value = arr
    await persistSlides()
  }

  async function resetSlides() {
    slides.value = [...DEFAULT_SLIDES]
    await persistSlides()
  }

  // ── Category CRUD ─────────────────────────────────────────────────────────
  async function updateCategory(slug, data) {
    const idx = categories.value.findIndex(c => c.slug === slug)
    if (idx >= 0) {
      categories.value[idx] = { ...categories.value[idx], ...data }
      await persistCats()
    }
  }

  async function resetCategories() {
    categories.value = [...DEFAULT_CATEGORIES]
    await persistCats()
  }

  // ── Route helper ──────────────────────────────────────────────────────────
  function slideLink(slide) {
    return slide.link_category
      ? { name: 'products', query: { category: slide.link_category } }
      : { name: 'products' }
  }

  return {
    slides, categories,
    loading, saving, backendOnline, syncError,
    fetchConfig,
    addSlide, updateSlide, deleteSlide, moveSlide, resetSlides,
    updateCategory, resetCategories,
    slideLink,
  }
})
