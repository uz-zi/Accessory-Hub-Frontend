<template>
  <div class="container py-5">
    <div class="row g-4">
      <div class="col-md-3">
        <AccountSidebar />
      </div>
      <div class="col-md-9">
        <div class="card border-0 shadow-sm p-4">
          <h4 class="fw-bold mb-1">My Wishlist</h4>
          <p class="text-muted small mb-4">Products you've saved for later</p>

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="wishlistItems.length === 0" class="text-center py-5">
            <i class="bi bi-heart fs-1 text-muted opacity-25 d-block mb-3"></i>
            <h5 class="fw-bold">Your wishlist is empty</h5>
            <p class="text-muted">Save items you love by clicking the heart icon on any product.</p>
            <RouterLink :to="{ name: 'products' }" class="btn btn-primary mt-2">Browse Products</RouterLink>
          </div>

          <div v-else class="row g-3">
            <div
              v-for="item in wishlistItems"
              :key="item.id"
              class="col-sm-6 col-lg-4"
            >
              <div class="card border h-100">
                <RouterLink :to="{ name: 'product-detail', params: { id: item.product?.id || item.id } }">
                  <img
                    :src="item.product?.image_url || item.image_url || 'https://placehold.co/300x200?text=IMG'"
                    :alt="item.product?.name || item.name"
                    class="card-img-top"
                    style="aspect-ratio:4/3;object-fit:cover"
                  />
                </RouterLink>
                <div class="card-body d-flex flex-column p-3">
                  <RouterLink
                    :to="{ name: 'product-detail', params: { id: item.product?.id || item.id } }"
                    class="text-dark fw-semibold small mb-1"
                  >
                    {{ item.product?.name || item.name }}
                  </RouterLink>
                  <div class="mt-auto pt-2 d-flex align-items-center justify-content-between">
                    <span class="fw-bold text-primary">${{ parseFloat(item.product?.price || item.price || 0).toFixed(2) }}</span>
                    <div class="d-flex gap-1">
                      <button
                        class="btn btn-sm btn-primary rounded-pill px-2"
                        :disabled="adding === (item.product?.id || item.id)"
                        @click="addToCart(item)"
                        title="Add to cart"
                      >
                        <span v-if="adding === (item.product?.id || item.id)" class="spinner-border spinner-border-sm"></span>
                        <i v-else class="bi bi-bag-plus"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger rounded-pill px-2"
                        @click="removeFromWishlist(item)"
                        title="Remove"
                      >
                        <i class="bi bi-heart-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { wishlistApi } from '@/api/wishlist'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useUiStore } from '@/stores/ui'
import AccountSidebar from '@/components/AccountSidebar.vue'

const cartStore     = useCartStore()
const productsStore = useProductsStore()
const uiStore       = useUiStore()

const wishlistItems = ref([])
const loading       = ref(false)
const adding        = ref(null)

async function fetchWishlist() {
  loading.value = true
  try {
    const { data } = await wishlistApi.getWishlist()
    wishlistItems.value = data.items || data
  } catch {
    uiStore.toast('Failed to load wishlist', 'error')
  } finally {
    loading.value = false
  }
}

async function removeFromWishlist(item) {
  const id = item.product?.id || item.id
  try {
    await wishlistApi.removeItem(id)
    wishlistItems.value = wishlistItems.value.filter(i => (i.product?.id || i.id) !== id)
    productsStore.wishlistIds.delete(id)
    productsStore.wishlistIds = new Set(productsStore.wishlistIds)
    uiStore.toast('Removed from wishlist')
  } catch {
    uiStore.toast('Could not remove item', 'error')
  }
}

async function addToCart(item) {
  const product = item.product || item
  const id = product.id
  adding.value = id
  await cartStore.addItem(product)
  adding.value = null
  uiStore.openCart()
  uiStore.toast(`${product.name} added to cart!`)
}

onMounted(fetchWishlist)
</script>
