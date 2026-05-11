<template>
  <footer class="bg-dark text-white pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row g-4">
        <!-- Brand column -->
        <div class="col-lg-4">
          <h5 class="fw-bold mb-3">
            <i class="bi bi-phone-fill me-2 text-primary"></i>AccessoryHub
          </h5>
          <p class="text-white-50 small">
            The one-stop shop for premium phone cases, chargers, earbuds, and accessories.
            Quality gear for every device.
          </p>
          <div class="d-flex gap-3 mt-3">
            <a href="#" class="text-white-50 fs-5 hover-white"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-white-50 fs-5 hover-white"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-white-50 fs-5 hover-white"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-white-50 fs-5 hover-white"><i class="bi bi-tiktok"></i></a>
          </div>
        </div>

        <!-- Shop column -->
        <div class="col-6 col-lg-2">
          <h6 class="fw-semibold mb-3 text-white">Shop</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'products', query: { category: 'cases' } }">Phone Cases</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'products', query: { category: 'chargers' } }">Chargers</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'products', query: { category: 'earbuds' } }">Earbuds</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'products', query: { category: 'screen-protectors' } }">Screen Protectors</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'products', query: { sort: 'newest' } }">New Arrivals</RouterLink></li>
          </ul>
        </div>

        <!-- Account column -->
        <div class="col-6 col-lg-2">
          <h6 class="fw-semibold mb-3 text-white">Account</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'account-profile' }">Profile</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'account-orders' }">Orders</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'account-wishlist' }">Wishlist</RouterLink></li>
            <li class="mb-2"><RouterLink class="text-white-50 footer-link" :to="{ name: 'cart' }">Cart</RouterLink></li>
          </ul>
        </div>

        <!-- Help column -->
        <div class="col-6 col-lg-2">
          <h6 class="fw-semibold mb-3 text-white">Help</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="#" class="text-white-50 footer-link">FAQ</a></li>
            <li class="mb-2"><a href="#" class="text-white-50 footer-link">Shipping Info</a></li>
            <li class="mb-2"><a href="#" class="text-white-50 footer-link">Returns</a></li>
            <li class="mb-2"><a href="#" class="text-white-50 footer-link">Contact Us</a></li>
          </ul>
        </div>

        <!-- Newsletter column -->
        <div class="col-6 col-lg-2">
          <h6 class="fw-semibold mb-3 text-white">Stay Updated</h6>
          <p class="text-white-50 small">Get deals & new arrivals in your inbox.</p>
          <form @submit.prevent="subscribe" class="mt-2">
            <div class="input-group input-group-sm">
              <input v-model="email" type="email" class="form-control" placeholder="your@email.com" required />
              <button class="btn btn-primary" type="submit">
                <i class="bi bi-send"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      <hr class="border-secondary mt-4" />
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <p class="text-white-50 small mb-0">© {{ year }} AccessoryHub. All rights reserved.</p>
        <div class="d-flex gap-3">
          <a href="#" class="text-white-50 footer-link small">Privacy Policy</a>
          <a href="#" class="text-white-50 footer-link small">Terms of Service</a>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <i class="bi bi-credit-card text-white-50 fs-5"></i>
          <i class="bi bi-paypal text-white-50 fs-5"></i>
          <i class="bi bi-stripe text-white-50 fs-5"></i>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const year  = new Date().getFullYear()
const email = ref('')

function subscribe() {
  // Hook up to API/newsletter service
  alert(`Thanks! We'll send updates to ${email.value}`)
  email.value = ''
}
</script>

<style scoped>
.footer-link { transition: color .15s; }
.footer-link:hover { color: #fff !important; }
.hover-white:hover { color: #fff !important; }
</style>
