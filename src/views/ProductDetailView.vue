<template>
  <div class="container py-5">
    <!-- Loading -->
    <div v-if="productsStore.loading || (!product && !productsStore.error)" class="row g-4 placeholder-glow">
      <div class="col-md-5">
        <span class="placeholder w-100 d-block rounded-3" style="aspect-ratio:1"></span>
      </div>
      <div class="col-md-7">
        <span class="placeholder col-8 d-block mb-3" style="height:2rem"></span>
        <span class="placeholder col-4 d-block mb-3"></span>
        <span class="placeholder col-6 d-block mb-2"></span>
        <span class="placeholder col-12 d-block mb-1" v-for="n in 4" :key="n"></span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="productsStore.error" class="text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-danger d-block mb-3"></i>
      <h4>{{ productsStore.error }}</h4>
      <RouterLink :to="{ name: 'products' }" class="btn btn-primary mt-3">Back to Shop</RouterLink>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="row g-4">
      <!-- Images -->
      <div class="col-md-5">
        <div class="product-detail-img mb-2 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center" style="aspect-ratio:1">
          <img
            :src="activeImage || 'https://placehold.co/500x500?text=No+Image'"
            :alt="product.name"
            class="img-fluid"
            style="max-height:100%;object-fit:contain"
          />
        </div>
        <!-- Thumbnail gallery -->
        <div v-if="product.images?.length > 1" class="d-flex gap-2 flex-wrap">
          <div
            v-for="(img, i) in product.images"
            :key="i"
            class="rounded border cursor-pointer overflow-hidden"
            :class="{ 'border-primary border-2': activeImage === img }"
            style="width:64px;height:64px;cursor:pointer"
            @click="activeImage = img"
          >
            <img :src="img" :alt="`Image ${i+1}`" class="w-100 h-100" style="object-fit:cover" />
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="col-md-7">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-2">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink :to="{ name: 'products' }">Shop</RouterLink></li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <!-- Category badge -->
        <span class="badge bg-primary-subtle text-primary mb-2" style="font-size:.8rem">
          {{ product.category?.name || product.category }}
        </span>

        <h1 class="fw-bold fs-3 mb-1">{{ product.name }}</h1>

        <!-- Rating -->
        <div class="star-rating d-flex align-items-center gap-1 mb-3" style="font-size:.9rem">
          <i v-for="n in 5" :key="n" :class="n <= Math.round(product.rating || 0) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
          <span class="text-muted ms-1 small">({{ product.review_count || 0 }} reviews)</span>
          <button class="btn btn-link btn-sm p-0 ms-2 small" @click="scrollToReviews">Read reviews</button>
        </div>

        <!-- Price -->
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="fs-2 fw-bold" style="color:var(--ah-primary)">${{ displayPrice }}</span>
          <span v-if="product.original_price" class="text-muted text-decoration-line-through fs-5">
            ${{ parseFloat(product.original_price).toFixed(2) }}
          </span>
          <span v-if="product.discount_percent" class="badge bg-danger rounded-pill fs-6">
            -{{ product.discount_percent }}%
          </span>
        </div>

        <!-- Variants -->
        <div v-if="product.variants?.length" class="mb-4">
          <div class="fw-semibold small mb-2">Options</div>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="v in product.variants"
              :key="v.id"
              class="btn btn-sm"
              :class="selectedVariant?.id === v.id ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectedVariant = v"
            >
              {{ v.name }}
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="d-flex align-items-center gap-3 mb-4">
          <div class="fw-semibold small">Quantity</div>
          <div class="input-group" style="width:120px">
            <button class="btn btn-outline-secondary" @click="qty > 1 && qty--" :disabled="qty <= 1">-</button>
            <input type="number" class="form-control text-center" v-model.number="qty" min="1" :max="product.stock" />
            <button class="btn btn-outline-secondary" @click="qty < (product.stock || 99) && qty++" :disabled="qty >= (product.stock || 99)">+</button>
          </div>
          <span class="text-muted small">
            <i class="bi bi-box-seam me-1"></i>
            {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
          </span>
        </div>

        <!-- Actions -->
        <div class="d-flex flex-wrap gap-3 mb-4">
          <button
            class="btn btn-primary btn-lg flex-grow-1"
            :disabled="product.stock === 0 || adding"
            @click="handleAddToCart"
          >
            <span v-if="adding" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-bag-plus me-2"></i>
            {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
          </button>
          <button
            class="btn btn-lg"
            :class="productsStore.isWishlisted(product.id) ? 'btn-danger' : 'btn-outline-secondary'"
            @click="productsStore.toggleWishlist(product.id)"
            :title="productsStore.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
          >
            <i :class="productsStore.isWishlisted(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
          </button>
        </div>

        <!-- Trust badges -->
        <div class="d-flex flex-wrap gap-3 text-muted small mb-4">
          <span><i class="bi bi-truck me-1 text-primary"></i>Free shipping $50+</span>
          <span><i class="bi bi-arrow-return-left me-1 text-primary"></i>30-day returns</span>
          <span><i class="bi bi-shield-check me-1 text-primary"></i>2-year warranty</span>
        </div>

        <!-- Description accordion -->
        <div class="accordion" id="productAccordion">
          <div class="accordion-item border-0 border-bottom">
            <h2 class="accordion-header">
              <button class="accordion-button fw-semibold px-0" type="button" data-bs-toggle="collapse" data-bs-target="#desc">
                Description
              </button>
            </h2>
            <div id="desc" class="accordion-collapse collapse show" data-bs-parent="#productAccordion">
              <div class="accordion-body px-0 text-muted">
                {{ product.description || 'No description available.' }}
              </div>
            </div>
          </div>
          <div v-if="product.specifications" class="accordion-item border-0 border-bottom">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed fw-semibold px-0" type="button" data-bs-toggle="collapse" data-bs-target="#specs">
                Specifications
              </button>
            </h2>
            <div id="specs" class="accordion-collapse collapse" data-bs-parent="#productAccordion">
              <div class="accordion-body px-0">
                <table class="table table-sm table-borderless">
                  <tbody>
                    <tr v-for="(val, key) in product.specifications" :key="key">
                      <td class="fw-semibold text-muted" style="width:40%">{{ key }}</td>
                      <td>{{ val }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews section -->
    <div ref="reviewsSection" class="mt-5" v-if="product">
      <div class="divider-primary"></div>
      <h3 class="section-title">Customer Reviews</h3>

      <div class="row g-4">
        <div class="col-md-3 text-center">
          <div class="display-2 fw-bold" style="color:var(--ah-primary)">{{ product.rating ? parseFloat(product.rating).toFixed(1) : '–' }}</div>
          <div class="star-rating justify-content-center mb-1">
            <i v-for="n in 5" :key="n" :class="n <= Math.round(product.rating || 0) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
          </div>
          <div class="text-muted small">Based on {{ product.review_count || 0 }} reviews</div>
        </div>
        <div class="col-md-9">
          <div v-if="reviews.length === 0" class="text-muted">
            No reviews yet. Be the first to review this product!
          </div>
          <div v-for="review in reviews" :key="review.id" class="border-bottom pb-3 mb-3">
            <div class="d-flex align-items-center gap-2 mb-1">
              <div class="star-rating" style="font-size:.8rem">
                <i v-for="n in 5" :key="n" :class="n <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'"></i>
              </div>
              <span class="fw-semibold small">{{ review.title }}</span>
              <span class="text-muted small ms-auto">{{ formatDate(review.created_at) }}</span>
            </div>
            <p class="text-muted small mb-1">{{ review.body }}</p>
            <span class="text-muted" style="font-size:.75rem">
              <i class="bi bi-person-circle me-1"></i>{{ review.user?.first_name || 'Anonymous' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Related products -->
    <div class="mt-5" v-if="relatedProducts.length">
      <div class="divider-primary"></div>
      <h3 class="section-title">You Might Also Like</h3>
      <div class="row g-3">
        <div class="col-6 col-md-3" v-for="p in relatedProducts" :key="p.id">
          <ProductCard :product="p" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import { productsApi } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'

const route         = useRoute()
const productsStore = useProductsStore()
const cartStore     = useCartStore()
const uiStore       = useUiStore()

const product        = computed(() => productsStore.current)
const activeImage    = ref(null)
const selectedVariant = ref(null)
const qty            = ref(1)
const adding         = ref(false)
const reviews        = ref([])
const relatedProducts = ref([])
const reviewsSection = ref(null)

const displayPrice = computed(() => {
  const p = selectedVariant.value?.price ?? product.value?.price ?? 0
  return parseFloat(p).toFixed(2)
})

async function load(id) {
  await productsStore.fetchProduct(id)
  if (product.value) {
    activeImage.value    = product.value.image_url || product.value.images?.[0] || null
    selectedVariant.value = product.value.variants?.[0] || null
    qty.value = 1

    // Load reviews
    try {
      const { data } = await productsApi.getReviews(id)
      reviews.value = data.reviews || data
    } catch { reviews.value = [] }

    // Load related (same category)
    try {
      const { data } = await productsApi.getAll({ category: product.value.category?.slug, per_page: 4 })
      relatedProducts.value = (data.products || []).filter(p => p.id !== product.value.id).slice(0, 4)
    } catch { relatedProducts.value = [] }
  }
}

async function handleAddToCart() {
  adding.value = true
  await cartStore.addItem(product.value, selectedVariant.value, qty.value)
  adding.value = false
  uiStore.openCart()
  uiStore.toast(`${product.value.name} added to cart!`)
}

function scrollToReviews() {
  reviewsSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

watch(() => route.params.id, id => load(id), { immediate: false })
onMounted(() => load(route.params.id))
</script>
