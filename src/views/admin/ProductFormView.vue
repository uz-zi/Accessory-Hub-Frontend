<template>
  <div style="max-width:900px">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink :to="{ name: 'admin-products' }" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left"></i>
      </RouterLink>
      <div>
        <h3 class="fw-bold mb-0">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h3>
        <p class="text-muted small mb-0">{{ isEdit ? `Editing product #${route.params.id}` : 'Fill in the details below to create a new product' }}</p>
      </div>
    </div>

    <div v-if="loadingProduct" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <form v-else @submit.prevent="submit">
      <div class="row g-4">

        <!-- LEFT COLUMN -->
        <div class="col-lg-8">

          <!-- Basic Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom px-4 py-3">
              <span class="fw-semibold"><i class="bi bi-info-circle me-2 text-primary"></i>Basic Information</span>
            </div>
            <div class="card-body px-4 py-4 row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold small">Product Name <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control" required placeholder="e.g. Premium Leather Case for iPhone 15 Pro" />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold small d-flex justify-content-between">
                  Description
                  <span class="text-muted fw-normal">{{ (form.description || '').length }} / 2000</span>
                </label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="5"
                  maxlength="2000"
                  placeholder="Describe the product — features, materials, compatibility, etc."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom px-4 py-3">
              <span class="fw-semibold"><i class="bi bi-tag me-2 text-success"></i>Pricing</span>
            </div>
            <div class="card-body px-4 py-4 row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Sale Price ($) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input v-model.number="form.price" type="number" class="form-control" step="0.01" min="0" required placeholder="0.00" />
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Original Price ($) <span class="text-muted fw-normal">(optional)</span></label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input v-model.number="form.original_price" type="number" class="form-control" step="0.01" min="0" placeholder="Before discount" />
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Discount %</label>
                <div class="input-group">
                  <input v-model.number="form.discount_percent" type="number" class="form-control" min="0" max="100" placeholder="e.g. 20" />
                  <span class="input-group-text">%</span>
                </div>
              </div>

              <!-- Live price preview -->
              <div class="col-12" v-if="form.price">
                <div class="price-preview">
                  <span class="fw-bold text-primary fs-5">${{ parseFloat(form.price || 0).toFixed(2) }}</span>
                  <span v-if="form.original_price" class="text-muted text-decoration-line-through ms-2">${{ parseFloat(form.original_price).toFixed(2) }}</span>
                  <span v-if="form.discount_percent" class="badge bg-danger ms-2">-{{ form.discount_percent }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom px-4 py-3">
              <span class="fw-semibold"><i class="bi bi-box-seam me-2 text-warning"></i>Inventory & Classification</span>
            </div>
            <div class="card-body px-4 py-4 row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Stock Quantity <span class="text-danger">*</span></label>
                <input v-model.number="form.stock" type="number" class="form-control" min="0" required />
                <div class="form-text" :class="form.stock === 0 ? 'text-danger' : form.stock < 10 ? 'text-warning' : 'text-success'">
                  {{ form.stock === 0 ? 'Out of stock' : form.stock < 10 ? 'Low stock' : 'In stock' }}
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Category</label>
                <select v-model.number="form.category_id" class="form-select">
                  <option value="">— None —</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold small">Rating (0–5)</label>
                <div class="input-group">
                  <input v-model.number="form.rating" type="number" class="form-control" step="0.1" min="0" max="5" placeholder="0.0" />
                  <span class="input-group-text text-warning"><i class="bi bi-star-fill"></i></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-lg-4">

          <!-- Product Image -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom px-4 py-3">
              <span class="fw-semibold"><i class="bi bi-image me-2 text-info"></i>Product Image</span>
            </div>
            <div class="card-body px-4 py-4">
              <!-- Drop zone -->
              <div
                class="img-drop-zone"
                :class="{ dragging: isDragging, 'has-img': form.image_url }"
                :style="form.image_url ? `background-image:url(${form.image_url})` : ''"
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @dragover.prevent
                @drop.prevent="handleDrop"
                @click="fileInput?.click()"
              >
                <div class="drop-content" :class="{ hidden: form.image_url }">
                  <span v-if="uploading" class="spinner-border text-primary mb-2"></span>
                  <template v-else>
                    <i class="bi bi-cloud-upload fs-1 text-muted d-block mb-2"></i>
                    <div class="fw-semibold small">Drop image here</div>
                    <div class="text-muted" style="font-size:.75rem">or click to browse</div>
                  </template>
                </div>
                <div class="drop-hover-label">
                  <span v-if="uploading"><span class="spinner-border spinner-border-sm text-white me-1"></span>Uploading…</span>
                  <span v-else><i class="bi bi-cloud-upload me-1"></i>Change image</span>
                </div>
              </div>

              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="handleFileChange"
              />

              <div class="mt-2">
                <label class="form-label fw-semibold small">Or paste image URL</label>
                <input v-model="form.image_url" type="url" class="form-control form-control-sm" placeholder="https://…" />
              </div>

              <div v-if="uploadError" class="alert alert-danger small py-2 mt-2 mb-0">{{ uploadError }}</div>
              <div class="text-muted mt-1" style="font-size:.72rem">JPG, PNG, WebP · max 5 MB</div>
            </div>
          </div>

          <!-- Flags -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom px-4 py-3">
              <span class="fw-semibold"><i class="bi bi-toggles me-2 text-purple"></i>Visibility</span>
            </div>
            <div class="card-body px-4 py-3 d-flex flex-column gap-3">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="fw-semibold small">Mark as New</div>
                  <div class="text-muted" style="font-size:.75rem">Shows a "New" badge</div>
                </div>
                <div class="form-check form-switch mb-0">
                  <input v-model="form.is_new" class="form-check-input" type="checkbox" role="switch" id="switchNew" style="width:2.5rem;height:1.25rem" />
                  <label class="form-check-label visually-hidden" for="switchNew">New</label>
                </div>
              </div>
              <hr class="my-0" />
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="fw-semibold small">Featured Product</div>
                  <div class="text-muted" style="font-size:.75rem">Shown on the homepage</div>
                </div>
                <div class="form-check form-switch mb-0">
                  <input v-model="form.featured" class="form-check-input" type="checkbox" role="switch" id="switchFeatured" style="width:2.5rem;height:1.25rem" />
                  <label class="form-check-label visually-hidden" for="switchFeatured">Featured</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit card -->
          <div class="card border-0 shadow-sm">
            <div class="card-body px-4 py-4">
              <div v-if="error" class="alert alert-danger small py-2 mb-3">{{ error }}</div>
              <button type="submit" class="btn btn-primary w-100 mb-2" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ isEdit ? 'Save Changes' : 'Create Product' }}
              </button>
              <RouterLink :to="{ name: 'admin-products' }" class="btn btn-outline-secondary w-100">Cancel</RouterLink>
            </div>
          </div>

        </div>
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

