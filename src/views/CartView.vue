<template>
  <div class="container py-5">
    <div class="divider-primary"></div>
    <h2 class="section-title">Your Cart</h2>

    <!-- Empty cart -->
    <div v-if="!cartStore.items.length" class="text-center py-5">
      <i class="bi bi-bag-x fs-1 text-muted opacity-25 d-block mb-3"></i>
      <h4 class="fw-bold">Your cart is empty</h4>
      <p class="text-muted mb-4">Looks like you haven't added anything yet.</p>
      <RouterLink :to="{ name: 'products' }" class="btn btn-primary btn-lg px-5">
        <i class="bi bi-bag me-2"></i>Start Shopping
      </RouterLink>
    </div>

    <div v-else class="row g-4">
      <!-- Cart items -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div
              v-for="(item, i) in cartStore.items"
              :key="item.id"
              class="p-3"
              :class="{ 'border-bottom': i < cartStore.items.length - 1 }"
            >
              <div class="d-flex gap-3 align-items-start">
                <!-- Image -->
                <RouterLink :to="{ name: 'product-detail', params: { id: item.product.id } }">
                  <img
                    :src="item.product.image_url || 'https://placehold.co/88x88?text=IMG'"
                    :alt="item.product.name"
                    class="rounded-2"
                    style="width:88px;height:88px;object-fit:cover;flex-shrink:0"
                  />
                </RouterLink>

                <!-- Details -->
                <div class="flex-grow-1 min-w-0">
                  <RouterLink
                    :to="{ name: 'product-detail', params: { id: item.product.id } }"
                    class="text-dark fw-semibold d-block mb-1"
                  >{{ item.product.name }}</RouterLink>
                  <div v-if="item.variant" class="text-muted small mb-2">{{ item.variant.name }}</div>
                  <div class="text-muted small mb-2">${{ parseFloat(item.price).toFixed(2) }} each</div>

                  <div class="d-flex align-items-center flex-wrap gap-3">
                    <div class="input-group" style="width:120px">
                      <button class="btn btn-outline-secondary btn-sm" @click="decrement(item)" :disabled="item.quantity <= 1">-</button>
                      <input
                        type="number"
                        class="form-control form-control-sm text-center"
                        :value="item.quantity"
                        min="1"
                        @change="cartStore.updateItem(item.id, +$event.target.value)"
                        style="max-width:44px"
                      />
                      <button class="btn btn-outline-secondary btn-sm" @click="increment(item)">+</button>
                    </div>
                    <span class="fw-bold text-primary">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    <button class="btn btn-link btn-sm text-danger p-0 ms-auto" @click="cartStore.removeItem(item.id)">
                      <i class="bi bi-trash3 me-1"></i>Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue shopping -->
        <div class="mt-3">
          <RouterLink :to="{ name: 'products' }" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i>Continue Shopping
          </RouterLink>
          <button class="btn btn-link btn-sm text-danger ms-3" @click="cartStore.clearCart()">
            <i class="bi bi-trash3 me-1"></i>Clear Cart
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4">
          <h5 class="fw-bold mb-4">Order Summary</h5>

          <!-- Coupon -->
          <div class="mb-4">
            <div v-if="!couponVisible && !cartStore.coupon" class="text-end">
              <button class="btn btn-link btn-sm p-0 text-muted" @click="couponVisible = true">
                <i class="bi bi-tag me-1"></i>Have a coupon?
              </button>
            </div>
            <div v-if="couponVisible && !cartStore.coupon" class="input-group input-group-sm">
              <input v-model="couponCode" type="text" class="form-control" placeholder="Enter code" />
              <button class="btn btn-outline-primary" @click="applyCoupon">Apply</button>
            </div>
            <div v-if="couponError" class="text-danger small mt-1">{{ couponError }}</div>
            <div v-if="cartStore.coupon" class="d-flex align-items-center justify-content-between bg-success-subtle rounded p-2 mt-1">
              <span class="small text-success"><i class="bi bi-tag-fill me-1"></i><strong>{{ cartStore.coupon.code }}</strong> applied!</span>
              <button class="btn btn-link btn-sm p-0 text-danger" @click="cartStore.removeCoupon()">Remove</button>
            </div>
          </div>

          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>Subtotal ({{ cartStore.itemCount }} items)</span>
            <span>${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="cartStore.discount > 0" class="d-flex justify-content-between text-success small mb-2">
            <span>Discount</span>
            <span>-${{ cartStore.discount.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-3">
            <span>Shipping</span>
            <span>{{ cartStore.shipping === 0 ? 'FREE' : `$${cartStore.shipping.toFixed(2)}` }}</span>
          </div>
          <div v-if="cartStore.shipping > 0" class="alert alert-info py-2 small mb-3">
            <i class="bi bi-truck me-1"></i>
            Add ${{ (50 - cartStore.subtotal).toFixed(2) }} more for free shipping!
          </div>
          <hr />
          <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
            <span>Total</span>
            <span style="color:var(--ah-primary)">${{ cartStore.total.toFixed(2) }}</span>
          </div>

          <RouterLink :to="{ name: 'checkout' }" class="btn btn-primary w-100 py-2 mb-2">
            <i class="bi bi-lock me-1"></i>Secure Checkout
          </RouterLink>
          <p class="text-center text-muted" style="font-size:.75rem">
            <i class="bi bi-shield-lock me-1"></i>256-bit SSL encrypted checkout
          </p>

          <!-- Payment icons -->
          <div class="d-flex justify-content-center gap-3 text-muted fs-4 mt-1">
            <i class="bi bi-credit-card" title="Card"></i>
            <i class="bi bi-paypal" title="PayPal"></i>
            <i class="bi bi-stripe" title="Stripe"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore     = useCartStore()
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
