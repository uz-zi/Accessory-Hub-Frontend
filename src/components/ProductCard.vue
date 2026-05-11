<template>
  <div class="card product-card h-100 border-0 shadow-sm" style="cursor:pointer" @click="goToProduct">
    <div class="product-img-wrap position-relative">
      <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }">
        <img
          :src="product.image_url || 'https://placehold.co/300x300?text=No+Image'"
          :alt="product.name"
          loading="lazy"
        />
      </RouterLink>

      <!-- Wishlist -->
      <button
        class="wishlist-btn"
        :class="{ active: productsStore.isWishlisted(product.id) }"
        @click.stop.prevent="productsStore.toggleWishlist(product.id)"
        title="Add to wishlist"
      >
        <i :class="productsStore.isWishlisted(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
      </button>

      <!-- Badges -->
      <div class="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
        <span v-if="product.is_new" class="badge bg-primary rounded-pill">New</span>
        <span v-if="product.discount_percent" class="badge bg-danger rounded-pill">-{{ product.discount_percent }}%</span>
        <span v-if="product.stock === 0" class="badge bg-secondary rounded-pill">Out of Stock</span>
      </div>
    </div>

    <div class="card-body d-flex flex-column p-3">
      <!-- Category -->
      <div class="text-muted mb-1" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em">
        {{ product.category?.name || product.category }}
      </div>

      <!-- Name -->
      <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="text-dark fw-semibold mb-2 d-block" style="font-size:.9rem;line-height:1.3">
        {{ product.name }}
      </RouterLink>

      <!-- Star rating -->
      <div class="star-rating d-flex align-items-center gap-1 mb-2" style="font-size:.8rem">
        <i v-for="n in 5" :key="n" :class="n <= Math.round(product.rating || 0) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
        <span class="text-muted ms-1">({{ product.review_count || 0 }})</span>
      </div>

      <div class="mt-auto d-flex align-items-center justify-content-between">
        <!-- Price -->
        <div>
          <span class="fw-bold text-primary fs-5">${{ displayPrice }}</span>
          <span v-if="product.original_price" class="text-muted text-decoration-line-through ms-1 small">
            ${{ parseFloat(product.original_price).toFixed(2) }}
          </span>
        </div>

        <!-- Add to cart -->
        <button
          class="btn btn-primary btn-sm rounded-pill px-3"
          :disabled="product.stock === 0 || adding"
          @click.stop.prevent="addToCart"
        >
          <i v-if="adding" class="bi bi-hourglass-split"></i>
          <i v-else class="bi bi-bag-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  product: { type: Object, required: true }
})

const router        = useRouter()
const cartStore     = useCartStore()
const productsStore = useProductsStore()
const uiStore       = useUiStore()
const adding        = ref(false)

function goToProduct() {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}

const displayPrice = computed(() =>
  parseFloat(props.product.price || 0).toFixed(2)
)

async function addToCart() {
  adding.value = true
  await cartStore.addItem(props.product)
  adding.value = false
  uiStore.openCart()
  uiStore.toast(`${props.product.name} added to cart!`)
}
</script>
