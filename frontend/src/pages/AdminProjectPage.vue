<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  getAllProjectsApi,
  publishProjectApi,
  closeProjectApi,
  toggleFeatureProjectApi,
  deleteProjectApi,
} from '@/services/admin.service'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'
import { useRouter } from 'vue-router'

const projects = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)
const sortBy = ref('newest')
const router = useRouter()

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

function goToDetail(row: Record<string, any>) {
  router.push(`/admin/projects/${row.id}`)
}
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

async function publish(id: number) {
  const res = await publishProjectApi(id)
  if (res?.success) fetchProjects()
}

async function close(id: number) {
  const res = await closeProjectApi(id)
  if (res?.success) fetchProjects()
}

async function toggleFeature(id: number) {
  const res = await toggleFeatureProjectApi(id)
  if (res?.success) fetchProjects()
}

const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

function askDelete(id: number) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  const res = await deleteProjectApi(deleteTargetId.value)
  if (res?.success) fetchProjects()
  showDeleteModal.value = false
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
  { key: 'actions', label: 'عملیات', align: 'center' },
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
    _raw: p,
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
        @row-click="goToDetail"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-1.5 justify-center flex-wrap" @click.stop>
            <button
              v-if="row._raw.status === 'draft'"
              class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-medium"
              @click="publish(row.id)"
            >
              انتشار
            </button>
            <button
              v-if="['open', 'in_progress'].includes(row._raw.status)"
              class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[10px] font-medium"
              @click="close(row.id)"
            >
              بستن
            </button>
            <button
              class="px-2.5 py-1 rounded-lg text-[10px] font-medium"
              :class="
                row._raw.isFeatured
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              "
              @click="toggleFeature(row.id)"
            >
              {{ row._raw.isFeatured ? 'حذف ویژه' : 'ویژه کردن' }}
            </button>
            <button
              class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-medium"
              @click="askDelete(row.id)"
            >
              حذف
            </button>
          </div>
        </template>
      </AdminTable>

      <Pagination
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="limit"
      />
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف پروژه"
      message="آیا از حذف این پروژه مطمئن هستید؟ این عمل قابل بازگشت نیست."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>
