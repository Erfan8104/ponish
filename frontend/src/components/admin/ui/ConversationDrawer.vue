<script setup lang="ts">
import { ref, watch } from 'vue'
import { getConversationThreadApi } from '@/services/admin.service'

const props = defineProps<{
  modelValue: boolean
  conversation: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const loading = ref(false)
const messages = ref<any[]>([])

async function loadThread() {
  if (!props.conversation) return

  loading.value = true
  messages.value = []

  try {
    const params = props.conversation.contractId
      ? { contractId: props.conversation.contractId }
      : { userAId: props.conversation.userA?.id, userBId: props.conversation.userB?.id }

    const data = await getConversationThreadApi(params)
    if (data?.success) {
      messages.value = data.messages || []
    }
  } catch (error) {
    console.error('خطا در دریافت مکالمه:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) loadThread()
  },
)

function close() {
  emit('update:modelValue', false)
}

function formatTime(dateString: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function messageContent(msg: any) {
  if (msg.type === 'text') return msg.content
  if (msg.type === 'file') return '📎 فایل پیوست'
  return 'پیام سیستمی'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100]" style="direction: rtl">
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <Transition name="drawer-slide">
          <div
            v-if="modelValue"
            class="absolute top-0 left-0 h-full w-full sm:w-[420px] bg-white shadow-xl flex flex-col"
          >
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <div v-if="conversation">
                <p class="text-xs font-bold text-gray-800">
                  {{ conversation.userA?.name || conversation.userA?.phone || '—' }} ↔
                  {{ conversation.userB?.name || conversation.userB?.phone || '—' }}
                </p>
                <p v-if="conversation.projectTitle" class="text-[10px] text-gray-400 mt-1">
                  پروژه: {{ conversation.projectTitle }}
                </p>
              </div>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                @click="close"
              >
                ✕
              </button>
            </div>

            <div v-if="loading" class="flex-1 flex items-center justify-center">
              <div
                class="w-6 h-6 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
              />
            </div>

            <div
              v-else-if="!messages.length"
              class="flex-1 flex items-center justify-center text-xs text-gray-400"
            >
              پیامی برای نمایش وجود ندارد
            </div>

            <div v-else class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="max-w-[85%] p-3 rounded-2xl text-xs"
                :class="
                  conversation && msg.senderId === conversation.userA?.id
                    ? 'bg-emerald-50 mr-auto'
                    : 'bg-gray-100 ml-auto'
                "
              >
                <p class="font-bold text-[10px] text-gray-500 mb-1">
                  {{ msg.sender?.name || msg.sender?.phone || '—' }}
                </p>
                <p class="text-gray-700 whitespace-pre-wrap">{{ messageContent(msg) }}</p>
                <p class="text-[9px] text-gray-400 mt-1">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}
</style>
