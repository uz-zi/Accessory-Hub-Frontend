<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h3 class="fw-bold mb-0">Homepage Manager</h3>
        <p class="text-muted small mb-0">Control what visitors see on the home page</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <!-- Sync status badge -->
        <span v-if="hpStore.loading" class="badge bg-secondary d-flex align-items-center gap-1">
          <span class="spinner-border spinner-border-sm" style="width:.7rem;height:.7rem"></span> Loading…
        </span>
        <span v-else-if="hpStore.saving" class="badge bg-primary d-flex align-items-center gap-1">
          <span class="spinner-border spinner-border-sm" style="width:.7rem;height:.7rem"></span> Saving…
        </span>
        <span v-else-if="hpStore.backendOnline === true" class="badge bg-success">
          <i class="bi bi-cloud-check me-1"></i>Backend synced
        </span>
        <span v-else-if="hpStore.backendOnline === false" class="badge bg-warning text-dark" :title="hpStore.syncError">
          <i class="bi bi-exclamation-triangle me-1"></i>Local only
        </span>

        <RouterLink :to="{ name: 'home' }" target="_blank" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-eye me-1"></i> Preview Site
        </RouterLink>
      </div>
    </div>

    <!-- Backend warning banner -->
    <div v-if="hpStore.backendOnline === false && hpStore.syncError" class="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-wifi-off flex-shrink-0"></i>
      <span>{{ hpStore.syncError }} Changes still take effect in this browser.</span>
    </div>

    <!-- Full-page loading overlay while fetching -->
    <div v-if="hpStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary mb-2"></div>
      <div class="text-muted small">Loading config from backend…</div>
    </div>

    <!-- Tabs -->
    <ul v-if="!hpStore.loading" class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button :class="['nav-link', activeTab === 'slider' ? 'active' : '']" @click="activeTab = 'slider'">
          <i class="bi bi-collection-play me-1"></i> Hero Slider
          <span class="badge bg-primary ms-1 rounded-pill">{{ hpStore.slides.length }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button :class="['nav-link', activeTab === 'categories' ? 'active' : '']" @click="activeTab = 'categories'">
          <i class="bi bi-grid me-1"></i> Category Grid
          <span class="badge bg-secondary ms-1 rounded-pill">{{ hpStore.categories.length }}</span>
        </button>
      </li>
    </ul>


    <!-- ══════════════════════════════════════════════════
         TAB 1 — HERO SLIDER
    ══════════════════════════════════════════════════ -->
    <div v-if="!hpStore.loading" v-show="activeTab === 'slider'">

      <!-- Slide list -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <span class="fw-semibold">Slides</span>
          <button class="btn btn-primary btn-sm" @click="openAddSlide">
            <i class="bi bi-plus-circle me-1"></i> Add Slide
          </button>
        </div>

        <div v-if="hpStore.slides.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-images fs-1 d-block mb-2 opacity-25"></i>
          No slides yet. Add your first slide.
        </div>

        <ul class="list-group list-group-flush">
          <li
            v-for="(slide, idx) in hpStore.slides"
            :key="slide.id"
            class="list-group-item px-4 py-3"
          >
            <div class="d-flex align-items-center gap-3">
              <!-- Thumbnail -->
              <div class="slide-thumb flex-shrink-0" :style="`background-image:url(${slide.bg})`">
                <div class="slide-thumb-overlay"></div>
                <span class="slide-num">{{ idx + 1 }}</span>
              </div>

              <!-- Info -->
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold text-truncate">{{ slide.heading.replace(/\n/g, ' ') }}</div>
                <div class="text-muted small d-flex flex-wrap gap-3 mt-1">
                  <span><i class="bi bi-tag me-1"></i>{{ slide.tag }}</span>
                  <span><i class="bi bi-cursor me-1"></i>{{ slide.cta }}</span>
                  <span v-if="slide.link_category"><i class="bi bi-link-45deg me-1"></i>{{ slide.link_category }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <button class="btn btn-sm btn-outline-secondary" :disabled="idx === 0" @click="hpStore.moveSlide(idx, -1)" title="Move up">
                  <i class="bi bi-chevron-up"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" :disabled="idx === hpStore.slides.length - 1" @click="hpStore.moveSlide(idx, 1)" title="Move down">
                  <i class="bi bi-chevron-down"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" @click="openEditSlide(slide)" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteSlide(slide)" title="Delete">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="card-footer bg-white border-top px-4 py-2 d-flex justify-content-end">
          <button class="btn btn-link btn-sm text-muted" @click="confirmResetSlides">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reset to defaults
          </button>
        </div>
      </div>

      <!-- Slide preview strip -->
      <div v-if="hpStore.slides.length > 0" class="card border-0 shadow-sm p-4">
        <div class="fw-semibold mb-3 small text-muted text-uppercase letter-spacing">Live Preview</div>
        <div class="d-flex gap-3 overflow-auto pb-2">
          <div
            v-for="(slide, i) in hpStore.slides"
            :key="slide.id"
            class="preview-tile flex-shrink-0"
            :style="`background-image:url(${slide.bg})`"
          >
            <div class="preview-overlay">
              <div class="preview-tag">{{ slide.tag }}</div>
              <div class="preview-heading">{{ slide.heading.replace(/\n/g,' ') }}</div>
              <div class="preview-cta">{{ slide.cta }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- ══════════════════════════════════════════════════
         TAB 2 — CATEGORY GRID
    ══════════════════════════════════════════════════ -->
    <div v-if="!hpStore.loading" v-show="activeTab === 'categories'">

      <div class="row g-4">
        <!-- Left: grid preview -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm p-4">
            <div class="fw-semibold mb-3 small text-muted text-uppercase">Category Grid Preview — click to edit</div>
            <div class="cat-preview-grid">
              <div
                v-for="(cat, i) in hpStore.categories"
                :key="cat.slug"
                :class="['cat-preview-card', `cat-pos-${i + 1}`, { selected: selectedCat?.slug === cat.slug }]"
                :style="`background:${cat.bg}`"
                @click="selectCat(cat)"
              >
                <div class="cat-pv-glow"></div>
                <div class="cat-pv-body">
                  <span class="cat-pv-emoji">{{ cat.emoji }}</span>
                  <span class="cat-pv-name">{{ cat.name }}</span>
                </div>
                <i class="bi bi-pencil-fill cat-pv-edit-icon"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: edit panel -->
        <div class="col-lg-5">
          <div v-if="!selectedCat" class="card border-0 shadow-sm p-5 text-center text-muted">
            <i class="bi bi-hand-index fs-1 d-block mb-2 opacity-25"></i>
            Click a category card to edit it
          </div>

          <div v-else class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom py-3 px-4">
              <span class="fw-semibold">Editing: {{ selectedCat.name }}</span>
            </div>
            <div class="card-body px-4 py-4">
              <!-- Preview mini -->
              <div class="cat-edit-preview mb-4" :style="`background:${catForm.bg}`">
                <span class="cat-edit-emoji">{{ catForm.emoji }}</span>
                <span class="cat-edit-name">{{ catForm.name }}</span>
              </div>

              <!-- Emoji -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Emoji Icon</label>
                <input v-model="catForm.emoji" type="text" class="form-control" placeholder="e.g. 📱" maxlength="4" />
              </div>

              <!-- Name -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Display Name</label>
                <input v-model="catForm.name" type="text" class="form-control" />
              </div>

              <!-- Gradient presets -->
              <div class="mb-3">
                <label class="form-label fw-semibold small d-block">Gradient Preset</label>
                <div class="gradient-swatches">
                  <button
                    v-for="g in gradientPresets"
                    :key="g"
                    class="swatch"
                    :style="`background:${g}`"
                    :class="{ active: catForm.bg === g }"
                    @click="catForm.bg = g"
                    :title="g"
                  ></button>
                </div>
              </div>

              <!-- Custom gradient -->
              <div class="mb-4">
                <label class="form-label fw-semibold small">Custom Gradient</label>
                <div class="d-flex gap-2 align-items-center">
                  <div>
                    <div class="text-muted" style="font-size:.7rem;margin-bottom:2px">Start color</div>
                    <input v-model="customFrom" type="color" class="form-control form-control-color" style="width:48px;height:38px" @input="buildCustomGradient" />
                  </div>
                  <i class="bi bi-arrow-right text-muted mt-3"></i>
                  <div>
                    <div class="text-muted" style="font-size:.7rem;margin-bottom:2px">End color</div>
                    <input v-model="customTo" type="color" class="form-control form-control-color" style="width:48px;height:38px" @input="buildCustomGradient" />
                  </div>
                  <div>
                    <div class="text-muted" style="font-size:.7rem;margin-bottom:2px">Direction</div>
                    <select v-model="customDir" class="form-select form-select-sm" style="width:120px" @change="buildCustomGradient">
                      <option value="135deg">Diagonal ↘</option>
                      <option value="90deg">Horizontal →</option>
                      <option value="180deg">Vertical ↓</option>
                      <option value="45deg">Diagonal ↗</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-grow-1" @click="saveCat">
                  <i class="bi bi-check-lg me-1"></i> Save Changes
                </button>
                <button class="btn btn-outline-secondary" @click="selectedCat = null">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Reset -->
          <div class="text-end mt-3">
            <button class="btn btn-link btn-sm text-muted" @click="confirmResetCats">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset all to defaults
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- ══════════════════════════════════════════════════
         SLIDE FORM MODAL (Add / Edit)
    ══════════════════════════════════════════════════ -->
    <div v-if="showSlideForm" class="modal-backdrop-custom" @click.self="showSlideForm = false">
      <div class="slide-modal">
        <div class="slide-modal-header">
          <h5 class="mb-0">{{ editingSlide ? 'Edit Slide' : 'Add New Slide' }}</h5>
          <button class="btn-close" @click="showSlideForm = false"></button>
        </div>
        <div class="slide-modal-body">

          <!-- Background Image -->
          <div class="mb-4">
            <label class="form-label fw-semibold">Background Image</label>
            <div
              class="img-drop-zone"
              :class="{ dragging: isDragging, 'has-img': slideForm.bg && !slideForm.bg.startsWith('https://picsum') }"
              :style="slideForm.bg ? `background-image:url(${slideForm.bg})` : ''"
              @dragenter.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @dragover.prevent
              @drop.prevent="handleSlideImgDrop"
              @click="slideFileInput?.click()"
            >
              <div class="img-drop-content" :class="{ hidden: slideForm.bg && !slideForm.bg.startsWith('https://picsum') }">
                <span v-if="uploadingSlideImg" class="spinner-border text-primary"></span>
                <template v-else>
                  <i class="bi bi-cloud-upload fs-2 text-muted d-block mb-1"></i>
                  <div class="fw-semibold">Drop image here or click to browse</div>
                  <div class="text-muted small">JPG, PNG, WebP · max 5 MB · Recommended 1920×900</div>
                </template>
              </div>
              <div v-if="slideForm.bg" class="img-drop-overlay-edit">
                <span class="spinner-border spinner-border-sm text-white" v-if="uploadingSlideImg"></span>
                <span v-else><i class="bi bi-cloud-upload me-1"></i>Change image</span>
              </div>
            </div>

            <!-- Or image URL -->
            <div class="mt-2">
              <input
                v-model="slideForm.bg"
                type="url"
                class="form-control form-control-sm"
                placeholder="Or paste an image URL…"
              />
            </div>
            <input ref="slideFileInput" type="file" class="d-none" accept="image/*" @change="handleSlideFileChange" />
          </div>

          <div class="row g-3">
            <!-- Tag -->
            <div class="col-12">
              <label class="form-label fw-semibold small">Tag / Label <span class="text-muted fw-normal">(shown as pill above heading)</span></label>
              <input v-model="slideForm.tag" type="text" class="form-control" placeholder="e.g. New Collection 2025" />
            </div>

            <!-- Heading -->
            <div class="col-12">
              <label class="form-label fw-semibold small">
                Heading
                <span class="text-muted fw-normal">(use \n for line break)</span>
              </label>
              <textarea v-model="slideForm.heading" class="form-control" rows="2" placeholder="e.g. Protect Your Phone\nin Style"></textarea>
            </div>

            <!-- Description -->
            <div class="col-12">
              <label class="form-label fw-semibold small">Description</label>
              <textarea v-model="slideForm.desc" class="form-control" rows="3" placeholder="Short paragraph shown under the heading"></textarea>
            </div>

            <!-- CTA -->
            <div class="col-md-6">
              <label class="form-label fw-semibold small">CTA Button Text</label>
              <input v-model="slideForm.cta" type="text" class="form-control" placeholder="e.g. Shop Cases" />
            </div>

            <!-- Link -->
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Links to Category</label>
              <select v-model="slideForm.link_category" class="form-select">
                <option value="">All Products</option>
                <option v-for="cat in hpStore.categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <div v-if="slideFormError" class="alert alert-danger small py-2 mt-3">{{ slideFormError }}</div>
        </div>
        <div class="slide-modal-footer">
          <button class="btn btn-outline-secondary" @click="showSlideForm = false">Cancel</button>
          <button class="btn btn-primary px-4" @click="saveSlide" :disabled="uploadingSlideImg">
            <i class="bi bi-check-lg me-1"></i>
            {{ editingSlide ? 'Save Changes' : 'Add Slide' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useHomepageStore } from '@/stores/homepage'
import { adminApi } from '@/api/admin'
import { useUiStore } from '@/stores/ui'

const hpStore   = useHomepageStore()
const uiStore   = useUiStore()
const activeTab = ref('slider')

onMounted(() => hpStore.fetchConfig())

/* ── Gradient presets ── */
const gradientPresets = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f953c6,#b91d73)',
  'linear-gradient(135deg,#0f2027,#203a43,#2c5364)',
  'linear-gradient(135deg,#fc5c7d,#6a3093)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#30cfd0,#330867)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
]

/* ══════════════════════════════════════
   CATEGORY EDITOR
══════════════════════════════════════ */
const selectedCat  = ref(null)
const catForm      = reactive({ emoji: '', name: '', bg: '' })
const customFrom   = ref('#6c63ff')
const customTo     = ref('#0f3460')
const customDir    = ref('135deg')

function selectCat(cat) {
  selectedCat.value = cat
  catForm.emoji = cat.emoji
  catForm.name  = cat.name
  catForm.bg    = cat.bg
}

function buildCustomGradient() {
  catForm.bg = `linear-gradient(${customDir.value},${customFrom.value},${customTo.value})`
}

async function saveCat() {
  await hpStore.updateCategory(selectedCat.value.slug, { emoji: catForm.emoji, name: catForm.name, bg: catForm.bg })
  uiStore.toast(hpStore.backendOnline ? `"${catForm.name}" saved to backend!` : `"${catForm.name}" saved locally.`)
  selectedCat.value = null
}

async function confirmResetCats() {
  if (confirm('Reset all category styles to defaults?')) {
    await hpStore.resetCategories()
    selectedCat.value = null
    uiStore.toast('Categories reset to defaults')
  }
}

/* ══════════════════════════════════════
   SLIDE EDITOR
══════════════════════════════════════ */
const showSlideForm     = ref(false)
const editingSlide      = ref(null)
const uploadingSlideImg = ref(false)
const isDragging        = ref(false)
const slideFileInput    = ref(null)
const slideFormError    = ref('')

const slideForm = reactive({
  tag: '', heading: '', desc: '', cta: '', link_category: '', bg: ''
})

function blankSlideForm() {
  slideForm.tag           = ''
  slideForm.heading       = ''
  slideForm.desc          = ''
  slideForm.cta           = ''
  slideForm.link_category = ''
  slideForm.bg            = ''
  slideFormError.value    = ''
}

function openAddSlide() {
  editingSlide.value = null
  blankSlideForm()
  showSlideForm.value = true
}

function openEditSlide(slide) {
  editingSlide.value      = slide
  slideForm.tag           = slide.tag           || ''
  slideForm.heading       = slide.heading       || ''
  slideForm.desc          = slide.desc          || ''
  slideForm.cta           = slide.cta           || ''
  slideForm.link_category = slide.link_category || ''
  slideForm.bg            = slide.bg            || ''
  slideFormError.value    = ''
  showSlideForm.value     = true
}

async function uploadSlideImage(file) {
  uploadingSlideImg.value = true
  try {
    const { data } = await adminApi.uploadImage(file)
    slideForm.bg = data.url
  } catch {
    slideFormError.value = 'Image upload failed. Paste a URL instead.'
  } finally {
    uploadingSlideImg.value = false
  }
}

function handleSlideFileChange(e) {
  const file = e.target.files[0]
  if (file) uploadSlideImage(file)
  e.target.value = ''
}

function handleSlideImgDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file?.type.startsWith('image/')) uploadSlideImage(file)
}

async function saveSlide() {
  slideFormError.value = ''
  if (!slideForm.heading.trim()) { slideFormError.value = 'Heading is required.'; return }
  if (!slideForm.bg.trim())      { slideFormError.value = 'A background image or URL is required.'; return }

  const payload = {
    tag: slideForm.tag, heading: slideForm.heading, desc: slideForm.desc,
    cta: slideForm.cta, link_category: slideForm.link_category, bg: slideForm.bg,
  }

  if (editingSlide.value) {
    await hpStore.updateSlide(editingSlide.value.id, payload)
    uiStore.toast(hpStore.backendOnline ? 'Slide saved to backend!' : 'Slide saved locally.')
  } else {
    await hpStore.addSlide(payload)
    uiStore.toast(hpStore.backendOnline ? 'Slide added to backend!' : 'Slide added locally.')
  }
  showSlideForm.value = false
}

async function confirmDeleteSlide(slide) {
  if (confirm(`Delete slide "${slide.heading.replace(/\n/g,' ')}"?`)) {
    await hpStore.deleteSlide(slide.id)
    uiStore.toast('Slide deleted')
  }
}

async function confirmResetSlides() {
  if (confirm('Reset hero slider to default slides? This cannot be undone.')) {
    await hpStore.resetSlides()
    uiStore.toast('Slider reset to defaults')
  }
}
</script>


<style scoped>
/* Slide thumbnail in list */
.slide-thumb {
  width: 96px; height: 60px;
  border-radius: .5rem;
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.slide-thumb-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.35);
  border-radius: inherit;
}
.slide-num {
  position: absolute;
  top: 4px; left: 8px;
  color: #fff;
  font-weight: 700;
  font-size: .85rem;
  z-index: 1;
}

