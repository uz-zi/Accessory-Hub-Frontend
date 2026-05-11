<template>
  <div class="container py-5 text-center">
    <div style="max-width:540px;margin:0 auto">
      <!-- Success animation -->
      <div
        class="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
        style="width:96px;height:96px;background:rgba(25,135,84,.12)"
      >
        <i class="bi bi-check-circle-fill text-success" style="font-size:3.5rem"></i>
      </div>

      <h1 class="fw-bold mb-2">Order Confirmed!</h1>
      <p class="text-muted fs-5 mb-1">
        Thank you for your purchase. Your order has been received.
      </p>
      <p class="text-muted mb-4">
        Order ID: <strong class="text-dark">#{{ orderId }}</strong>
      </p>

      <div v-if="loading" class="spinner-border text-primary mb-4" role="status"></div>

      <!-- Order summary card -->
      <div v-if="order" class="card border-0 shadow-sm p-4 text-start mb-4">
        <h5 class="fw-bold mb-3">Order Details</h5>
        <div v-for="item in order.items" :key="item.id" class="d-flex align-items-center gap-3 mb-3">
          <img
            :src="item.product?.image_url || 'https://placehold.co/60x60?text=IMG'"
            :alt="item.product?.name"
            class="rounded"
            style="width:60px;height:60px;object-fit:cover;flex-shrink:0"
          />
          <div class="flex-grow-1">
            <div class="fw-semibold small">{{ item.product?.name }}</div>
            <div class="text-muted small">Qty: {{ item.quantity }}</div>
          </div>
          <div class="fw-bold small">${{ (item.price * item.quantity).toFixed(2) }}</div>
        </div>
        <hr />
        <div class="d-flex justify-content-between fw-bold">
          <span>Total Paid</span>
          <span style="color:var(--ah-primary)">${{ parseFloat(order.total || 0).toFixed(2) }}</span>
        </div>
      </div>

      <!-- What's next -->
      <div class="card border-0 shadow-sm p-4 text-start mb-4">
        <h6 class="fw-bold mb-3">What happens next?</h6>
        <div class="d-flex gap-3 mb-3">
          <i class="bi bi-envelope-check text-primary fs-4 flex-shrink-0"></i>
          <div>
            <div class="fw-semibold small">Confirmation email sent</div>
            <div class="text-muted small">Check your inbox for a receipt and tracking info.</div>
          </div>
        </div>
        <div class="d-flex gap-3 mb-3">
          <i class="bi bi-box-seam text-primary fs-4 flex-shrink-0"></i>
          <div>
            <div class="fw-semibold small">Processing your order</div>
            <div class="text-muted small">We'll prepare your items within 1–2 business days.</div>
          </div>
        </div>
        <div class="d-flex gap-3">
          <i class="bi bi-truck text-primary fs-4 flex-shrink-0"></i>
          <div>
            <div class="fw-semibold small">Shipping</div>
            <div class="text-muted small">Estimated delivery in 3–7 business days.</div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <RouterLink :to="{ name: 'account-orders' }" class="btn btn-primary px-4">
          <i class="bi bi-box-seam me-2"></i>View My Orders
        </RouterLink>
        <RouterLink :to="{ name: 'products' }" class="btn btn-outline-primary px-4">
          Continue Shopping
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ordersApi } from '@/api/orders'

const route   = useRoute()
const orderId = route.params.id
const order   = ref(null)
const loading = ref(false)

onMounted(async () => {
  if (!orderId) return
  loading.value = true
  try {
    const { data } = await ordersApi.getOrder(orderId)
    order.value = data
  } catch { /* show id only */ }
  finally { loading.value = false }
})
</script>