const route   = useRoute()
const router  = useRouter()
const uiStore = useUiStore()

const isEdit         = computed(() => !!route.params.id)
const loadingProduct = ref(false)
const saving         = ref(false)
const uploading      = ref(false)
const isDragging     = ref(false)
const uploadError    = ref('')
const error          = ref('')
const categories     = ref([])
const fileInput      = ref(null)

const form = ref({
  name: '', description: '', price: '', original_price: '', discount_percent: '',
  stock: 0, category_id: '', image_url: '', is_new: false, featured: false, rating: ''
})

async function doUpload(file) {
  uploading.value   = true
  uploadError.value = ''
  try {
    const { data } = await adminApi.uploadImage(file)
    form.value.image_url = data.url
  } catch {
    uploadError.value = 'Upload failed — check file size and type, or paste a URL instead.'
  } finally {
    uploading.value = false
  }
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) doUpload(file)
  e.target.value = ''
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file?.type.startsWith('image/')) doUpload(file)
}

async function submit() {
  saving.value = true
  error.value  = ''
  const payload = { ...form.value }
  if (!payload.original_price)   delete payload.original_price
  if (!payload.discount_percent) delete payload.discount_percent
  if (!payload.category_id)      delete payload.category_id
  if (!payload.rating)           delete payload.rating
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
  try {
    const { data } = await productsApi.getCategories()
    categories.value = Array.isArray(data) ? data : (data.categories || [])
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


<style scoped>
/* Image drop zone */
.img-drop-zone {
  width: 100%;
  aspect-ratio: 1;
  border: 2px dashed #d0d0e8;
  border-radius: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: border-color .2s, background-color .2s;
}
.img-drop-zone:hover,
.img-drop-zone.dragging {
  border-color: var(--ah-primary);
  background-color: rgba(108,99,255,.04);
}
.img-drop-zone.has-img { border-style: solid; border-color: transparent; }

.drop-content {
  text-align: center;
  pointer-events: none;
  padding: 1rem;
  transition: opacity .2s;
}
.drop-content.hidden { opacity: 0; }

.drop-hover-label {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: .9rem;
  opacity: 0;
  transition: opacity .25s;
  border-radius: inherit;
}
.img-drop-zone:hover .drop-hover-label { opacity: 1; }

/* Price preview pill */
.price-preview {
  background: var(--ah-secondary);
  border-radius: .5rem;
  padding: .5rem 1rem;
  display: inline-flex;
  align-items: center;
}
</style>
