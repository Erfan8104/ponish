<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  getAllNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '@/services/admin.service'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notifications = ref<any[]>([])
const loading = ref(true)
const unreadCount = ref(0)
const isReadFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
const page = ref(1)
const limit = 20
const totalItems = ref(0)
const totalPages = ref(1)

const typeOptions = [
  { label: 'کاربر جدید', value: 'new_user' },
  { label: 'پروژه جدید', value: 'new_project' },
  { label: 'پیشنهاد جدید', value: 'new_proposal' },
  { label: 'پرداخت انجام‌شده', value: 'payment_received' },
  { label: 'اصلاح قرارداد', value: 'contract_amendment' },
  { label: 'اختلاف قرارداد', value: 'contract_dispute' },
  { label: 'گزارش جدید', value: 'new_report' },
  { label: 'سیستمی', value: 'system' },
]

const statusOptions = [
  { label: 'خوانده‌نشده', value: 'false' },
  { label: 'خوانده‌شده', value: 'true' },
]

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

async function fetchNotifications() {
  loading.value = true
  try {
    const data = await getAllNotificationsApi({
      isRead: isReadFilter.value === null ? undefined : isReadFilter.value === 'true',
      type: typeFilter.value || undefined,
      page: page.value,
      limit,
    } as any)
    if (data?.success) {
      notifications.value = data.notifications || []
      unreadCount.value = data.unreadCount ?? 0
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت اعلان‌ها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotifications)

watch([isReadFilter, typeFilter], () => {
  page.value = 1
  fetchNotifications()
})
watch(page, fetchNotifications)

async function openNotification(n: any) {
  if (!n.isRead) {
    const res = await markNotificationReadApi(n.id)
    if (res?.success) {
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  if (n.link) router.push(n.link)
}

async function markAllRead() {
  const res = await markAllNotificationsReadApi()
  if (res?.success) fetchNotifications()
}

async function removeNotification(id: number) {
  const res = await deleteNotificationApi(id)
  if (res?.success) fetchNotifications()
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">اعلان‌ها</h1>
          <p class="text-xs text-gray-400 mt-1">{{ unreadCount }} اعلان خوانده‌نشده</p>
        </div>
        <button
          class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#008f55] rounded-xl text-xs font-bold"
          @click="markAllRead"
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      </div>

      <div class="flex gap-3">
        <AdminFilter
          v-model="isReadFilter"
          label="وضعیت"
          :options="statusOptions"
          placeholder="همه"
        />
        <AdminFilter
          v-model="typeFilter"
          label="نوع"
          :options="typeOptions"
          placeholder="همه انواع"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div
          class="w-6 h-6 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
      </div>

      <div v-else-if="!notifications.length" class="text-center py-16 text-xs text-gray-400">
        اعلانی یافت نشد
      </div>

      <div
        v-else
        class="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden"
      >
        <div
          v-for="n in notifications"
          :key="n.id"
          class="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
          :class="!n.isRead ? 'bg-emerald-50/40' : ''"
          @click="openNotification(n)"
        >
          <span class="text-lg shrink-0">{{ typeIcon[n.type] || '🔔' }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-xs font-bold text-gray-800">{{ n.title }}</p>
              <span v-if="!n.isRead" class="w-1.5 h-1.5 rounded-full bg-[#008f55]" />
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ n.message }}</p>
            <p class="text-[10px] text-gray-400 mt-1">{{ formatTime(n.createdAt) }}</p>
          </div>
          <button
            class="text-[10px] text-red-400 hover:text-red-600 shrink-0"
            @click.stop="removeNotification(n.id)"
          >
            حذف
          </button>
        </div>
      </div>

      <Pagination
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="limit"
      />
    </div>
  </div>
</template>
