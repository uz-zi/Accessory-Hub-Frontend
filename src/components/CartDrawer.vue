<template>
  <!-- Overlay -->
  <div class="cart-drawer-overlay" :class="{ open: uiStore.cartOpen }" @click="uiStore.closeCart()"></div>

  <!-- Drawer -->
  <aside class="cart-drawer" :class="{ open: uiStore.cartOpen }">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
      <h5 class="mb-0 fw-bold">
        <i class="bi bi-bag me-2 text-primary"></i>
        Your Cart
        <span v-if="cartStore.itemCount" class="badge bg-primary ms-1 fs-6">{{ cartStore.itemCount }}</span>
      </h5>
      <button class="btn-close" @click="uiStore.closeCart()" aria-label="Close cart"></button>
    </div>

    <!-- Empty state -->
    <div v-if="!cartStore.items.length" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted">
      <i class="bi bi-bag-x fs-1 mb-3 opacity-25"></i>
      <p class="fw-semibold mb-1">Your cart is empty</p>
      <p class="small mb-3">Add some awesome accessories!</p>
      <RouterLink :to="{ name: 'products' }" class="btn btn-primary btn-sm" @click="uiStore.closeCart()">
        Shop Now
      </RouterLink>
    </div>

    <!-- Items list -->
    <div v-else class="flex-grow-1 overflow-auto p-3">
      <div
        v-for="item in cartStore.items"
        :key="item.id"
        class="d-flex gap-3 mb-3 pb-3 border-bottom align-items-start"
      >
        <!-- Image -->
        <RouterLink
          :to="{ name: 'product-detail', params: { id: item.product.id } }"
          @click="uiStore.closeCart()"
        >
          <img
            :src="item.product.image_url || 'https://placehold.co/72x72?text=IMG'"
            :alt="item.product.name"
            class="rounded"
            style="width:72px;height:72px;object-fit:cover;"
          />
        </RouterLink>

        <!-- Details -->
        <div class="flex-grow-1 min-w-0">
          <RouterLink
            :to="{ name: 'product-detail', params: { id: item.product.id } }"
            class="text-dark fw-semibold text-truncate d-block small"
            @click="uiStore.closeCart()"
          >
            {{ item.product.name }}
          </RouterLink>
          <div v-if="item.variant" class="text-muted" style="font-size:.75rem">
            {{ item.variant.name }}
          </div>

          <div class="d-flex align-items-center gap-2 mt-2">
            <!-- Quantity stepper -->
            <div class="input-group input-group-sm" style="width:96px;">
              <button class="btn btn-outline-secondary" @click="decrement(item)" :disabled="item.quantity <= 1">-</button>
              <input
                type="number"
                class="form-control text-center"
                :value="item.quantity"
                min="1"
                @change="cartStore.updateItem(item.id, +$event.target.value)"
                style="max-width:40px"
              />
              <button class="btn btn-outline-secondary" @click="increment(item)">+</button>
            </div>

            <!-- Price -->
            <span class="ms-auto fw-bold small text-primary">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Remove -->
        <button class="btn btn-link text-muted p-0 align-self-start" @click="cartStore.removeItem(item.id)" title="Remove">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- Footer: totals + checkout -->
    <div v-if="cartStore.items.length" class="border-top p-3">
      <!-- Coupon -->
      <div class="mb-3">
        <div v-if="!couponVisible" class="text-end">
          <button class="btn btn-link btn-sm p-0 text-muted" @click="couponVisible = true">
            Have a coupon?
          </button>
        </div>
        <div v-else class="input-group input-group-sm">
          <input v-model="couponCode" type="text" class="form-control" placeholder="Coupon code" />
          <button class="btn btn-outline-primary" @click="applyCoupon">Apply</button>
        </div>
        <div v-if="cartStore.coupon" class="mt-1 small text-success">
          <i class="bi bi-tag me-1"></i>{{ cartStore.coupon.code }} applied
          <button class="btn btn-link btn-sm p-0 text-danger ms-2" @click="cartStore.removeCoupon()">Remove</button>
        </div>
        <div v-if="couponError" class="mt-1 small text-danger">{{ couponError }}</div>
      </div>

      <!-- Totals -->
      <div class="d-flex justify-content-between small text-muted mb-1">
        <span>Subtotal</span><span>${{ cartStore.subtotal.toFixed(2) }}</span>
      </div>
      <div v-if="cartStore.discount > 0" class="d-flex justify-content-between small text-success mb-1">
        <span>Discount</span><span>-${{ cartStore.discount.toFixed(2) }}</span>
      </div>
      <div class="d-flex justify-content-between small text-muted mb-1">
        <span>Shipping</span>
        <span>{{ cartStore.shipping === 0 ? 'FREE' : `$${cartStore.shipping.toFixed(2)}` }}</span>
      </div>
      <div class="d-flex justify-content-between fw-bold mb-3 mt-2">
        <span>Total</span><span class="text-primary fs-5">${{ cartStore.total.toFixed(2) }}</span>
      </div>
      <div class="d-grid gap-2">
        <RouterLink :to="{ name: 'checkout' }" class="btn btn-primary" @click="uiStore.closeCart()">
          Checkout <i class="bi bi-arrow-right ms-1"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="btn btn-outline-secondary btn-sm" @click="uiStore.closeCart()">
          View Cart
        </RouterLink>
      </div>
      <p class="text-center text-muted small mt-2 mb-0">
        <i class="bi bi-lock me-1"></i>Secure checkout via Stripe
      </p>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'

const cartStore    = useCartStore()
const uiStore      = useUiStore()
const couponVisible = ref(false)
const couponCode    = ref('')
const couponError   = ref('')

function increment(item) { cartStore.updateItem(item.id, item.quantity + 1) }
function decrement(item) {
  if (item.quantity > 1) cartStore.updateItem(item.id, item.quantity - 1)
}

async function applyCoupon() {
  couponError.value = ''
  const result = await cartStore.applyCoupon(couponCode.value.trim())
  if (result.success) {
    couponCode.value    = ''
    couponVisible.value = false
  } else {
    couponError.value = result.message
  }
}
</script>
