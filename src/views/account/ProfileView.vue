<template>
  <div class="container py-5">
    <div class="row g-4">
      <div class="col-md-3">
        <AccountSidebar />
      </div>
      <div class="col-md-9">
        <div class="card border-0 shadow-sm p-4">
          <h4 class="fw-bold mb-1">My Profile</h4>
          <p class="text-muted small mb-4">Update your personal information and password</p>

          <div v-if="saved" class="alert alert-success d-flex align-items-center gap-2 py-2">
            <i class="bi bi-check-circle-fill"></i>Profile updated successfully!
          </div>
          <div v-if="authStore.error" class="alert alert-danger py-2 small">{{ authStore.error }}</div>

          <form @submit.prevent="handleUpdate" class="row g-3 mb-5">
            <div class="col-md-6">
              <label class="form-label fw-semibold">First Name</label>
              <input v-model="form.first_name" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Last Name</label>
              <input v-model="form.last_name" type="text" class="form-control" required />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Email address</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Phone <span class="text-muted small">(optional)</span></label>
              <input v-model="form.phone" type="tel" class="form-control" placeholder="+1 (555) 000-0000" />
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary px-4" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </div>
          </form>

          <h5 class="fw-bold mb-3 pt-3 border-top">Change Password</h5>
          <div v-if="pwSaved" class="alert alert-success py-2 small">Password changed successfully!</div>
          <div v-if="pwError" class="alert alert-danger py-2 small">{{ pwError }}</div>
          <form @submit.prevent="handlePasswordChange" class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold">Current Password</label>
              <input v-model="pw.current" type="password" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">New Password</label>
              <input v-model="pw.password" type="password" class="form-control" minlength="8" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Confirm New Password</label>
              <input
                v-model="pw.password_confirmation"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': pw.password_confirmation && pw.password !== pw.password_confirmation }"
                required
              />
              <div class="invalid-feedback">Passwords do not match</div>
            </div>
            <div class="col-12">
              <button
                type="submit"
                class="btn btn-outline-primary px-4"
                :disabled="pwLoading || (pw.password !== pw.password_confirmation && !!pw.password_confirmation)"
              >
                <span v-if="pwLoading" class="spinner-border spinner-border-sm me-2"></span>
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import AccountSidebar from '@/components/AccountSidebar.vue'

const authStore = useAuthStore()
const saved     = ref(false)
const pwSaved   = ref(false)
const pwError   = ref('')
const pwLoading = ref(false)

const form = ref({ first_name: '', last_name: '', email: '', phone: '' })
const pw   = ref({ current: '', password: '', password_confirmation: '' })

onMounted(() => {
  if (authStore.user) {
    form.value = {
      first_name: authStore.user.first_name || '',
      last_name:  authStore.user.last_name  || '',
      email:      authStore.user.email      || '',
      phone:      authStore.user.phone      || ''
    }
  }
  authStore.error = null
})

async function handleUpdate() {
  saved.value = false
  const ok = await authStore.updateProfile(form.value)
  if (ok) { saved.value = true; setTimeout(() => saved.value = false, 3000) }
}

async function handlePasswordChange() {
  if (pw.value.password !== pw.value.password_confirmation) return
  pwLoading.value = true
  pwError.value   = ''
  pwSaved.value   = false
  try {
    await authApi.changePassword({
      current_password: pw.value.current,
      password: pw.value.password,
      password_confirmation: pw.value.password_confirmation
    })
    pwSaved.value = true
    pw.value = { current: '', password: '', password_confirmation: '' }
    setTimeout(() => pwSaved.value = false, 3000)
  } catch (err) {
    pwError.value = err.response?.data?.message || 'Failed to update password.'
  } finally {
    pwLoading.value = false
  }
}
</script>
