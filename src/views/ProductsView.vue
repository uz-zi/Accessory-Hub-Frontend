<template>
  <div class="container py-4">
    <div class="row g-4">
      <!-- ── Sidebar filters ─────────────────────────────────────────── -->
      <div class="col-lg-3 d-none d-lg-block">
        <div class="card border-0 shadow-sm p-3 sticky-top" style="top:76px">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="fw-bold mb-0">Filters</h6>
            <button v-if="hasActiveFilters" class="btn btn-link btn-sm p-0 text-danger" @click="clearFilters">
              Clear all
            </button>
          </div>

          <!-- Category -->
          <div class="mb-4">
            <div class="fw-semibold small mb-2">Category</div>
            <div v-for="cat in CATEGORIES" :key="cat.slug" class="form-check mb-1">
              <input
                type="radio"
                class="form-check-input"
                :id="`cat-${cat.slug}`"
                :value="cat.slug"
                v-model="localFilters.category"
              />
              <label :for="`cat-${cat.slug}`" class="form-check-label small">{{ cat.name }}</label>
            </div>
            <div class="form-check mb-1">
              <input type="radio" class="form-check-input" id="cat-all" value="" v-model="localFilters.category" />
              <label for="cat-all" class="form-check-label small">All Categories</label>
            </div>
          </div>

          <!-- Price range -->
          <div class="mb-4">
            <div class="fw-semibold small mb-2">Price Range</div>
            <div class="d-flex gap-2 align-items-center">
              <input v-model.number="localFilters.min_price" type="number" class="form-control form-control-sm" placeholder="Min" min="0" />
              <span class="text-muted">–</span>
              <input v-model.number="localFilters.max_price" type="number" class="form-control form-control-sm" placeholder="Max" min="0" />
            </div>
          </div>

          <button class="btn btn-primary btn-sm w-100" @click="applyFilters">Apply Filters</button>
        </div>
      </div>

      <!-- ── Main content ────────────────────────────────────────────── -->
      <div class="col-lg-9">
        <!-- Top bar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h4 class="fw-bold mb-0">
              {{ activeCategory ? activeCategory.name : 'All Products' }}
            </h4>
            <span v-if="!productsStore.listLoading" class="text-muted small">
              {{ productsStore.pagination.total }} products found
            </span>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <!-- Mobile filter button -->
            <button class="btn btn-outline-secondary btn-sm d-lg-none" @click="showMobileFilters = true">
              <i class="bi bi-funnel me-1"></i>Filter
            </button>
            <!-- Sort -->
            <select v-model="localFilters.sort" class="form-select form-select-sm" style="width:auto" @change="applyFilters">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <!-- Active filter chips -->
        <div v-if="hasActiveFilters" class="d-flex flex-wrap gap-2 mb-3">
          <span v-if="productsStore.activeFilters.category" class="badge rounded-pill bg-primary-subtle text-primary d-flex align-items-center gap-1" style="font-size:.8rem;padding:.4em .8em">
            {{ activeCategory?.name }}
            <button class="btn-close btn-close p-0 ms-1" style="font-size:.6rem" @click="clearCategory"></button>
          </span>
          <span v-if="productsStore.activeFilters.search" class="badge rounded-pill bg-primary-subtle text-primary d-flex align-items-center gap-1" style="font-size:.8rem;padding:.4em .8em">
            "{{ productsStore.activeFilters.search }}"
            <button class="btn-close p-0 ms-1" style="font-size:.6rem" @click="clearSearch"></button>
          </span>
          <span v-if="productsStore.activeFilters.min_price || productsStore.activeFilters.max_price" class="badge rounded-pill bg-primary-subtle text-primary d-flex align-items-center gap-1" style="font-size:.8rem;padding:.4em .8em">
            ${{ productsStore.activeFilters.min_price || '0' }} – ${{ productsStore.activeFilters.max_price || '∞' }}
            <button class="btn-close p-0 ms-1" style="font-size:.6rem" @click="clearPrice"></button>
          </span>
        </div>

        <!-- Loading skeleton -->
        <div v-if="productsStore.listLoading && productsStore.products.length === 0" class="row g-3">
          <div class="col-6 col-md-4" v-for="n in 12" :key="n">
            <div class="card border-0 shadow-sm h-100 placeholder-glow">
              <div class="bg-secondary" style="aspect-ratio:1;border-radius:.75rem .75rem 0 0">
                <span class="placeholder w-100 h-100 d-block"></span>
              </div>
              <div class="card-body">
                <span class="placeholder col-8 d-block mb-2"></span>
                <span class="placeholder col-4"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else-if="!productsStore.listLoading && productsStore.products.length === 0" class="text-center py-5">
          <i class="bi bi-search fs-1 text-muted opacity-25 d-block mb-3"></i>
          <h5 class="fw-bold">No products found</h5>
          <p class="text-muted">Try adjusting your filters or search query.</p>
          <button class="btn btn-outline-primary" @click="clearFilters">Clear Filters</button>
        </div>

        <!-- Product grid -->
        <div v-else class="row g-3">
          <div class="col-6 col-md-4" v-for="product in productsStore.products" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>

        <!-- Load more -->
        <div v-if="productsStore.hasMore" class="text-center mt-4">
          <button
            class="btn btn-outline-primary px-5"
            :disabled="productsStore.listLoading"
            @click="loadMore"
          >
            <span v-if="productsStore.listLoading" class="spinner-border spinner-border-sm me-2"></span>
            Load More
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile filter offcanvas -->
    <div class="offcanvas offcanvas-start" :class="{ show: showMobileFilters }" tabindex="-1" style="z-index:1055">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title fw-bold">Filters</h5>
        <button type="button" class="btn-close" @click="showMobileFilters = false"></button>
      </div>
      <div class="offcanvas-body">
        <div class="mb-4">
          <div class="fw-semibold small mb-2">Category</div>
          <div v-for="cat in CATEGORIES" :key="cat.slug" class="form-check mb-1">
            <input type="radio" class="form-check-input" :id="`mcat-${cat.slug}`" :value="cat.slug" v-model="localFilters.category" />
            <label :for="`mcat-${cat.slug}`" class="form-check-label">{{ cat.name }}</label>
          </div>
          <div class="form-check mb-1">
            <input type="radio" class="form-check-input" id="mcat-all" value="" v-model="localFilters.category" />
            <label for="mcat-all" class="form-check-label">All Categories</label>
          </div>
        </div>
        <div class="mb-4">
          <div class="fw-semibold small mb-2">Price Range</div>
          <div class="d-flex gap-2">
            <input v-model.number="localFilters.min_price" type="number" class="form-control" placeholder="Min" />
            <input v-model.number="localFilters.max_price" type="number" class="form-control" placeholder="Max" />
          </div>
        </div>
        <button class="btn btn-primary w-100" @click="applyFilters(); showMobileFilters = false">Apply</button>
        <button v-if="hasActiveFilters" class="btn btn-outline-danger w-100 mt-2" @click="clearFilters(); showMobileFilters = false">Clear All</button>
      </div>
    </div>
    <div v-if="showMobileFilters" class="offcanvas-backdrop fade show" @click="showMobileFilters = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'

