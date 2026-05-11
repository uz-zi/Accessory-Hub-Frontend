<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card shadow-sm border-0 p-4">

          <!-- Success state -->
          <div v-if="sent" class="text-center py-3">
            <i class="bi bi-envelope-check-fill fs-1" style="color:var(--ah-primary)"></i>
            <h3 class="fw-bold mt-3">Check your email</h3>
            <p class="text-muted">
              We've sent a password reset link to <strong>{{ sentEmail }}</strong>.
              Check your spam folder if you don't see it.
            </p>
            <RouterLink :to="{ name: 'login' }" class="btn btn-outline-primary mt-2">
              <i class="bi bi-arrow-left me-1"></i>Back to Sign In
            </RouterLink>
          </div>

          <!-- Form state -->
          <template v-else>
            <div class="text-center mb-4">
              <i class="bi bi-key-fill fs-1" style="color:var(--ah-primary)"></i>
              <h2 class="fw-bold mt-2 mb-0">Forgot Password?</h2>
              <p class="text-muted small">Enter your email and we'll send a reset link</p>
            </div>

            <div v-if="authStore.error" class="alert alert-danger d-flex align-items-center gap-2 py-2">
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>{{ authStore.error }}</span>
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <label class="form-label fw-semibold">Email address</label>
                <input
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100 py-2" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ authStore.loading ? 'Sending…' : 'Send Reset Link' }}
              </button>
            </form>

            <div class="text-center mt-4 small">
              <RouterLink :to="{ name: 'login' }" class="text-muted">
                <i class="bi bi-arrow-left me-1"></i>Back to Sign In
              </RouterLink>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email     = ref('')
const sent      = ref(false)
const sentEmail = ref('')

onMounted(() => { authStore.error = null })

async function handleSubmit() {
  const ok = await authStore.forgotPassword(email.value)
  if (ok) {
    sentEmail.value = email.value
    sent.value = true
  }
}
</script>
