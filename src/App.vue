<template>
  <div>
    <AppNavbar />
    <CartDrawer />
    <main>
      <RouterView />
    </main>
    <AppFooter />
    <ChatWidget />
    <ToastContainer />
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { onMounted, watch } from 'vue'

const authStore     = useAuthStore()
const cartStore     = useCartStore()
const productsStore = useProductsStore()

function syncUserData() {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
    productsStore.fetchWishlist()
  }
}

onMounted(async () => {
  await authStore.hydrateFromStorage()
  syncUserData()
})

watch(() => authStore.isAuthenticated, (authed) => {
  if (authed) syncUserData()
})
</script>
