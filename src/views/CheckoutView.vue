<template>
  <div class="container py-5">
    <div class="divider-primary"></div>
    <h2 class="section-title">Checkout</h2>

    <!-- Step indicator -->
    <div class="step-indicator d-flex mb-5 pb-2" style="max-width:540px">
      <div v-for="(step, i) in steps" :key="i" class="step" :class="{ active: currentStep === i, completed: currentStep > i }">
        <div class="step-num">
          <i v-if="currentStep > i" class="bi bi-check-lg"></i>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="small mt-1 text-muted">{{ step }}</div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Form area -->
      <div class="col-lg-7">

        <!-- Step 1: Shipping -->
        <div v-if="currentStep === 0">
          <h5 class="fw-bold mb-3"><i class="bi bi-geo-alt me-2 text-primary"></i>Shipping Address</h5>
          <form @submit.prevent="currentStep = 1" class="row g-3">
            <div class="col-6">
              <label class="form-label">First Name</label>
              <input v-model="shipping.first_name" type="text" class="form-control" required />
            </div>
            <div class="col-6">
              <label class="form-label">Last Name</label>
              <input v-model="shipping.last_name" type="text" class="form-control" required />
            </div>
            <div class="col-12">
              <label class="form-label">Address Line 1</label>
              <input v-model="shipping.address1" type="text" class="form-control" placeholder="Street address" required />
            </div>
            <div class="col-12">
              <label class="form-label">Address Line 2 <span class="text-muted small">(optional)</span></label>
              <input v-model="shipping.address2" type="text" class="form-control" placeholder="Apt, suite, floor…" />
            </div>
            <div class="col-md-5">
              <label class="form-label">City</label>
              <input v-model="shipping.city" type="text" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">State</label>
              <input v-model="shipping.state" type="text" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">ZIP Code</label>
              <input v-model="shipping.zip" type="text" class="form-control" required />
            </div>
            <div class="col-12">
              <label class="form-label">Country</label>
              <select v-model="shipping.country" class="form-select" required>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label">Phone</label>
              <input v-model="shipping.phone" type="tel" class="form-control" placeholder="+1 (555) 000-0000" />
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary px-5">
                Continue to Payment <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Payment -->
        <div v-if="currentStep === 1">
          <h5 class="fw-bold mb-3"><i class="bi bi-credit-card me-2 text-primary"></i>Payment Details</h5>
          <div class="alert alert-info d-flex align-items-center gap-2 mb-4 py-2">
            <i class="bi bi-info-circle-fill"></i>
            <span class="small">This is a demo checkout. No real payment is processed.</span>
          </div>

          <form @submit.prevent="placeOrder" class="row g-3">
            <div class="col-12">
              <label class="form-label">Name on Card</label>
              <input v-model="payment.name" type="text" class="form-control" placeholder="John Doe" required />
            </div>
            <div class="col-12">
              <label class="form-label">Card Number</label>
              <div class="input-group">
                <input
                  v-model="payment.card"
                  type="text"
                  class="form-control"
                  placeholder="4242 4242 4242 4242"
                  maxlength="19"
                  @input="formatCard"
                  required
                />
                <span class="input-group-text"><i class="bi bi-credit-card"></i></span>
              </div>
            </div>
            <div class="col-7">
              <label class="form-label">Expiry Date</label>
              <input v-model="payment.expiry" type="text" class="form-control" placeholder="MM / YY" maxlength="7" required />
            </div>
            <div class="col-5">
              <label class="form-label">CVV</label>
              <input v-model="payment.cvv" type="text" class="form-control" placeholder="123" maxlength="4" required />
            </div>

            <div v-if="orderError" class="col-12">
              <div class="alert alert-danger py-2 small">{{ orderError }}</div>
            </div>

            <div class="col-12 d-flex gap-3">
              <button type="button" class="btn btn-outline-secondary" @click="currentStep = 0">
                <i class="bi bi-arrow-left me-1"></i>Back
              </button>
              <button type="submit" class="btn btn-primary flex-grow-1" :disabled="placing">
                <span v-if="placing" class="spinner-border spinner-border-sm me-2"></span>
                {{ placing ? 'Placing order…' : `Pay $${cartStore.total.toFixed(2)}` }}
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Order summary sidebar -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm p-4 sticky-top" style="top:76px">
          <h6 class="fw-bold mb-3">Order Summary</h6>
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="d-flex gap-2 align-items-start mb-3"
          >
            <div class="position-relative flex-shrink-0">
              <img
                :src="item.product.image_url || 'https://placehold.co/56x56?text=IMG'"
                :alt="item.product.name"
                class="rounded"
                style="width:56px;height:56px;object-fit:cover"
              />
              <span class="position-absolute top-0 start-100 translate-middle badge bg-secondary rounded-pill" style="font-size:.65rem">
                {{ item.quantity }}
              </span>
            </div>
            <div class="flex-grow-1 small">
              <div class="fw-semibold">{{ item.product.name }}</div>
              <div v-if="item.variant" class="text-muted">{{ item.variant.name }}</div>
            </div>
            <div class="small fw-bold">${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
          <hr />
          <div class="d-flex justify-content-between small text-muted mb-1">
            <span>Subtotal</span><span>${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="cartStore.discount > 0" class="d-flex justify-content-between small text-success mb-1">
            <span>Discount</span><span>-${{ cartStore.discount.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>Shipping</span>
            <span>{{ cartStore.shipping === 0 ? 'FREE' : `$${cartStore.shipping.toFixed(2)}` }}</span>
          </div>
          <div class="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span style="color:var(--ah-primary)">${{ cartStore.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import { ordersApi } from '@/api/orders'

const router    = useRouter()
const cartStore = useCartStore()
const uiStore   = useUiStore()

const steps = ['Shipping', 'Payment']
const currentStep = ref(0)
const placing  = ref(false)
const orderError = ref('')

const shipping = ref({
  first_name: '', last_name: '', address1: '', address2: '',
  city: '', state: '', zip: '', country: 'US', phone: ''
})

const payment = ref({ name: '', card: '', expiry: '', cvv: '' })

function formatCard(e) {
  let v = e.target.value.replace(/\D/g, '').substring(0, 16)
  payment.value.card = v.replace(/(.{4})/g, '$1 ').trim()
}

async function placeOrder() {
  placing.value = true
  orderError.value = ''
  try {
    const payload = {
      shipping_address: shipping.value,
      items: cartStore.items.map(i => ({
        product_id: i.product.id,
        variant_id: i.variant?.id,
        quantity: i.quantity,
        price: i.price
      })),
      coupon_code: cartStore.coupon?.code,
      total: cartStore.total
    }
    const { data } = await ordersApi.createOrder(payload)
    await cartStore.clearCart()
    router.push({ name: 'order-confirmation', params: { id: data.id || data.order_id } })
  } catch (err) {
    orderError.value = err.response?.data?.message || 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}
</script>
