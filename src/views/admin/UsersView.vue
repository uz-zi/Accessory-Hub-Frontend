<template>
  <div>
    <h3 class="fw-bold mb-4">Users</h3>

    <div class="card border-0 shadow-sm mb-4 p-3">
      <div class="row g-2">
        <div class="col-md-5">
          <input v-model="search" type="search" class="form-control" placeholder="Search by name or email…" @input="debouncedFetch" />
        </div>
        <div class="col-md-3">
          <select v-model="perPage" class="form-select" @change="fetchUsers">
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else-if="users.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-people fs-1 opacity-25 d-block mb-2"></i>No users found
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
              <th style="width:160px">Change Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="text-muted small">{{ user.id }}</td>
              <td class="fw-semibold small">{{ user.first_name }} {{ user.last_name }}</td>
              <td class="small text-muted">{{ user.email }}</td>
              <td class="small text-muted">{{ formatDate(user.created_at) }}</td>
              <td>
                <span class="badge rounded-pill" :class="user.role === 'admin' ? 'bg-danger' : 'bg-secondary'">
                  {{ user.role || 'customer' }}
                </span>
              </td>
              <td>
                <select
                  class="form-select form-select-sm"
                  :value="user.role || 'customer'"
                  @change="updateRole(user, $event.target.value)"
                  style="max-width:130px"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between p-3 border-top">
        <span class="text-muted small">{{ total }} total users</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="changePage(page - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="btn btn-sm btn-primary disabled">{{ page }} / {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages" @click="changePage(page + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useUiStore } from '@/stores/ui'

const uiStore    = useUiStore()
const users      = ref([])
const loading    = ref(false)
const search     = ref('')
const page       = ref(1)
const perPage    = ref(10)
const total      = ref(0)
const totalPages = ref(1)

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchUsers() }, 400)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await adminApi.getUsers({ page: page.value, per_page: perPage.value, search: search.value })
    users.value      = data.users || []
    total.value      = data.total || 0
    totalPages.value = data.total_pages || 1
  } catch {
    uiStore.toast('Failed to load users', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(p) { page.value = p; fetchUsers() }

async function updateRole(user, newRole) {
  if ((user.role || 'customer') === newRole) return
  try {
    await adminApi.updateUserRole(user.id, newRole)
    user.role = newRole
    uiStore.toast(`${user.first_name}'s role updated to ${newRole}`)
  } catch {
    uiStore.toast('Failed to update role', 'error')
  }
}

onMounted(fetchUsers)
</script>
