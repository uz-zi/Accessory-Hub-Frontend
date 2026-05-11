<template>
  <div class="container py-5">
    <div class="row g-4">
      <div class="col-md-3">
        <AccountSidebar />
      </div>
      <div class="col-md-9">
        <!-- Back -->
        <RouterLink :to="{ name: 'account-orders' }" class="btn btn-link p-0 mb-3 text-muted">
          <i class="bi bi-arrow-left me-1"></i>Back to Orders
        </RouterLink>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="!order" class="text-center py-5">
          <h5>Order not found</h5>
        </div>

        <div v-else>
          <!-- Header -->
          <div class="card border-0 shadow-sm p-4 mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <h4 class="fw-bold mb-1">Order #{{ order.id }}</h4>
                <div class="text-muted small">Placed on {{ formatDate(order.created_at) }}</div>
              </div>
              <span class="badge rounded-pill fs-6" :class="statusClass(order.status)">
                {{ order.status }}
              </span>
            </div>

            <!-- Status tracker -->
            <div class="mt-4" v-if="statusSteps">
              <div class="d-flex align-items-center gap-0">
                <template v-for="(step, i) in statusSteps" :key="step.key">
                  <div class="text-center flex-shrink-0" style="min-width:80px">
                    <div
                      class="rounded-circle d-inline-flex align-items-center justify-content-center mb-1"
                      :class="step.done ? 'bg-success text-white' : 'bg-light text-muted border'"
                      style="width:36px;height:36px"
                    >
                      <i :class="`bi ${step.icon}`"></i>
                    </div>
                    <div class="small" :class="step.done ? 'fw-semibold' : 'text-muted'">{{ step.label }}</div>
                  </div>
                  <div v-if="i < statusSteps.length - 1" class="flex-grow-1 border-top" :class="step.done ? 'border-success' : 'border-secondary'" style="margin-bottom:1.5rem"></div>
                </template>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Items -->
            <div class="col-lg-7">
              <div class="card border-0 shadow-sm p-4">
                <h6 class="fw-bold mb-3">Items Ordered</h6>
                <div
                  v-for="(item, i) in order.items"
                  :key="item.id"
                  class="d-flex gap-3 align-items-start"
                  :class="{ 'border-bottom pb-3 mb-3': i < order.items.length - 1 }"
                >
                  <img
                    :src="item.product?.image_url || 'https://placehold.co/64x64?text=IMG'"
                    :alt="item.product?.name"
                    class="rounded"
                    style="width:64px;height:64px;object-fit:cover;flex-shrink:0"
                  />
                  <div class="flex-grow-1">
                    <RouterLink
                      :to="{ name: 'product-detail', params: { id: item.product?.id } }"
                      class="text-dark fw-semibold d-block small"
                    >{{ item.product?.name }}</RouterLink>
                    <div v-if="item.variant" class="text-muted small">{{ item.variant?.name }}</div>
                    <div class="text-muted small">Qty: {{ item.quantity }} × ${{ parseFloat(item.price).toFixed(2) }}</div>
                  </div>
                  <div class="fw-bold small">${{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <!-- Summary + Address -->
            <div class="col-lg-5">
              <div class="card border-0 shadow-sm p-4 mb-4">
                <h6 class="fw-bold mb-3">Order Summary</h6>
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Subtotal</span>
                  <span>${{ parseFloat(order.subtotal || 0).toFixed(2) }}</span>
                </div>
                <div v-if="order.discount > 0" class="d-flex justify-content-between small text-success mb-1">
                  <span>Discount</span><span>-${{ parseFloat(order.discount).toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted mb-2">
                  <span>Shipping</span>
                  <span>{{ order.shipping_cost == 0 ? 'FREE' : `$${parseFloat(order.shipping_cost || 0).toFixed(2)}` }}</span>
                </div>
                <hr class="my-2" />
                <div class="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span style="color:var(--ah-primary)">${{ parseFloat(order.total || 0).toFixed(2) }}</span>
                </div>
              </div>

              <div v-if="order.shipping_address" class="card border-0 shadow-sm p-4">
                <h6 class="fw-bold mb-2">Shipping Address</h6>
                <address class="text-muted small mb-0">
                  {{ order.shipping_address.first_name }} {{ order.shipping_address.last_name }}<br />
                  {{ order.shipping_address.address1 }}<br />
                  <span v-if="order.shipping_address.address2">{{ order.shipping_address.address2 }}<br /></span>
                  {{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.zip }}<br />
                  {{ order.shipping_address.country }}
                </address>
              </div>
            </div>
          </div>

          <!-- Cancel button -->
          <div v-if="order.status === 'pending'" class="mt-4">
            <button class="btn btn-outline-danger" @click="cancelOrder">
              <i class="bi bi-x-circle me-2"></i>Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ordersApi } from '@/api/orders'
import { useUiStore } from '@/stores/ui'
import AccountSidebar from '@/components/AccountSidebar.vue'

const route   = useRoute()
const router  = useRouter()
const uiStore = useUiStore()
const order   = ref(null)
const loading = ref(false)

const ORDER_FLOW = ['pending', 'processing', 'shipped', 'delivered']
const STEP_META  = {
  pending:    { icon: 'bi-clock',          label: 'Pending' },
  processing: { icon: 'bi-gear',           label: 'Processing' },
  shipped:    { icon: 'bi-truck',          label: 'Shipped' },
  delivered:  { icon: 'bi-house-check',   label: 'Delivered' },
}

const statusSteps = computed(() => {
  if (!order.value || order.value.status === 'cancelled') return null
  const currentIdx = ORDER_FLOW.indexOf(order.value.status)
  return ORDER_FLOW.map((key, i) => ({
    key,
    ...STEP_META[key],
    done: i <= currentIdx
  }))
})

function statusClass(status) {
  const map = { pending: 'bg-warning text-dark', processing: 'bg-info text-dark', shipped: 'bg-primary', delivered: 'bg-success', cancelled: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function cancelOrder() {
  if (!confirm('Are you sure you want to cancel this order?')) return
  try {
    await ordersApi.cancelOrder(order.value.id)
    order.value.status = 'cancelled'
    uiStore.toast('Order cancelled successfully')
  } catch (err) {
    uiStore.toast(err.response?.data?.message || 'Could not cancel order', 'error')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await ordersApi.getOrder(route.params.id)
    order.value = data
  } catch {
    uiStore.toast('Order not found', 'error')
  } finally {
    loading.value = false
  }
})
</script>
