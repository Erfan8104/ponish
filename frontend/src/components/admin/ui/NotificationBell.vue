<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAllNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '@/services/admin.service'

const router = useRouter()

const showDropdown = ref(false)
const notifications = ref<any[]>([])
const unreadCount = ref(0)
const loading = ref(false)

const typeIcon: Record<string, string> = {
  new_user: '👤',
  new_project: '📁',
  new_proposal: '📝',
  payment_received: '💳',
  contract_amendment: '✏️',
  contract_dispute: '⚠️',
  new_report: '🚩',
  system: '⚙️',
}

async function fetchLatest() {
  loading.value = true
  try {
    const data = await getAllNotificationsApi({ limit: 8 } as any)
    if (data?.success) {
      notifications.value = data.notifications || []
      unreadCount.value = data.unreadCount ?? 0
    }
  } catch (error) {
    console.error('خطا در دریافت اعلان‌ها:', error)
  } finally {
    loading.value = false
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchLatest()
  // هر ۶۰ ثانیه یک‌بار وضعیت اعلان‌ها را چک کن
  pollTimer = setInterval(fetchLatest, 60000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) fetchLatest()
}

async function openNotification(n: any) {
  if (!n.isRead) {
    const res = await markNotificationReadApi(n.id)
    if (res?.success) {
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  showDropdown.value = false
  if (n.link) router.push(n.link)
}

async function markAllRead() {
  const res = await markAllNotificationsReadApi()
  if (res?.success) {
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  }
}

function goToAll() {
  showDropdown.value = false
  router.push('/admin/notifications')
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

function close() {
  showDropdown.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors relative"
      aria-label="اعلان‌ها"
      @click="toggleDropdown"
    >
      🔔
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -left-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <div v-if="showDropdown" class="fixed inset-0 z-10" @click="close" />

    <div
      v-if="showDropdown"
      class="absolute left-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 overflow-hidden"
      style="direction: rtl"
    >
      <div class="p-3 border-b border-gray-100 flex items-center justify-between">
        <span class="text-xs font-bold text-gray-700">اعلان‌ها</span>
        <button
          v-if="unreadCount > 0"
          class="text-[10px] text-[#008f55] hover:underline"
          @click="markAllRead"
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      </div>

      <div v-if="loading" class="p-6 flex justify-center">
        <div
          class="w-5 h-5 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
      </div>

      <div v-else-if="!notifications.length" class="p-6 text-center text-xs text-gray-400">
        اعلانی وجود ندارد
      </div>

      <div v-else class="max-h-80 overflow-y-auto divide-y divide-gray-50">
        <button
          v-for="n in notifications"
          :key="n.id"
          class="w-full text-right p-3 flex items-start gap-2 hover:bg-gray-50 transition-colors"
          :class="!n.isRead ? 'bg-emerald-50/40' : ''"
          @click="openNotification(n)"
        >
          <span class="text-base shrink-0">{{ typeIcon[n.type] || '🔔' }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-bold text-gray-800 truncate">{{ n.title }}</p>
            <p class="text-[10px] text-gray-500 mt-0.5 truncate">{{ n.message }}</p>
            <p class="text-[9px] text-gray-400 mt-0.5">{{ formatTime(n.createdAt) }}</p>
          </div>
          <span v-if="!n.isRead" class="w-1.5 h-1.5 rounded-full bg-[#008f55] mt-1 shrink-0" />
        </button>
      </div>

      <button
        class="w-full p-2.5 text-center text-xs font-bold text-[#008f55] hover:bg-gray-50 border-t border-gray-100 transition-colors"
        @click="goToAll"
      >
        مشاهده همه اعلان‌ها
      </button>
    </div>
  </div>
</template>
