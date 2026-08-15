<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  getAllConsultationsApi,
  updateConsultationStatusApi,
  deleteConsultationApi,
} from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import AdminStatCard from '@/components/admin/ui/AdminStatCard.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const consultations = ref<any[]>([])
const stats = ref({
  pending: 0,
  contacted: 0,
  completed: 0,
  cancelled: 0,
})
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)
const projectTypeFilter = ref<string | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)

const statusOptions = [
  { label: 'در انتظار', value: 'pending' },
  { label: 'در حال تماس', value: 'contacted' },
  { label: 'تکمیل‌شده', value: 'completed' },
  { label: 'لغوشده', value: 'cancelled' },
]

const projectTypeOptions = [
  { label: 'زمینی', value: 'ground' },
  { label: 'هوایی (پهپاد)', value: 'aerial' },
  { label: 'جی‌آی‌اس (GIS)', value: 'gis' },
  { label: 'نامشخص', value: 'unknown' },
]

const projectTypeLabel: Record<string, string> = {
  ground: 'زمینی',
  aerial: 'هوایی',
  gis: 'GIS',
  unknown: 'نامشخص',
}

const contactTimeLabel: Record<string, string> = {
  morning: 'صبح (۹ تا ۱۲)',
  noon: 'ظهر (۱۲ تا ۱۶)',
  evening: 'عصر (۱۶ تا ۲۰)',
}

