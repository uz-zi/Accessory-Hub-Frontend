<template>
  <div class="container py-5">
    <div class="row g-4">
      <div class="col-md-3">
        <AccountSidebar />
      </div>
      <div class="col-md-9">
        <div class="card border-0 shadow-sm p-4">
          <h4 class="fw-bold mb-1">My Orders</h4>
          <p class="text-muted small mb-4">Track and manage your order history</p>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="orders.length === 0" class="text-center py-5">
            <i class="bi bi-box-seam fs-1 text-muted opacity-25 d-block mb-3"></i>
            <h5 class="fw-bold">No orders yet</h5>
            <p class="text-muted">When you place an order, it will appear here.</p>
            <RouterLink :to="{ name: 'products' }" class="btn btn-primary mt-2">Start Shopping</RouterLink>
          </div>

          <!-- Orders list -->
          <div v-else>
            <div
              v-for="order in orders"
              :key="order.id"
              class="border rounded-3 p-3 mb-3"
            >
              <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                <div>
                  <div class="fw-semibold">Order #{{ order.id }}</div>
                  <div class="text-muted small">{{ formatDate(order.created_at) }}</div>
                </div>
                <div class="text-end">
                  <span class="badge rounded-pill" :class="statusClass(order.status)">
                    {{ order.status }}
                  </span>
                  <div class="fw-bold mt-1" style="color:var(--ah-primary)">${{ parseFloat(order.total || 0).toFixed(2) }}</div>
                </div>
              </div>

              <!-- Items preview -->
              <div class="d-flex gap-2 mb-3 overflow-auto">
                <img
                  v-for="item in (order.items || []).slice(0, 5)"
                  :key="item.id"
                  :src="item.product?.image_url || 'https://placehold.co/48x48?text=IMG'"
                  :alt="item.product?.name"
                  class="rounded"
                  style="width:48px;height:48px;object-fit:cover;flex-shrink:0"
                  :title="item.product?.name"
                />
                <div v-if="(order.items || []).length > 5" class="rounded bg-secondary d-flex align-items-center justify-content-center text-white small flex-shrink-0" style="width:48px;height:48px">
                  +{{ order.items.length - 5 }}
                </div>
              </div>

              <div class="d-flex gap-2">
                <RouterLink :to="{ name: 'account-order-detail', params: { id: order.id } }" class="btn btn-sm btn-outline-primary">
                  View Details
                </RouterLink>
                <button
                  v-if="order.status === 'pending'"
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelOrder(order.id)"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="hasMore" class="text-center mt-3">
              <button class="btn btn-outline-primary btn-sm px-4" :disabled="loading" @click="loadMore">
                Load More Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ordersApi } from '@/api/orders'
import { useUiStore } from '@/stores/ui'
import AccountSidebar from '@/components/AccountSidebar.vue'

const uiStore = useUiStore()
const orders  = ref([])
const loading = ref(false)
const page    = ref(1)
const hasMore = ref(false)

async function fetchOrders(append = false) {
  loading.value = true
  try {
    const { data } = await ordersApi.getOrders({ page: page.value, per_page: 10 })
    const list = data.orders || data
    orders.value  = append ? [...orders.value, ...list] : list
    hasMore.value = data.has_more || list.length === 10
  } catch {
    uiStore.toast('Failed to load orders', 'error')
  } finally {
    loading.value = false
  }
}

async function cancelOrder(id) {
  if (!confirm('Are you sure you want to cancel this order?')) return
  try {
    await ordersApi.cancelOrder(id)
    await fetchOrders()
    uiStore.toast('Order cancelled')
  } catch (err) {
    uiStore.toast(err.response?.data?.message || 'Could not cancel order', 'error')
  }
}

function loadMore() { page.value++; fetchOrders(true) }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusClass(status) {
  const map = {
    pending:    'bg-warning text-dark',
    processing: 'bg-info text-dark',
    shipped:    'bg-primary',
    delivered:  'bg-success',
    cancelled:  'bg-danger',
  }
  return map[status] || 'bg-secondary'
}

onMounted(fetchOrders)
</script>
