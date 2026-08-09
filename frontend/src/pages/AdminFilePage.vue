<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllFilesApi, deleteFileApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const files = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const typeFilter = ref<string | null>(null)
const page = ref(1)
const limit = 20
const totalItems = ref(0)
const totalPages = ref(1)

const typeOptions = [
  { label: 'آواتار', value: 'avatar' },
  { label: 'پیوست پروژه', value: 'attachment' },
]

async function fetchFiles() {
  loading.value = true
  try {
    const data = await getAllFilesApi({
      search: search.value || undefined,
      type: (typeFilter.value as any) || undefined,
      page: page.value,
      limit,
    })
    if (data?.success) {
      files.value = data.files || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchFiles)
watch([search, typeFilter], () => {
  page.value = 1
  fetchFiles()
})
watch(page, fetchFiles)

const showDeleteModal = ref(false)
const deleteTarget = ref<{ type: string; id: number } | null>(null)

function askDelete(type: string, id: number) {
  deleteTarget.value = { type, id }
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const res = await deleteFileApi(deleteTarget.value.type as any, deleteTarget.value.id)
  if (res?.success) fetchFiles()
  showDeleteModal.value = false
}

function getPreviewUrl(file: any) {
  if (!file.fileUrl) return null
  // اگر از قبل absolute یا با /uploads شروع شده باشد
  if (file.fileUrl.startsWith('http') || file.fileUrl.startsWith('/uploads')) {
    return file.fileUrl
  }
  return `/uploads/${file.fileUrl.replace(/^\/+/, '')}`
}

function formatSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const columns: TableColumn[] = [
  { key: 'type', label: 'نوع', align: 'center' },
  { key: 'fileName', label: 'نام فایل' },
  { key: 'related', label: 'مرتبط با' },
  { key: 'size', label: 'حجم', align: 'center' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  files.value.map((f) => ({
    id: f.id,
    type: f.type === 'avatar' ? 'آواتار' : 'پیوست',
    typeRaw: f.type,
    fileName: f.fileName,
    related: f.relatedTitle,
    size: formatSize(f.fileSize),
    createdAt: new Date(f.createdAt).toLocaleDateString('fa-IR'),
    fileUrl: f.fileUrl,
    previewUrl: getPreviewUrl(f),
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت فایل‌ها</h1>
        <p class="text-xs text-gray-400 mt-1">آواتار کاربران و پیوست‌های پروژه‌ها</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو در نام فایل، کاربر یا پروژه..." />
        </div>
        <AdminFilter
          v-model="typeFilter"
          label="نوع فایل"
          :options="typeOptions"
          placeholder="همه فایل‌ها"
        />
      </div>

      <AdminTable :columns="columns" :rows="rows" :loading="loading" empty-text="فایلی یافت نشد">
        <template #cell-type="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
            :class="
              row.typeRaw === 'avatar' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
            "
          >
            {{ row.type }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex justify-center gap-1.5" @click.stop>
            <a
              v-if="row.previewUrl"
              :href="row.previewUrl"
              target="_blank"
              class="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[11px]"
            >
              پیش‌نمایش
            </a>
            <a
              v-if="row.previewUrl"
              :href="row.previewUrl"
              download
              class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px]"
            >
              دانلود
            </a>
            <button
              class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px]"
              @click="askDelete(row.typeRaw, row.id)"
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
      title="حذف فایل"
      message="آیا از حذف این فایل مطمئن هستید؟ فایل از دیسک نیز حذف خواهد شد."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>
