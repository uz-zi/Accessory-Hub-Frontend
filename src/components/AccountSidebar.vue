<template>
  <div class="card border-0 shadow-sm p-3">
    <!-- Avatar -->
    <div class="text-center mb-3 pb-3 border-bottom">
      <div
        class="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white fs-4 mb-2"
        style="width:64px;height:64px;background:var(--ah-primary)"
      >
        {{ initials }}
      </div>
      <div class="fw-semibold">{{ authStore.fullName || 'My Account' }}</div>
      <div class="text-muted small text-truncate" style="max-width:160px;margin:0 auto">{{ authStore.user?.email }}</div>
    </div>

    <nav class="nav flex-column gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-link rounded d-flex align-items-center gap-2 px-3 py-2"
        :class="{ active: $route.name === item.name }"
        style="font-size:.9rem"
      >
        <i :class="`bi ${item.icon}`"></i>
        {{ item.label }}
      </RouterLink>
      <button
        class="nav-link rounded d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start mt-2"
        style="font-size:.9rem"
        @click="authStore.logout()"
      >
        <i class="bi bi-box-arrow-right"></i> Sign Out
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const initials = computed(() => {
  if (!authStore.user) return '?'
  const { first_name, last_name } = authStore.user
  return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase() || '?'
})

const navItems = [
  { name: 'account-profile',  icon: 'bi-person',    label: 'Profile' },
  { name: 'account-orders',   icon: 'bi-box-seam',  label: 'My Orders' },
  { name: 'account-wishlist', icon: 'bi-heart',     label: 'Wishlist' },
]
</script>

<style scoped>
.nav-link { color: var(--ah-text); transition: background .15s, color .15s; }
.nav-link:hover { background: var(--ah-secondary); color: var(--ah-primary); }
.nav-link.active { background: var(--ah-primary) !important; color: #fff !important; }
</style>