async function fetchConsultations() {
  loading.value = true
  try {
    const data = await getAllConsultationsApi({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      projectType: projectTypeFilter.value || undefined,
      page: page.value,
      limit,
    })
    if (data?.success) {
      consultations.value = data.consultations || []
      stats.value = data.stats || stats.value
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت درخواست‌های مشاوره:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchConsultations)

watch([search, statusFilter, projectTypeFilter], () => {
  page.value = 1
  fetchConsultations()
})
watch(page, fetchConsultations)

// ---- تغییر وضعیت ----
async function changeStatus(id: number, status: string) {
  const res = await updateConsultationStatusApi(id, { status })
  if (res?.success) {
    fetchConsultations()
    if (selectedConsultation.value?.id === id) {
      selectedConsultation.value = { ...selectedConsultation.value, status }
    }
  }
}

// ---- حذف ----
const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

function askDelete(id: number) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  const res = await deleteConsultationApi(deleteTargetId.value)
  if (res?.success) {
    fetchConsultations()
    if (selectedConsultation.value?.id === deleteTargetId.value) {
      selectedConsultation.value = null
    }
  }
  showDeleteModal.value = false
}

// ---- جزئیات (Modal ساده داخل همین صفحه) ----
const selectedConsultation = ref<any | null>(null)

function openDetail(row: Record<string, any>) {
  selectedConsultation.value = row._raw
}

function closeDetail() {
  selectedConsultation.value = null
}

const columns: TableColumn[] = [
  { key: 'name', label: 'نام' },
  { key: 'phone', label: 'شماره موبایل' },
  { key: 'projectType', label: 'نوع پروژه', align: 'center' },
  { key: 'contactTime', label: 'زمان تماس' },
  { key: 'createdAt', label: 'تاریخ ثبت' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  consultations.value.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    projectType: projectTypeLabel[c.projectType] || c.projectType,
    contactTime: c.contactTime ? contactTimeLabel[c.contactTime] : 'هر زمانی',
    status: c.status,
    createdAt: new Date(c.createdAt).toLocaleDateString('fa-IR'),
    _raw: c,
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- عنوان -->
      <div>
        <h1 class="text-xl font-bold text-gray-900">درخواست‌های مشاوره</h1>
        <p class="text-xs text-gray-400 mt-1">
          درخواست‌های ثبت‌شده از فرم «مشاوره رایگان» توسط بازدیدکنندگان سایت
        </p>
      </div>

      <!-- کارت‌های آماری -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminStatCard title="در انتظار" :value="stats.pending" color="amber" />
        <AdminStatCard title="در حال تماس" :value="stats.contacted" color="blue" />
        <AdminStatCard title="تکمیل‌شده" :value="stats.completed" color="green" />
        <AdminStatCard title="لغوشده" :value="stats.cancelled" color="gray" />
      </div>

      <!-- فیلترها -->
      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو با نام، موبایل یا ایمیل..." />
        </div>
        <AdminFilter
          v-model="statusFilter"
          label="وضعیت"
          :options="statusOptions"
          placeholder="همه وضعیت‌ها"
        />
        <AdminFilter
          v-model="projectTypeFilter"
          label="نوع پروژه"
          :options="projectTypeOptions"
          placeholder="همه انواع"
        />
      </div>

      <!-- جدول -->
      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="درخواست مشاوره‌ای یافت نشد"
        @row-click="openDetail"
      >
        <template #cell-phone="{ value }">
          <span dir="ltr">{{ value }}</span>
        </template>

        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-1.5 justify-center flex-wrap" @click.stop>
            <button
              v-if="row._raw.status === 'pending'"
              class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'contacted')"
            >
              تماس گرفته شد
            </button>
            <button
              v-if="['pending', 'contacted'].includes(row._raw.status)"
              class="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'completed')"
            >
              تکمیل شد
            </button>
            <button
              v-if="['pending', 'contacted'].includes(row._raw.status)"
              class="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded text-[11px]"
              @click="changeStatus(row.id, 'cancelled')"
            >
              لغو
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

    <!-- Modal جزئیات (ساده، بدون نیاز به Component/Route جدید) -->
    <div
      v-if="selectedConsultation"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="closeDetail"
    >
      <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4" dir="rtl">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-900">جزئیات درخواست مشاوره</h2>
          <button class="text-gray-400 hover:text-gray-600 text-sm" @click="closeDetail">✕</button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">نام</span>
            <span class="font-medium text-gray-800">{{ selectedConsultation.name }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">شماره موبایل</span>
            <span class="font-medium text-gray-800" dir="ltr">{{
              selectedConsultation.phone
            }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">ایمیل</span>
            <span class="font-medium text-gray-800" dir="ltr">{{
              selectedConsultation.email || '—'
            }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">نوع پروژه</span>
            <span class="font-medium text-gray-800">{{
              projectTypeLabel[selectedConsultation.projectType] || selectedConsultation.projectType
            }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">زمان تماس</span>
            <span class="font-medium text-gray-800">{{
              selectedConsultation.contactTime
                ? contactTimeLabel[selectedConsultation.contactTime]
                : 'هر زمانی'
            }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">وضعیت</span>
            <StatusBadge :status="selectedConsultation.status" />
          </div>
          <div class="flex justify-between border-b border-gray-100 pb-2">
            <span class="text-gray-400">تاریخ ثبت</span>
            <span class="font-medium text-gray-800">{{
              new Date(selectedConsultation.createdAt).toLocaleString('fa-IR')
            }}</span>
          </div>
          <div>
            <span class="text-gray-400 block mb-1.5">توضیحات پروژه</span>
            <p class="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 text-xs">
              {{ selectedConsultation.description }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap pt-2">
          <button
            v-if="selectedConsultation.status === 'pending'"
            class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
            @click="changeStatus(selectedConsultation.id, 'contacted')"
          >
            تماس گرفته شد
          </button>
          <button
            v-if="['pending', 'contacted'].includes(selectedConsultation.status)"
            class="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium"
            @click="changeStatus(selectedConsultation.id, 'completed')"
          >
            تکمیل شد
          </button>
          <button
            v-if="['pending', 'contacted'].includes(selectedConsultation.status)"
            class="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-medium"
            @click="changeStatus(selectedConsultation.id, 'cancelled')"
          >
            لغو
          </button>
          <button
            class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium"
            @click="askDelete(selectedConsultation.id)"
          >
            حذف
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف درخواست مشاوره"
      message="آیا از حذف این درخواست مشاوره مطمئن هستید؟ این عمل قابل بازگشت نیست."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>
