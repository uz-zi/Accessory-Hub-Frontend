<template>
  <div>
    <h3 class="fw-bold mb-4">Orders</h3>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 p-3">
      <div class="row g-2">
        <div class="col-md-4">
          <select v-model="statusFilter" class="form-select" @change="fetchOrders">
            <option value="">All Statuses</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ capitalize(s) }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="perPage" class="form-select" @change="fetchOrders">
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else-if="orders.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-receipt fs-1 opacity-25 d-block mb-2"></i>No orders found
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th style="width:180px">Update Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="fw-semibold small">#{{ order.id }}</td>
              <td>
                <div class="small fw-semibold">{{ order.user?.name }}</div>
                <div class="text-muted" style="font-size:.75rem">{{ order.user?.email }}</div>
              </td>
              <td class="small text-muted">{{ formatDate(order.created_at) }}</td>
              <td class="fw-semibold small">${{ parseFloat(order.total || 0).toFixed(2) }}</td>
              <td>
                <span class="badge rounded-pill" :class="statusClass(order.status)">{{ order.status }}</span>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <select
                    class="form-select form-select-sm"
                    :value="order.status"
                    @change="updateStatus(order, $event.target.value)"
                    style="max-width:130px"
                  >
                    <option v-for="s in statuses" :key="s" :value="s">{{ capitalize(s) }}</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between p-3 border-top">
        <span class="text-muted small">{{ total }} total orders</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="changePage(page - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="btn btn-sm btn-primary disabled">{{ page }} / {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages" @click="changePage(page + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useUiStore } from '@/stores/ui'

const uiStore      = useUiStore()
const orders       = ref([])
const loading      = ref(false)
const statusFilter = ref('')
const page         = ref(1)
const perPage      = ref(10)
const total        = ref(0)
const totalPages   = ref(1)

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

function statusClass(status) {
  const map = { pending: 'bg-warning text-dark', processing: 'bg-info text-dark', shipped: 'bg-primary', delivered: 'bg-success', cancelled: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage.value }
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await adminApi.getOrders(params)
    orders.value     = data.orders || []
    total.value      = data.total  || 0
    totalPages.value = data.total_pages || 1
  } catch {
    uiStore.toast('Failed to load orders', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(p) { page.value = p; fetchOrders() }

async function updateStatus(order, newStatus) {
  if (order.status === newStatus) return
  try {
    await adminApi.updateOrderStatus(order.id, newStatus)
    order.status = newStatus
    uiStore.toast(`Order #${order.id} updated to ${newStatus}`)
  } catch {
    uiStore.toast('Failed to update order status', 'error')
  }
}

onMounted(fetchOrders)
</script>
