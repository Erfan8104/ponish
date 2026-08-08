<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllProjectsApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const projects = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)
const sortBy = ref('newest')

const statusOptions = [
  { label: 'پیش‌نویس', value: 'draft' },
  { label: 'باز', value: 'open' },
  { label: 'در حال انجام', value: 'in_progress' },
  { label: 'تکمیل‌شده', value: 'completed' },
  { label: 'لغوشده', value: 'cancelled' },
  { label: 'اختلاف', value: 'disputed' },
]

const sortOptions = [
  { label: 'جدیدترین', value: 'newest' },
  { label: 'قدیمی‌ترین', value: 'oldest' },
  { label: 'بیشترین بودجه', value: 'budget' },
]
async function fetchProjects() {
  loading.value = true
  try {
    const data = await getAllProjectsApi({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      sortBy: sortBy.value, // 👈 این خط اضافه شد

      page: page.value,
      limit,
    } as any)
    if (data?.success) {
      projects.value = data.projects || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت پروژه‌ها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)

// وقتی جستجو یا فیلتر عوض شد، برگرد صفحه ۱ و دوباره fetch کن
watch([search, statusFilter, sortBy], () => {
  page.value = 1
  fetchProjects()
})

// وقتی صفحه عوض شد فقط fetch کن
watch(page, fetchProjects)

function formatBudget(p: any) {
  if (p.budgetType === 'negotiable') return 'توافقی'
  const min = p.minBudget ? Number(p.minBudget).toLocaleString('fa-IR') : null
  const max = p.maxBudget ? Number(p.maxBudget).toLocaleString('fa-IR') : null
  if (min && max) return `${min} - ${max} تومان`
  return max ? `تا ${max} تومان` : '—'
}

const columns: TableColumn[] = [
  { key: 'title', label: 'عنوان' },
  { key: 'employer', label: 'کارفرما' },
  { key: 'budget', label: 'بودجه' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'province', label: 'استان' },
  { key: 'createdAt', label: 'تاریخ ثبت' },
]

const rows = computed(() =>
  projects.value.map((p) => ({
    id: p.id,
    title: p.title || 'بدون عنوان',
    employer: p.employer?.name || p.employer?.phone || '—',
    budget: formatBudget(p),
    status: p.status,
    province: p.province || '—',
    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fa-IR') : '-',
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت پروژه‌ها</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام پروژه‌های ثبت‌شده در پلتفرم</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو با عنوان یا نام کارفرما..." />
        </div>
        <AdminFilter
          v-model="statusFilter"
          label="وضعیت"
          :options="statusOptions"
          placeholder="همه وضعیت‌ها"
        />
        <AdminFilter
          v-model="sortBy"
          label="مرتب‌سازی"
          :options="sortOptions"
          placeholder="جدیدترین"
        />
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ پروژه‌ای یافت نشد"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
      </AdminTable>

      <Pagination
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="limit"
      />
    </div>
  </div>
</template>
