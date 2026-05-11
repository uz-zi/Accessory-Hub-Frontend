<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999">
    <TransitionGroup name="toast-slide">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="toast show align-items-center mb-2"
        :class="`text-bg-${toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : 'success'}`"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body">
            <i :class="`bi me-2 ${toastIcon(toast.type)}`"></i>{{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="uiStore.removeToast(toast.id)"></button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

function toastIcon(type) {
  const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-circle-fill', info: 'bi-info-circle-fill' }
  return map[type] || map.success
}
</script>

<style scoped>
.toast-slide-enter-active, .toast-slide-leave-active { transition: all .25s; }
.toast-slide-enter-from { opacity: 0; transform: translateX(60px); }
.toast-slide-leave-to   { opacity: 0; transform: translateX(60px); }
</style>