const route         = useRoute()
const productsStore = useProductsStore()

const showMobileFilters = ref(false)

const CATEGORIES = computed(() => productsStore.categories)

const localFilters = ref({
  category:  '',
  min_price: '',
  max_price: '',
  sort:      'newest',
  search:    ''
})

const activeCategory = computed(() =>
  CATEGORIES.value.find(c => c.slug === productsStore.activeFilters.category)
)

const hasActiveFilters = computed(() => {
  const f = productsStore.activeFilters
  return f.category || f.min_price || f.max_price || f.search
})

function syncFromRoute() {
  const q = route.query
  localFilters.value = {
    category:  q.category  || '',
    min_price: q.min_price || '',
    max_price: q.max_price || '',
    sort:      q.sort      || 'newest',
    search:    q.search    || ''
  }
  Object.entries(localFilters.value).forEach(([k, v]) => productsStore.setFilter(k, v))
}

async function applyFilters() {
  Object.entries(localFilters.value).forEach(([k, v]) => productsStore.setFilter(k, v))
  productsStore.pagination.page = 1
  await productsStore.fetchProducts()
}

function clearFilters() {
  localFilters.value = { category: '', min_price: '', max_price: '', sort: 'newest', search: '' }
  productsStore.resetFilters()
  productsStore.fetchProducts()
}

function clearCategory() { localFilters.value.category = ''; applyFilters() }
function clearSearch()   { localFilters.value.search   = ''; applyFilters() }
function clearPrice()    { localFilters.value.min_price = ''; localFilters.value.max_price = ''; applyFilters() }

async function loadMore() {
  productsStore.pagination.page++
  await productsStore.fetchProducts({}, true)
}

// React to URL query params (e.g. from navbar search or category links)
watch(() => route.query, () => {
  syncFromRoute()
  productsStore.fetchProducts()
}, { immediate: false })

onMounted(() => {
  syncFromRoute()
  productsStore.fetchProducts()
  if (!productsStore.categories.length) productsStore.fetchCategories()
})
</script>
