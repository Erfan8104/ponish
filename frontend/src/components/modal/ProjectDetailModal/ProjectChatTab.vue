<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { storeToRefs } from 'pinia'
import { io } from 'socket.io-client'

const props = defineProps<{ contractId: number }>()

const chatStore = useChatStore()
const authStore = useAuthStore()
const { messages, isLoading } = storeToRefs(chatStore)

const socket = io('http://localhost:5000') // ✅ درست: متصل به پورت 5000 سرور
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(async () => {
  await chatStore.fetchMessages(props.contractId)
  scrollToBottom()

  socket.on('connect', () => {
    console.log('✅ Socket Connected:', socket.id)
  })

  socket.emit('join_contract', props.contractId)

  socket.on('receive_message', (msg) => {
    console.log('📨 Message received:', msg)

    chatStore.addMessage(msg)
    scrollToBottom()
  })
})

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  socket.emit('send_message', {
    contractId: props.contractId,
    senderId: Number(authStore.id),
    content: newMessage.value,
    type: 'text',
  })

  newMessage.value = ''
}

onUnmounted(() => {
  socket.off('receive_message')
  socket.disconnect()
  chatStore.clearMessages()
})
</script>

<template>
  <div
    class="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-xl shadow-slate-100/40 backdrop-blur-md dir-rtl"
  >
    <!-- هدر چت‌روم (مدرن و شیشه‌ای) -->
    <div
      class="flex items-center justify-between border-b border-slate-100/80 bg-white/80 p-4 backdrop-blur-md"
    >
      <div class="flex items-center gap-3">
        <div
          class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-md shadow-blue-500/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.222 3.419.169A13.9 13.9 0 0 0 12 21.75a14.033 14.033 0 0 0 2.877-3.604 13.906 13.906 0 0 0 3.42-.168c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-slate-800">گفتگوی قرارداد</h3>
          <p class="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            اتصال امن فعال است
          </p>
        </div>
      </div>
    </div>

    <!-- بخش پیام‌ها همراه با اسکرولبار مخفی/زیبا -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200"
    >
      <!-- حالت بارگذاری (Skeleton Loader مدرن) -->
      <div v-if="isLoading" class="space-y-4 animate-pulse">
        <div class="flex justify-start gap-2">
          <div class="h-10 w-2/3 rounded-2xl bg-slate-200/80 rounded-tr-sm"></div>
        </div>
        <div class="flex justify-end gap-2">
          <div class="h-12 w-1/2 rounded-2xl bg-blue-100/50 rounded-tl-sm"></div>
        </div>
        <div class="flex justify-start gap-2">
          <div class="h-8 w-1/3 rounded-2xl bg-slate-200/80 rounded-tr-sm"></div>
        </div>
      </div>

      <!-- انیمیشن ورود پیام‌ها -->
      <TransitionGroup name="message-list" tag="div" class="space-y-3" v-else>
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'flex w-full',
            msg.senderId === Number(authStore.id) ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            :class="[
              'max-w-[75%] px-4 py-2.5 shadow-sm transition-all duration-200 relative group',
              msg.senderId === Number(authStore.id)
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tl-none font-light shadow-blue-500/10'
                : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tr-none font-light',
            ]"
          >
            <p class="leading-relaxed text-[13px] whitespace-pre-line break-words">
              {{ msg.content }}
            </p>

            <span
              :class="[
                'mt-1 block text-[10px] text-left select-none',
                msg.senderId === Number(authStore.id) ? 'text-blue-100/80' : 'text-slate-400',
              ]"
            >
              {{
                new Date(msg.createdAt).toLocaleTimeString('fa-IR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </span>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- بخش فوتر و ورودی متن -->
    <div class="border-t border-slate-100 bg-white p-4">
      <div
        class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200"
      >
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          class="w-full bg-transparent py-3 pr-4 pl-14 text-sm text-slate-700 focus:outline-none placeholder:text-slate-400"
          placeholder="پیام خود را بنویسید..."
        />

        <!-- دکمه ارسال مدرن با آیکون -->
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="absolute left-2 rounded-lg bg-blue-600 p-2 text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-blue-500/15"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="h-4 w-4 transform rotate-180"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* انیمیشن‌های روان برای TransitionGroup */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.message-list-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.message-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.message-list-move {
  transition: transform 0.3s ease;
}

/* کلاس کمکی جهت‌گیری متن برای لایوت‌های کاملا فارسی */
.dir-rtl {
  direction: rtl;
}
</style>