/* Preview strip */
.preview-tile {
  width: 220px; height: 130px;
  border-radius: .75rem;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}
.preview-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(0,0,0,.75) 0%, transparent 100%);
  padding: .75rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.preview-tag     { font-size: .55rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.7); margin-bottom: .15rem; }
.preview-heading { font-size: .7rem; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: .25rem; }
.preview-cta     { font-size: .6rem; color: rgba(255,255,255,.75); }

/* Category preview grid */
.cat-preview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 160px 120px;
  gap: .6rem;
}
.cat-pos-1 { grid-row: span 2; }

.cat-preview-card {
  border-radius: .75rem;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;
  display: flex;
  align-items: flex-end;
  padding: .75rem;
}
.cat-preview-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
.cat-preview-card.selected { outline: 3px solid var(--ah-primary); outline-offset: 2px; }

.cat-pv-glow {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%);
}
.cat-pv-body {
  position: relative; z-index: 1; color: #fff;
  display: flex; align-items: center; gap: .4rem;
}
.cat-pv-emoji { font-size: 1.3rem; }
.cat-pv-name  { font-size: .8rem; font-weight: 700; }

.cat-pv-edit-icon {
  position: absolute;
  top: .6rem; right: .6rem;
  color: rgba(255,255,255,.7);
  font-size: .75rem;
}
.cat-preview-card:hover .cat-pv-edit-icon { color: #fff; }

/* Category edit preview */
.cat-edit-preview {
  border-radius: .75rem;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  color: #fff;
}
.cat-edit-emoji { font-size: 2rem; }
.cat-edit-name  { font-size: 1.1rem; font-weight: 700; }

/* Gradient swatches */
.gradient-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.swatch {
  width: 34px; height: 34px;
  border-radius: .4rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform .15s, border-color .15s;
}
.swatch:hover { transform: scale(1.1); }
.swatch.active { border-color: #333; transform: scale(1.15); }

/* Modal */
.modal-backdrop-custom {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}
.slide-modal {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,.25);
  animation: modalIn .25s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(.95) translateY(-10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.slide-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e2ef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.slide-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}
.slide-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e2ef;
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  flex-shrink: 0;
}

/* Drag-drop image zone */
.img-drop-zone {
  height: 200px;
  border: 2px dashed #d0d0e8;
  border-radius: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: border-color .2s, background .2s;
}
.img-drop-zone:hover,
.img-drop-zone.dragging {
  border-color: var(--ah-primary);
  background-color: rgba(108,99,255,.04);
}
.img-drop-zone.has-img { border-color: transparent; }

.img-drop-content {
  text-align: center;
  pointer-events: none;
  transition: opacity .2s;
}
.img-drop-content.hidden { opacity: 0; }

.img-drop-overlay-edit {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  opacity: 0;
  transition: opacity .25s;
}
.img-drop-zone:hover .img-drop-overlay-edit { opacity: 1; }

.letter-spacing { letter-spacing: .06em; }
</style>
