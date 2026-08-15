<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllReportsApi, updateReportStatusApi, deleteReportApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import AdminStatCard from '@/components/admin/ui/AdminStatCard.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const reports = ref<any[]>([])
const stats = ref({
  pending: 0,
  reviewing: 0,
  resolved: 0,
  rejected: 0,
  dismissed: 0,
})
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)

const statusOptions = [
  { label: 'در انتظار', value: 'pending' },
  { label: 'در حال بررسی', value: 'reviewing' },
  { label: 'رسیدگی‌شده', value: 'resolved' },
  { label: 'رد شده', value: 'rejected' },
  { label: 'بایگانی', value: 'dismissed' },
]

const typeOptions = [
  { label: 'کاربر', value: 'user' },
  { label: 'پروژه', value: 'project' },
  { label: 'پیام', value: 'message' },
  { label: 'نظر', value: 'review' },
  { label: 'پیشنهاد', value: 'proposal' },
]

const statusLabel: Record<string, string> = {
  pending: 'در انتظار',
  reviewing: 'در حال بررسی',
  resolved: 'رسیدگی‌شده',
  rejected: 'رد شده',
  dismissed: 'بایگانی',
}

const typeLabel: Record<string, string> = {
  user: 'کاربر',
  project: 'پروژه',
  message: 'پیام',
  review: 'نظر',
  proposal: 'پیشنهاد',
}

async function fetchReports() {
  loading.value = true
  try {
    const data = await getAllReportsApi({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      targetType: typeFilter.value || undefined,
      page: page.value,
      limit,
    })
    if (data?.success) {
      reports.value = data.reports || []
      stats.value = data.stats || stats.value
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReports)
watch([search, statusFilter, typeFilter], () => {
  page.value = 1
  fetchReports()
})
watch(page, fetchReports)

// ---- حذف ----
const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

function askDelete(id: number) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  const res = await deleteReportApi(deleteTargetId.value)
  if (res?.success) fetchReports()
  showDeleteModal.value = false
}

// ---- تغییر وضعیت سریع ----
async function changeStatus(id: number, status: string) {
  const res = await updateReportStatusApi(id, { status })
  if (res?.success) fetchReports()
}

const columns: TableColumn[] = [
  { key: 'reporter', label: 'گزارش‌دهنده' },
  { key: 'targetType', label: 'نوع هدف', align: 'center' },
  { key: 'reason', label: 'دلیل' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  reports.value.map((r) => ({
    id: r.id,
    reporter: r.reporter?.name || r.reporter?.phone || '—',
    targetType: typeLabel[r.targetType] || r.targetType,
    targetTypeRaw: r.targetType,
    reason: r.reason,
    status: statusLabel[r.status] || r.status,
    statusRaw: r.status,
    createdAt: new Date(r.createdAt).toLocaleDateString('fa-IR'),
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- عنوان -->
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت گزارش‌ها</h1>
        <p class="text-xs text-gray-400 mt-1">گزارش‌های کاربران درباره محتوا و کاربران دیگر</p>
      </div>

      <!-- کارت‌های آماری -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        + <AdminStatCard title="در انتظار" :value="stats.pending" color="amber" />
        <AdminStatCard title="در حال بررسی" :value="stats.reviewing" color="blue" />
        <AdminStatCard title="رسیدگی‌شده" :value="stats.resolved" color="green" />
        <AdminStatCard title="رد شده" :value="stats.rejected" color="red" />
        <AdminStatCard title="بایگانی" :value="stats.dismissed" color="gray" />
      </div>

      <!-- فیلترها -->
      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو در دلیل یا نام گزارش‌دهنده..." />
        </div>
        <AdminFilter
          v-model="statusFilter"
          label="وضعیت"
          :options="statusOptions"
          placeholder="همه وضعیت‌ها"
        />
        <AdminFilter
          v-model="typeFilter"
          label="نوع هدف"
          :options="typeOptions"
          placeholder="همه انواع"
        />
      </div>

      <!-- جدول -->
      <AdminTable :columns="columns" :rows="rows" :loading="loading" empty-text="گزارشی یافت نشد">
        <template #cell-status="{ row }">
          <span
            class="inline-flex px-2 py-0.5 rounded text-[11px] font-medium"
            :class="{
              'bg-yellow-50 text-yellow-700': row.statusRaw === 'pending',
              'bg-blue-50 text-blue-700': row.statusRaw === 'reviewing',
              'bg-green-50 text-green-700': row.statusRaw === 'resolved',
              'bg-red-50 text-red-700': row.statusRaw === 'rejected',
              'bg-gray-100 text-gray-600': row.statusRaw === 'dismissed',
            }"
          >
            {{ row.status }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex justify-center gap-1.5 flex-wrap" @click.stop>
            <button
              v-if="row.statusRaw === 'pending'"
              class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'reviewing')"
            >
              بررسی
            </button>
            <button
              v-if="['pending', 'reviewing'].includes(row.statusRaw)"
              class="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'resolved')"
            >
              رسیدگی
            </button>
            <button
              v-if="['pending', 'reviewing'].includes(row.statusRaw)"
              class="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'rejected')"
            >
              رد
            </button>
            <button
              class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px]"
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
      title="حذف گزارش"
      message="آیا از حذف این گزارش مطمئن هستید؟"
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>
