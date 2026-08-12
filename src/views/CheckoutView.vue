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
            <i class="bi bi-shield-lock-fill"></i>
            <span class="small">Payment is processed securely by Stripe. Your card details never touch our servers.</span>
          </div>

          <form @submit.prevent="placeOrder" class="row g-3">
            <div class="col-12">
              <label class="form-label">Name on Card</label>
              <input v-model="payment.name" type="text" class="form-control" placeholder="John Doe" required />
            </div>
            <div class="col-12">
              <label class="form-label">Card Details</label>
              <div ref="cardElementRef" class="form-control" style="height:auto;padding:0.65rem 0.75rem"></div>
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
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
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

const payment = ref({ name: '' })

// ── Stripe Elements ──────────────────────────────────────────────────────────
const cardElementRef = ref(null)
let stripe = null
let cardElement = null

watch(currentStep, async (step) => {
  if (step === 1 && !cardElement) {
    stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    const elements = stripe.elements()
    cardElement = elements.create('card')
    await nextTick()
    cardElement.mount(cardElementRef.value)
  }
})

onBeforeUnmount(() => {
  cardElement?.unmount()
})

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
    const { data: order } = await ordersApi.createOrder(payload)
    const orderId = order.id || order.order_id

    const { data: intent } = await ordersApi.createPaymentIntent({
      amount: cartStore.total,
      order_id: orderId
    })

    const { error, paymentIntent } = await stripe.confirmCardPayment(intent.client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: payment.value.name }
      }
    })

    if (error) {
      orderError.value = error.message
      return
    }

    if (paymentIntent.status === 'succeeded') {
      await ordersApi.confirmPayment(orderId, { payment_intent_id: paymentIntent.id })
    }

    await cartStore.clearCart()
    router.push({ name: 'order-confirmation', params: { id: orderId } })
  } catch (err) {
    orderError.value = err.response?.data?.message || 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}
</script>
