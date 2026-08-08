<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card shadow-sm border-0 p-4 text-center py-4">

          <!-- No token in the URL -->
          <template v-if="!token">
            <i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
            <h3 class="fw-bold mt-3">Invalid link</h3>
            <p class="text-muted">This verification link is missing its token.</p>
            <RouterLink :to="{ name: 'login' }" class="btn btn-outline-primary mt-2">Back to Sign In</RouterLink>
          </template>

          <!-- Verifying -->
          <template v-else-if="status === 'checking'">
            <span class="spinner-border mb-3" style="color:var(--ah-primary)"></span>
            <h3 class="fw-bold">Verifying your email…</h3>
          </template>

          <!-- Success -->
          <template v-else-if="status === 'success'">
            <i class="bi bi-check-circle-fill fs-1" style="color:var(--ah-primary)"></i>
            <h3 class="fw-bold mt-3">Email verified</h3>
            <p class="text-muted">You're all set — taking you to AccessoryHub now.</p>
          </template>

          <!-- Failure -->
          <template v-else>
            <i class="bi bi-x-circle-fill fs-1 text-danger"></i>
            <h3 class="fw-bold mt-3">Verification failed</h3>
            <p class="text-muted">{{ authStore.error }}</p>

            <div v-if="resendSent" class="alert alert-success py-2 mt-2">
              If that email exists and isn't verified yet, a new link is on its way.
            </div>
            <form v-else @submit.prevent="handleResend" class="mt-3 text-start">
              <label class="form-label fw-semibold small">Get a new verification link</label>
              <div class="input-group">
                <input v-model="resendEmail" type="email" class="form-control" placeholder="you@example.com" required />
                <button class="btn btn-primary" type="submit" :disabled="authStore.loading">Resend</button>
              </div>
            </form>

            <RouterLink :to="{ name: 'login' }" class="btn btn-outline-secondary mt-3">Back to Sign In</RouterLink>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const token  = computed(() => route.query.token || '')
const status = ref('checking') // checking | success | error

const resendEmail = ref('')
const resendSent  = ref(false)

onMounted(async () => {
  if (!token.value) return
  authStore.error = null
  const ok = await authStore.verifyEmail(token.value)
  status.value = ok ? 'success' : 'error'
  if (ok) setTimeout(() => router.push({ name: 'home' }), 1500)
})

async function handleResend() {
  resendSent.value = await authStore.resendVerification(resendEmail.value)
}
</script>
