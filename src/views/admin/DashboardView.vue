<template>
  <div>
    <h3 class="fw-bold mb-4">Dashboard</h3>

    <!-- Stats cards -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3" v-for="stat in stats" :key="stat.label">
        <div class="card border-0 shadow-sm p-4">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="text-muted small mb-1">{{ stat.label }}</div>
              <div class="fw-bold fs-3">{{ stat.loading ? '…' : stat.value }}</div>
            </div>
            <div class="rounded-circle d-flex align-items-center justify-content-center"
              :style="`width:52px;height:52px;background:${stat.color}18`">
              <i :class="`bi ${stat.icon} fs-4`" :style="`color:${stat.color}`"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3 pb-0 px-4 d-flex align-items-center justify-content-between">
            <h6 class="fw-bold mb-0">Recent Orders</h6>
            <RouterLink :to="{ name: 'admin-orders' }" class="btn btn-link btn-sm p-0">View all</RouterLink>
          </div>
          <div class="card-body px-4">
            <div v-if="loadingOrders" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else-if="recentOrders.length === 0" class="text-muted text-center py-4">No orders yet</div>
            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0">
                <thead class="text-muted small">
                  <tr>
                    <th>#</th><th>Customer</th><th>Total</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td class="fw-semibold small">#{{ order.id }}</td>
                    <td class="small">{{ order.user?.name || order.user?.email }}</td>
                    <td class="small fw-semibold">${{ parseFloat(order.total || 0).toFixed(2) }}</td>
                    <td>
                      <span class="badge rounded-pill" :class="statusClass(order.status)">{{ order.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3 pb-0 px-4">
            <h6 class="fw-bold mb-0">Quick Actions</h6>
          </div>
          <div class="card-body px-4 d-flex flex-column gap-2">
            <RouterLink :to="{ name: 'admin-product-create' }" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>Add New Product
            </RouterLink>
            <RouterLink :to="{ name: 'admin-categories' }" class="btn btn-outline-primary">
              <i class="bi bi-tag me-2"></i>Manage Categories
            </RouterLink>
            <RouterLink :to="{ name: 'admin-orders' }" class="btn btn-outline-secondary">
              <i class="bi bi-receipt me-2"></i>View All Orders
            </RouterLink>
            <RouterLink :to="{ name: 'admin-users' }" class="btn btn-outline-secondary">
              <i class="bi bi-people me-2"></i>Manage Users
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'

const loadingOrders = ref(true)
const recentOrders  = ref([])

const stats = ref([
  { label: 'Total Products', icon: 'bi-box-seam',   color: '#6c63ff', value: 0, loading: true },
  { label: 'Total Orders',   icon: 'bi-receipt',    color: '#0dcaf0', value: 0, loading: true },
  { label: 'Total Users',    icon: 'bi-people',     color: '#198754', value: 0, loading: true },
  { label: 'Categories',     icon: 'bi-tag',        color: '#fd7e14', value: 0, loading: true },
])

function statusClass(status) {
  const map = { pending: 'bg-warning text-dark', processing: 'bg-info text-dark', shipped: 'bg-primary', delivered: 'bg-success', cancelled: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

onMounted(async () => {
  try {
    const [products, orders, users, categories] = await Promise.all([
      adminApi.getProducts({ per_page: 1 }),
      adminApi.getOrders({ per_page: 10 }),
      adminApi.getUsers({ per_page: 1 }),
      adminApi.getCategories({ per_page: 1 }),
    ])
    stats.value[0].value = products.data.total || 0
    stats.value[1].value = orders.data.total   || 0
    stats.value[2].value = users.data.total    || 0
    stats.value[3].value = (categories.data.categories || []).length || 0
    stats.value.forEach(s => s.loading = false)
    recentOrders.value = (orders.data.orders || []).slice(0, 8)
  } catch {
    stats.value.forEach(s => { s.value = '–'; s.loading = false })
  } finally {
    loadingOrders.value = false
  }
})
</script>
