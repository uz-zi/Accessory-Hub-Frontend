<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold mb-0">Products</h3>
      <RouterLink :to="{ name: 'admin-product-create' }" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Add Product
      </RouterLink>
    </div>

    <!-- Search -->
    <div class="card border-0 shadow-sm mb-4 p-3">
      <div class="row g-2">
        <div class="col-md-6">
          <input v-model="search" type="search" class="form-control" placeholder="Search products…" @input="debouncedFetch" />
        </div>
        <div class="col-md-3">
          <select v-model="perPage" class="form-select" @change="fetchProducts">
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else-if="products.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-box-seam fs-1 opacity-25 d-block mb-2"></i>No products found
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width:60px">Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th style="width:130px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <img :src="product.image_url || 'https://placehold.co/48x48?text=IMG'"
                  class="rounded" style="width:48px;height:48px;object-fit:cover" />
              </td>
              <td>
                <div class="fw-semibold small">{{ product.name }}</div>
                <div class="text-muted" style="font-size:.75rem">ID #{{ product.id }}</div>
              </td>
              <td class="small text-muted">{{ categoryName(product.category_id) }}</td>
              <td class="fw-semibold small">${{ parseFloat(product.price || 0).toFixed(2) }}</td>
              <td>
                <span class="badge rounded-pill" :class="product.stock > 0 ? 'bg-success' : 'bg-danger'">
                  {{ product.stock > 0 ? product.stock : 'Out' }}
                </span>
              </td>
              <td>
                <i v-if="product.featured" class="bi bi-star-fill text-warning"></i>
                <i v-else class="bi bi-star text-muted"></i>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <RouterLink :to="{ name: 'admin-product-edit', params: { id: product.id } }" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between p-3 border-top">
        <span class="text-muted small">{{ total }} total products</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="changePage(page - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="btn btn-sm btn-primary disabled">{{ page }} / {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages" @click="changePage(page + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useUiStore } from '@/stores/ui'

const uiStore      = useUiStore()
const products     = ref([])
const categories   = ref([])
const loading      = ref(false)
const search       = ref('')
const page         = ref(1)
const perPage      = ref(10)
const total        = ref(0)
const totalPages   = ref(1)

function categoryName(id) {
  const cat = categories.value.find(c => c.id === id)
  return cat?.name || '–'
}

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchProducts() }, 400)
}

async function fetchProducts() {
  loading.value = true
  try {
    const { data } = await adminApi.getProducts({ page: page.value, per_page: perPage.value, search: search.value })
    products.value   = data.products || []
    total.value      = data.total    || 0
    totalPages.value = data.total_pages || 1
  } catch {
    uiStore.toast('Failed to load products', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(p) { page.value = p; fetchProducts() }

async function deleteProduct(product) {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  try {
    await adminApi.deleteProduct(product.id)
    uiStore.toast(`"${product.name}" deleted`)
    fetchProducts()
  } catch {
    uiStore.toast('Failed to delete product', 'error')
  }
}

onMounted(async () => {
  try {
    const { data } = await adminApi.getCategories()
    categories.value = data.categories || []
  } catch { /* ignore */ }
  fetchProducts()
})
</script>
