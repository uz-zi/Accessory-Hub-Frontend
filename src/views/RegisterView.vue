<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-7 col-lg-5">
        <div class="card shadow-sm border-0 p-4">
          <div class="text-center mb-4">
            <i class="bi bi-person-plus-fill fs-1" style="color:var(--ah-primary)"></i>
            <h2 class="fw-bold mt-2 mb-0">Create Account</h2>
            <p class="text-muted small">Join thousands of happy customers</p>
          </div>

          <div v-if="authStore.error" class="alert alert-danger d-flex align-items-center gap-2 py-2">
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>{{ authStore.error }}</span>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">First Name</label>
                <input v-model="form.first_name" type="text" class="form-control" placeholder="John" required />
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Last Name</label>
                <input v-model="form.last_name" type="text" class="form-control" placeholder="Doe" required />
              </div>
            </div>

            <div class="mb-3 mt-3">
              <label class="form-label fw-semibold">Email address</label>
              <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required autocomplete="email" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Password</label>
              <div class="input-group">
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Min. 8 characters"
                  minlength="8"
                  required
                  autocomplete="new-password"
                />
                <button class="btn btn-outline-secondary" type="button" @click="showPass = !showPass">
                  <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div class="mt-1">
                <div class="progress" style="height:4px">
                  <div
                    class="progress-bar"
                    :class="strengthClass"
                    :style="{ width: strengthWidth }"
                  ></div>
                </div>
                <span class="small text-muted">{{ strengthLabel }}</span>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Confirm Password</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': form.password_confirmation && form.password !== form.password_confirmation }"
                placeholder="Repeat password"
                required
                autocomplete="new-password"
              />
              <div class="invalid-feedback">Passwords do not match</div>
            </div>

            <div class="form-check mb-4">
              <input v-model="agreed" type="checkbox" class="form-check-input" id="terms" required />
              <label class="form-check-label small" for="terms">
                I agree to the <a href="#" class="text-primary">Terms of Service</a> and <a href="#" class="text-primary">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2"
              :disabled="authStore.loading || (form.password !== form.password_confirmation && !!form.password_confirmation)"
            >
              <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ authStore.loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <div class="text-center mt-4 small">
            Already have an account?
            <RouterLink :to="{ name: 'login' }" class="fw-semibold">Sign in</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
})
const showPass = ref(false)
const agreed   = ref(false)

onMounted(() => { authStore.error = null })

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthClass  = computed(() => ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'][passwordStrength.value])
const strengthWidth  = computed(() => `${passwordStrength.value * 25}%`)
const strengthLabel  = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.value] || '')

async function handleRegister() {
  if (form.value.password !== form.value.password_confirmation) return
  const ok = await authStore.register(form.value)
  if (ok) router.push({ name: 'home' })
}
</script>
