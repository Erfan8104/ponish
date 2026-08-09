<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllConversationsApi } from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import ConversationDrawer from '@/components/admin/ui/ConversationDrawer.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const conversations = ref<any[]>([])
const loading = ref(true)

const showDrawer = ref(false)
const selectedConversation = ref<any>(null)

async function fetchConversations() {
  loading.value = true
  try {
    const data = await getAllConversationsApi()
    if (data?.success) {
      conversations.value = data.conversations || []
    }
  } catch (error) {
    console.error('خطا در دریافت مکالمات:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchConversations)

function formatTime(dateString: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const columns: TableColumn[] = [
  { key: 'participants', label: 'طرفین مکالمه' },
  { key: 'project', label: 'پروژه' },
  { key: 'preview', label: 'آخرین پیام' },
  { key: 'lastMessageAt', label: 'زمان', align: 'left' },
]

const rows = computed(() =>
  conversations.value.map((c) => ({
    key: c.key,
    participants: `${c.userA?.name || c.userA?.phone || '—'} ↔ ${c.userB?.name || c.userB?.phone || '—'}`,
    project: c.projectTitle || '—',
    preview: c.lastMessagePreview || '—',
    lastMessageAt: formatTime(c.lastMessageAt),
    _raw: c,
  })),
)

function openConversation(row: Record<string, any>) {
  selectedConversation.value = row._raw
  showDrawer.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت پیام‌ها</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست گفتگوهای ثبت‌شده در پلتفرم</p>
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="مکالمه‌ای یافت نشد"
        row-key="key"
        @row-click="openConversation"
      />
    </div>

    <ConversationDrawer v-model="showDrawer" :conversation="selectedConversation" />
  </div>
</template>
