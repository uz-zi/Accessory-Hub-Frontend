<template>
  <div style="max-width:800px">
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink :to="{ name: 'admin-products' }" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left"></i>
      </RouterLink>
      <h3 class="fw-bold mb-0">{{ isEdit ? 'Edit Product' : 'Add Product' }}</h3>
    </div>

    <div v-if="loadingProduct" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <form v-else @submit.prevent="submit" class="row g-3">
      <!-- Name -->
      <div class="col-12">
        <label class="form-label fw-semibold">Product Name <span class="text-danger">*</span></label>
        <input v-model="form.name" type="text" class="form-control" required />
      </div>

      <!-- Description -->
      <div class="col-12">
        <label class="form-label fw-semibold">Description</label>
        <textarea v-model="form.description" class="form-control" rows="4" placeholder="Product description…"></textarea>
      </div>

      <!-- Price & Original Price -->
      <div class="col-md-4">
        <label class="form-label fw-semibold">Price ($) <span class="text-danger">*</span></label>
        <input v-model.number="form.price" type="number" class="form-control" step="0.01" min="0" required />
      </div>
      <div class="col-md-4">
        <label class="form-label fw-semibold">Original Price ($)</label>
        <input v-model.number="form.original_price" type="number" class="form-control" step="0.01" min="0" placeholder="Before discount" />
      </div>
      <div class="col-md-4">
        <label class="form-label fw-semibold">Discount %</label>
        <input v-model.number="form.discount_percent" type="number" class="form-control" min="0" max="100" placeholder="e.g. 20" />
      </div>

      <!-- Stock & Category -->
      <div class="col-md-4">
        <label class="form-label fw-semibold">Stock Quantity <span class="text-danger">*</span></label>
        <input v-model.number="form.stock" type="number" class="form-control" min="0" required />
      </div>
      <div class="col-md-4">
        <label class="form-label fw-semibold">Category</label>
        <select v-model.number="form.category_id" class="form-select">
          <option value="">— None —</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label fw-semibold">Rating</label>
        <input v-model.number="form.rating" type="number" class="form-control" step="0.1" min="0" max="5" placeholder="0–5" />
      </div>

      <!-- Image Upload -->
      <div class="col-12">
        <label class="form-label fw-semibold">Product Image</label>
        <div class="d-flex align-items-start gap-3">
          <div
            v-if="form.image_url"
            class="rounded border overflow-hidden flex-shrink-0"
            style="width:100px;height:100px"
          >
            <img :src="form.image_url" class="w-100 h-100" style="object-fit:cover" @error="$event.target.style.display='none'" />
          </div>
          <div class="flex-grow-1">
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              accept="image/jpeg,image/png,image/webp,image/gif"
              @change="handleFileChange"
            />
            <button
              type="button"
              class="btn btn-outline-primary me-2"
              :disabled="uploading"
              @click="fileInput.click()"
            >
              <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-cloud-upload me-1"></i>
              {{ uploading ? 'Uploading…' : form.image_url ? 'Change Image' : 'Upload Image' }}
            </button>
            <div v-if="uploadError" class="text-danger small mt-1">{{ uploadError }}</div>
            <div class="text-muted small mt-1">JPG, PNG, WebP or GIF · max 5 MB</div>
          </div>
        </div>
      </div>

      <!-- Toggles -->
      <div class="col-12 d-flex flex-wrap gap-4">
        <div class="form-check form-switch">
          <input v-model="form.is_new" class="form-check-input" type="checkbox" id="isNew" />
          <label class="form-check-label" for="isNew">Mark as New</label>
        </div>
        <div class="form-check form-switch">
          <input v-model="form.featured" class="form-check-input" type="checkbox" id="featured" />
          <label class="form-check-label" for="featured">Featured Product</label>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="col-12">
        <div class="alert alert-danger py-2 small">{{ error }}</div>
      </div>

      <!-- Submit -->
      <div class="col-12 d-flex gap-3">
        <button type="submit" class="btn btn-primary px-4" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          {{ isEdit ? 'Save Changes' : 'Create Product' }}
        </button>
        <RouterLink :to="{ name: 'admin-products' }" class="btn btn-outline-secondary px-4">Cancel</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import { productsApi } from '@/api/products'
import { useUiStore } from '@/stores/ui'

const route  = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const isEdit         = computed(() => !!route.params.id)
const loadingProduct = ref(false)
const saving         = ref(false)
const uploading      = ref(false)
const uploadError    = ref('')
const error          = ref('')
const categories     = ref([])
const fileInput      = ref(null)

async function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value   = true
  uploadError.value = ''
  try {
    const { data } = await adminApi.uploadImage(file)
    form.value.image_url = data.url
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
    e.target.value  = ''
  }
}

const form = ref({
  name: '', description: '', price: '', original_price: '', discount_percent: '',
  stock: 0, category_id: '', image_url: '', is_new: false, featured: false, rating: ''
})

async function submit() {
  saving.value = true
  error.value  = ''
  const payload = { ...form.value }
  if (!payload.original_price) delete payload.original_price
  if (!payload.discount_percent) delete payload.discount_percent
  if (!payload.category_id) delete payload.category_id
  if (!payload.rating) delete payload.rating
  try {
    if (isEdit.value) {
      await adminApi.updateProduct(route.params.id, payload)
      uiStore.toast('Product updated!')
    } else {
      await adminApi.createProduct(payload)
      uiStore.toast('Product created!')
    }
    router.push({ name: 'admin-products' })
  } catch (err) {
    error.value = err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Failed to save product.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // load categories
  try {
    const { data } = await productsApi.getCategories()
    categories.value = data
  } catch { /* ignore */ }

  if (isEdit.value) {
    loadingProduct.value = true
    try {
      const { data } = await adminApi.getProduct(route.params.id)
      form.value = {
        name:             data.name             || '',
        description:      data.description      || '',
        price:            data.price            || '',
        original_price:   data.original_price   || '',
        discount_percent: data.discount_percent || '',
        stock:            data.stock            ?? 0,
        category_id:      data.category_id      || '',
        image_url:        data.image_url        || '',
        is_new:           data.is_new           || false,
        featured:         data.featured         || false,
        rating:           data.rating           || '',
      }
    } catch {
      uiStore.toast('Product not found', 'error')
      router.push({ name: 'admin-products' })
    } finally {
      loadingProduct.value = false
    }
  }
})
</script>
