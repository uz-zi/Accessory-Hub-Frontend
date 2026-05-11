<template>
  <div>
    <h3 class="fw-bold mb-4">Categories</h3>

    <div class="row g-4">
      <!-- Form -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4">
          <h6 class="fw-bold mb-3">{{ editing ? 'Edit Category' : 'Add Category' }}</h6>
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input v-model="form.name" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Slug</label>
              <input v-model="form.slug" type="text" class="form-control" placeholder="auto-generated if empty" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-control" rows="3"></textarea>
            </div>
            <div v-if="formError" class="alert alert-danger py-2 small mb-3">{{ formError }}</div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ editing ? 'Save' : 'Create' }}
              </button>
              <button v-if="editing" type="button" class="btn btn-outline-secondary" @click="cancelEdit">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- List -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="categories.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-tag fs-1 opacity-25 d-block mb-2"></i>No categories yet
          </div>
          <table v-else class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th><th>Name</th><th>Slug</th><th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td class="text-muted small">{{ cat.id }}</td>
                <td class="fw-semibold small">{{ cat.name }}</td>
                <td class="text-muted small">{{ cat.slug }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" @click="startEdit(cat)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(cat)">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
const categories = ref([])
const loading    = ref(false)
const saving     = ref(false)
const formError  = ref('')
const editing    = ref(null)

const form = ref({ name: '', slug: '', description: '' })

async function fetchCategories() {
  loading.value = true
  try {
    const { data } = await adminApi.getCategories({ per_page: 100 })
    categories.value = data.categories || data
  } catch {
    uiStore.toast('Failed to load categories', 'error')
  } finally {
    loading.value = false
  }
}

function startEdit(cat) {
  editing.value = cat
  form.value    = { name: cat.name, slug: cat.slug || '', description: cat.description || '' }
}

function cancelEdit() {
  editing.value = null
  form.value    = { name: '', slug: '', description: '' }
  formError.value = ''
}

async function submit() {
  saving.value    = true
  formError.value = ''
  try {
    if (editing.value) {
      await adminApi.updateCategory(editing.value.id, form.value)
      uiStore.toast('Category updated!')
    } else {
      await adminApi.createCategory(form.value)
      uiStore.toast('Category created!')
    }
    cancelEdit()
    fetchCategories()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Failed to save category.'
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat) {
  if (!confirm(`Delete "${cat.name}"?`)) return
  try {
    await adminApi.deleteCategory(cat.id)
    uiStore.toast('Category deleted')
    fetchCategories()
  } catch (err) {
    uiStore.toast(err.response?.data?.message || 'Failed to delete category', 'error')
  }
}

onMounted(fetchCategories)
</script>
