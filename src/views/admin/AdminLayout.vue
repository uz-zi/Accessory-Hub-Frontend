<template>
  <div class="admin-layout d-flex" style="min-height:calc(100vh - 64px)">
    <!-- Sidebar -->
    <aside class="admin-sidebar bg-dark text-white d-none d-lg-flex flex-column" style="width:240px;min-height:calc(100vh - 64px);flex-shrink:0">
      <div class="p-3 border-bottom border-secondary">
        <div class="fw-bold text-primary fs-5"><i class="bi bi-shield-lock me-2"></i>Admin Panel</div>
        <div class="text-muted small">{{ authStore.fullName }}</div>
      </div>
      <nav class="flex-grow-1 p-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="admin-nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mb-1 text-decoration-none"
          :class="$route.name === item.name ? 'active' : ''"
        >
          <i :class="`bi ${item.icon}`"></i>{{ item.label }}
        </RouterLink>
      </nav>
      <div class="p-3 border-top border-secondary">
        <RouterLink :to="{ name: 'home' }" class="btn btn-outline-secondary btn-sm w-100">
          <i class="bi bi-arrow-left me-1"></i>Back to Store
        </RouterLink>
      </div>
    </aside>

    <!-- Mobile top bar -->
    <div class="d-lg-none w-100 bg-dark text-white px-3 py-2 d-flex align-items-center gap-3 border-bottom border-secondary" style="position:sticky;top:64px;z-index:100">
      <span class="fw-bold text-primary"><i class="bi bi-shield-lock me-1"></i>Admin</span>
      <div class="d-flex gap-2 ms-auto flex-wrap">
        <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }" class="btn btn-outline-secondary btn-sm">
          <i :class="`bi ${item.icon}`"></i>
        </RouterLink>
      </div>
    </div>

    <!-- Main content -->
    <main class="flex-grow-1 bg-light p-4" style="overflow-x:hidden">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const navItems = [
  { name: 'admin-dashboard',      icon: 'bi-speedometer2', label: 'Dashboard' },
  { name: 'admin-products',       icon: 'bi-box-seam',     label: 'Products' },
  { name: 'admin-product-create', icon: 'bi-plus-circle',  label: 'Add Product' },
  { name: 'admin-categories',     icon: 'bi-tag',          label: 'Categories' },
  { name: 'admin-orders',         icon: 'bi-receipt',      label: 'Orders' },
  { name: 'admin-users',          icon: 'bi-people',       label: 'Users' },
]
</script>

<style scoped>
.admin-nav-link { color: rgba(255,255,255,.7); transition: background .15s, color .15s; }
.admin-nav-link:hover { background: rgba(255,255,255,.1); color: #fff; }
.admin-nav-link.active { background: var(--ah-primary) !important; color: #fff !important; }
</style>
