<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card shadow-sm border-0 p-4">

          <!-- No token in the URL -->
          <div v-if="!token" class="text-center py-3">
            <i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
            <h3 class="fw-bold mt-3">Invalid link</h3>
            <p class="text-muted">This password reset link is missing its token.</p>
            <RouterLink :to="{ name: 'forgot-password' }" class="btn btn-outline-primary mt-2">
              Request a new link
            </RouterLink>
          </div>

          <!-- Success state -->
          <div v-else-if="done" class="text-center py-3">
            <i class="bi bi-check-circle-fill fs-1" style="color:var(--ah-primary)"></i>
            <h3 class="fw-bold mt-3">Password reset</h3>
            <p class="text-muted">Your password has been updated. You can now sign in.</p>
            <RouterLink :to="{ name: 'login' }" class="btn btn-primary mt-2">Sign In</RouterLink>
          </div>

          <!-- Form state -->
          <template v-else>
            <div class="text-center mb-4">
              <i class="bi bi-key-fill fs-1" style="color:var(--ah-primary)"></i>
              <h2 class="fw-bold mt-2 mb-0">Choose a new password</h2>
            </div>

            <div v-if="authStore.error" class="alert alert-danger d-flex align-items-center gap-2 py-2">
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>{{ authStore.error }}</span>
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label fw-semibold">New password</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Min. 8 characters"
                  minlength="8"
                  required
                  autocomplete="new-password"
                />
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold">Confirm password</label>
                <input
                  v-model="passwordConfirmation"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': passwordConfirmation && password !== passwordConfirmation }"
                  placeholder="Repeat password"
                  required
                  autocomplete="new-password"
                />
                <div class="invalid-feedback">Passwords do not match</div>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100 py-2"
                :disabled="authStore.loading || (passwordConfirmation && password !== passwordConfirmation)"
              >
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ authStore.loading ? 'Resetting…' : 'Reset Password' }}
              </button>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route     = useRoute()
const authStore = useAuthStore()

const token = computed(() => route.query.token || '')
const password = ref('')
const passwordConfirmation = ref('')
const done = ref(false)

onMounted(() => { authStore.error = null })

async function handleSubmit() {
  if (password.value !== passwordConfirmation.value) return
  const ok = await authStore.resetPassword(token.value, password.value, passwordConfirmation.value)
  if (ok) done.value = true
}
</script>
