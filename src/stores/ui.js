import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const cartOpen    = ref(false)
  const chatOpen    = ref(false)
  const toasts      = ref([])   // { id, type, message, duration }
  let toastCounter  = 0

  function openCart()  { cartOpen.value = true  }
  function closeCart() { cartOpen.value = false }
  function toggleCart(){ cartOpen.value = !cartOpen.value }

  function openChat()  { chatOpen.value = true  }
  function closeChat() { chatOpen.value = false }
  function toggleChat(){ chatOpen.value = !chatOpen.value }

  function toast(message, type = 'success', duration = 3500) {
    const id = ++toastCounter
    toasts.value.push({ id, type, message, duration })
    setTimeout(() => removeToast(id), duration)
    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    cartOpen, chatOpen, toasts,
    openCart, closeCart, toggleCart,
    openChat, closeChat, toggleChat,
    toast, removeToast
  }
})
