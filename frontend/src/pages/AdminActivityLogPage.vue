<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllActivityLogsApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const logs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const actionFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
const page = ref(1)
const limit = 20
const totalItems = ref(0)
const totalPages = ref(1)

const actionOptions = [
  { label: 'حذف کاربر', value: 'user.delete' },
  { label: 'فعال‌سازی کاربر', value: 'user.activate' },
  { label: 'غیرفعال‌سازی کاربر', value: 'user.deactivate' },
  { label: 'حذف پروژه', value: 'project.delete' },
  { label: 'لغو قرارداد', value: 'contract.cancel' },
  { label: 'تکمیل قرارداد', value: 'contract.complete' },
  { label: 'حذف نظر', value: 'review.delete' },
  { label: 'حذف گزارش', value: 'report.delete' },
  { label: 'حذف فایل', value: 'file.delete' },
]

const typeOptions = [
  { label: 'کاربر', value: 'user' },
  { label: 'پروژه', value: 'project' },
  { label: 'قرارداد', value: 'contract' },
  { label: 'پیشنهاد', value: 'proposal' },
  { label: 'نظر', value: 'review' },
  { label: 'گزارش', value: 'report' },
  { label: 'فایل', value: 'file' },
]

async function fetchLogs() {
  loading.value = true
  try {
    const data = await getAllActivityLogsApi({
      search: search.value || undefined,
      action: actionFilter.value || undefined,
      targetType: typeFilter.value || undefined,
      page: page.value,
      limit,
    })
    if (data?.success) {
      logs.value = data.logs || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)
watch([search, actionFilter, typeFilter], () => {
  page.value = 1
  fetchLogs()
})
watch(page, fetchLogs)

const columns: TableColumn[] = [
  { key: 'admin', label: 'ادمین' },
  { key: 'action', label: 'عملیات' },
  { key: 'description', label: 'توضیح' },
  { key: 'createdAt', label: 'زمان' },
]

const rows = computed(() =>
  logs.value.map((l) => ({
    id: l.id,
    admin: l.admin?.name || l.admin?.phone || '—',
    action: l.action,
    description: l.description,
    createdAt: new Date(l.createdAt).toLocaleString('fa-IR'),
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">لاگ فعالیت‌های ادمین</h1>
        <p class="text-xs text-gray-400 mt-1">تاریخچه تمام اقدامات انجام‌شده توسط مدیران سیستم</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو در توضیحات یا نام ادمین..." />
        </div>
        <AdminFilter
          v-model="actionFilter"
          label="نوع عملیات"
          :options="actionOptions"
          placeholder="همه عملیات‌ها"
        />
        <AdminFilter
          v-model="typeFilter"
          label="نوع هدف"
          :options="typeOptions"
          placeholder="همه انواع"
        />
      </div>

      <AdminTable :columns="columns" :rows="rows" :loading="loading" empty-text="لاگی یافت نشد" />

      <Pagination
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="limit"
      />
    </div>
  </div>
</template>
