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

const socket = io('http://localhost:3000')

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
  <div class="flex h-[500px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div ref="messagesContainer" class="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">
      <div v-if="isLoading" class="text-center text-sm text-gray-400">در حال دریافت پیام‌ها...</div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex', msg.senderId === Number(authStore.id) ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
            msg.senderId === Number(authStore.id)
              ? 'bg-blue-600 text-white'
              : 'border bg-white text-gray-800',
          ]"
        >
          <p>{{ msg.content }}</p>

          <span class="mt-1 block text-[10px] opacity-70">
            {{
              new Date(msg.createdAt).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="border-t p-4">
      <div class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          class="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="پیام خود را بنویسید..."
        />

        <button
          @click="sendMessage"
          class="rounded-xl bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
        >
          ارسال
        </button>
      </div>
    </div>
  </div>
</template>
