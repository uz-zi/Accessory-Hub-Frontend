<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand fw-bold fs-4" to="/">
        <i class="bi bi-phone-fill me-1"></i>Accessory<span>Hub</span>
      </RouterLink>

      <!-- Mobile toggler -->
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
        aria-controls="navMenu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMenu">
        <!-- Search bar -->
        <form class="d-flex mx-auto my-2 my-lg-0" style="max-width:380px;width:100%;" @submit.prevent="handleSearch">
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="search"
              class="form-control form-control-sm"
              placeholder="Search accessories…"
              aria-label="Search"
            />
            <button class="btn btn-primary btn-sm" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>

        <!-- Nav links -->
        <ul class="navbar-nav ms-auto align-items-lg-center gap-1">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'products' }">Shop</RouterLink>
          </li>

          <!-- Cart icon -->
          <li class="nav-item">
            <button class="btn btn-link nav-link position-relative p-1 px-2" @click="uiStore.toggleCart()">
              <i class="bi bi-bag fs-5"></i>
              <span
                v-if="cartStore.itemCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                style="font-size:.65rem"
              >
                {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
              </span>
            </button>
          </li>

          <!-- Wishlist -->
          <li class="nav-item" v-if="authStore.isAuthenticated">
            <RouterLink class="nav-link p-1 px-2" :to="{ name: 'account-wishlist' }">
              <i class="bi bi-heart fs-5"></i>
            </RouterLink>
          </li>

          <!-- Auth dropdown / login button -->
          <li class="nav-item dropdown" v-if="authStore.isAuthenticated">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center gap-2"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              <span class="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                style="width:30px;height:30px;font-size:.75rem;font-weight:700">
                {{ initials }}
              </span>
              <span class="d-none d-lg-inline">{{ authStore.fullName || 'Account' }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><RouterLink class="dropdown-item" :to="{ name: 'account-profile' }"><i class="bi bi-person me-2"></i>Profile</RouterLink></li>
              <li><RouterLink class="dropdown-item" :to="{ name: 'account-orders' }"><i class="bi bi-box-seam me-2"></i>Orders</RouterLink></li>
              <li><RouterLink class="dropdown-item" :to="{ name: 'account-wishlist' }"><i class="bi bi-heart me-2"></i>Wishlist</RouterLink></li>
              <li v-if="authStore.user?.role === 'admin'"><hr class="dropdown-divider" /></li>
              <li v-if="authStore.user?.role === 'admin'">
                <RouterLink class="dropdown-item text-primary fw-semibold" :to="{ name: 'admin-dashboard' }">
                  <i class="bi bi-shield-lock me-2"></i>Admin Panel
                </RouterLink>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li><button class="dropdown-item text-danger" @click="authStore.logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign out</button></li>
            </ul>
          </li>

          <li class="nav-item" v-else>
            <RouterLink class="btn btn-primary btn-sm ms-1" :to="{ name: 'login' }">
              <i class="bi bi-person me-1"></i>Sign in
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'

const router      = useRouter()
const authStore   = useAuthStore()
const cartStore   = useCartStore()
const uiStore     = useUiStore()
const searchQuery = ref('')

const initials = computed(() => {
  if (!authStore.user) return '?'
  const { first_name, last_name } = authStore.user
  return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase() || '?'
})

function handleSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'products', query: { search: searchQuery.value.trim() } })
  searchQuery.value = ''
}
</script>
