<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card shadow-sm border-0 p-4">
          <div class="text-center mb-4">
            <i class="bi bi-phone-fill fs-1" style="color:var(--ah-primary)"></i>
            <h2 class="fw-bold mt-2 mb-0">Welcome back</h2>
            <p class="text-muted small">Sign in to your AccessoryHub account</p>
          </div>

          <div v-if="authStore.error" class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>{{ authStore.error }}</span>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label fw-semibold">Email address</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="you@example.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <label class="form-label fw-semibold">Password</label>
                <RouterLink :to="{ name: 'forgot-password' }" class="small text-muted">Forgot password?</RouterLink>
              </div>
              <div class="input-group">
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Enter password"
                  required
                  autocomplete="current-password"
                />
                <button class="btn btn-outline-secondary" type="button" @click="showPass = !showPass">
                  <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-check mb-3">
              <input v-model="rememberMe" type="checkbox" class="form-check-input" id="rememberMe" />
              <label class="form-check-label small" for="rememberMe">Keep me signed in</label>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ authStore.loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <div class="text-center mt-4 small">
            Don't have an account?
            <RouterLink :to="{ name: 'register' }" class="fw-semibold">Create one</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form     = ref({ email: '', password: '' })
const showPass = ref(false)
const rememberMe = ref(false)

// Clear previous errors when mounting
onMounted(() => { authStore.error = null })

async function handleLogin() {
  const ok = await authStore.login(form.value)
  if (ok) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}
</script>
