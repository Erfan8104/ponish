<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAllReviewsApi, deleteReviewApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const reviews = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const ratingFilter = ref<string | number | null>(null)
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)

const ratingOptions = [
  { label: '⭐ 1', value: 1 },
  { label: '⭐ 2', value: 2 },
  { label: '⭐ 3', value: 3 },
  { label: '⭐ 4', value: 4 },
  { label: '⭐ 5', value: 5 },
]

async function fetchReviews() {
  loading.value = true
  try {
    const data = await getAllReviewsApi({
      search: search.value || undefined,
      rating: ratingFilter.value ? Number(ratingFilter.value) : undefined,
      page: page.value,
      limit,
    } as any)
    if (data?.success) {
      reviews.value = data.reviews || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت نظرات:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReviews)

watch([search, ratingFilter], () => {
  page.value = 1
  fetchReviews()
})
watch(page, fetchReviews)

const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

function askDelete(id: number) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  const res = await deleteReviewApi(deleteTargetId.value)
  if (res?.success) fetchReviews()
  showDeleteModal.value = false
}

const columns: TableColumn[] = [
  { key: 'reviewer', label: 'نظردهنده' },
  { key: 'reviewed', label: 'نظرگیرنده' },
  { key: 'rating', label: 'امتیاز', align: 'center' },
  { key: 'comment', label: 'نظر' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  reviews.value.map((r) => ({
    id: r.id,
    reviewer: r.reviewer?.name || r.reviewer?.phone || '—',
    reviewed: r.reviewed?.name || r.reviewed?.phone || '—',
    rating: '⭐'.repeat(r.rating),
    comment: r.comment || '—',
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت نظرات</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام نظرات ثبت‌شده در پلتفرم</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو در نظرات یا نام کاربران..." />
        </div>
        <AdminFilter
          v-model="ratingFilter"
          label="امتیاز"
          :options="ratingOptions"
          placeholder="همه امتیازها"
        />
      </div>

      <AdminTable :columns="columns" :rows="rows" :loading="loading" empty-text="نظری یافت نشد">
        <template #cell-actions="{ row }">
          <div class="flex justify-center" @click.stop>
            <button
              class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-medium"
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
      title="حذف نظر"
      message="آیا از حذف این نظر مطمئن هستید؟ این عمل قابل بازگشت نیست."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>
