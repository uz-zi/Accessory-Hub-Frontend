<template>
  <div class="chat-widget">
    <!-- Chat window -->
    <Transition name="chat-pop">
      <div v-if="uiStore.chatOpen" class="chat-window">
        <!-- Header -->
        <div class="d-flex align-items-center gap-2 p-3" style="background:var(--ah-primary);color:#fff">
          <div class="rounded-circle bg-white d-flex align-items-center justify-content-center"
            style="width:32px;height:32px">
            <i class="bi bi-robot" style="color:var(--ah-primary);font-size:1rem"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold" style="font-size:.875rem">AccessoryHub Assistant</div>
            <div style="font-size:.7rem;opacity:.8">● Online</div>
          </div>
          <button class="btn-close btn-close-white btn-sm" @click="uiStore.closeChat()"></button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesEl">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-msg"
            :class="msg.role"
          >
            {{ msg.text }}
          </div>
          <div v-if="thinking" class="chat-msg bot">
            <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        </div>

        <!-- Input -->
        <form class="d-flex gap-2 p-2 border-top" @submit.prevent="sendMessage">
          <input
            v-model="input"
            type="text"
            class="form-control form-control-sm"
            placeholder="Ask about products, orders…"
            :disabled="thinking"
          />
          <button class="btn btn-primary btn-sm px-3" type="submit" :disabled="!input.trim() || thinking">
            <i class="bi bi-send"></i>
          </button>
        </form>
      </div>
    </Transition>

    <!-- Bubble button -->
    <button class="chat-bubble-btn" @click="uiStore.toggleChat()" :title="uiStore.chatOpen ? 'Close chat' : 'Chat with us'">
      <i :class="uiStore.chatOpen ? 'bi bi-x-lg' : 'bi bi-chat-dots-fill'"></i>
    </button>

    <!-- Unread badge -->
    <span
      v-if="!uiStore.chatOpen && unread > 0"
      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      style="font-size:.65rem"
    >{{ unread }}</span>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore   = useUiStore()
const input     = ref('')
const thinking  = ref(false)
const unread    = ref(1)
const messagesEl = ref(null)
let msgId = 0

const GREET = 'Hi! I\'m your AccessoryHub assistant 👋 Ask me about products, compatibility, or your order.'

const messages = ref([
  { id: ++msgId, role: 'bot', text: GREET }
])

// Simple bot responses (swap with real API call as needed)
const BOT_REPLIES = [
  'Great question! Let me check that for you.',
  'You can find all our phone cases under the Cases category.',
  'We offer free shipping on orders over $50!',
  'Our most popular product right now is the MagSafe-compatible slim case.',
  'You can track your order under My Account → Orders.',
  'We accept returns within 30 days of purchase.',
  'All our chargers support USB-C fast charging.'
]

function botReply() {
  return BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  unread.value = 0

  messages.value.push({ id: ++msgId, role: 'user', text })
  await scrollToBottom()

  thinking.value = true
  await new Promise(r => setTimeout(r, 900 + Math.random() * 800))
  thinking.value = false

  messages.value.push({ id: ++msgId, role: 'bot', text: botReply() })
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

watch(() => uiStore.chatOpen, open => {
  if (open) { unread.value = 0; scrollToBottom() }
})
</script>

<style scoped>
.chat-pop-enter-active, .chat-pop-leave-active { transition: opacity .2s, transform .2s; }
.chat-pop-enter-from, .chat-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.95); }

.typing-dots span {
  animation: blink 1.2s infinite;
  display: inline-block;
}
.typing-dots span:nth-child(2) { animation-delay: .2s; }
.typing-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
</style>
