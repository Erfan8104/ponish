<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsersApi, toggleUserStatusApi } from '@/services/admin.service'
import AdminSearch from '@/components/admin/ui/AdminSearch.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import Pagination from '@/components/admin/ui/Pagination.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const router = useRouter()

const users = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const roleFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const verifiedFilter = ref<string | null>(null)
const sortBy = ref<string>('newest')
const page = ref(1)
const limit = 10
const totalItems = ref(0)
const totalPages = ref(1)

const roleOptions = [
  { label: 'کارفرما', value: 'employer' },
  { label: 'فریلنسر', value: 'freelancer' },
  { label: 'هردو', value: 'both' },
  { label: 'ادمین', value: 'admin' },
]
const statusOptions = [
  { label: 'فعال', value: 'active' },
  { label: 'غیرفعال', value: 'inactive' },
]
const verifiedOptions = [
  { label: 'تایید شده', value: 'verified' },
  { label: 'تایید نشده', value: 'unverified' },
]
const sortOptions = [
  { label: 'جدیدترین', value: 'newest' },
  { label: 'قدیمی‌ترین', value: 'oldest' },
  { label: 'بیشترین پروژه', value: 'projectsCount' },
]

const roleLabel: Record<string, string> = {
  employer: 'کارفرما',
  freelancer: 'فریلنسر',
  both: 'هردو',
  admin: 'ادمین',
}

async function fetchUsers() {
  loading.value = true
  try {
    const data = await getAllUsersApi({
      search: search.value || undefined,
      role: roleFilter.value || undefined,
      status: statusFilter.value || undefined,
      verified: verifiedFilter.value || undefined,
      sortBy: sortBy.value,
      page: page.value,
      limit,
    } as any)
    if (data?.success) {
      users.value = data.users || []
      totalItems.value = data.pagination?.total || 0
      totalPages.value = data.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)
watch([roleFilter, statusFilter, verifiedFilter, sortBy, search], () => {
  page.value = 1
  fetchUsers()
})
watch(page, fetchUsers)

async function toggleStatus(userId: number) {
  const res = await toggleUserStatusApi(userId)
  if (res?.success) {
    const user = users.value.find((u) => u.id === userId)
    if (user) user.isActive = res.user.isActive
  }
}

const columns: TableColumn[] = [
  { key: 'name', label: 'نام و نام خانوادگی' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'email', label: 'ایمیل' },
  { key: 'role', label: 'نقش', align: 'center' },
  { key: 'isVerified', label: 'احراز هویت', align: 'center' },
  { key: 'isActive', label: 'وضعیت', align: 'center' },
  { key: 'createdAt', label: 'تاریخ عضویت' },
  { key: 'actions', label: 'عملیات', align: 'center' },
]

const rows = computed(() =>
  users.value.map((u) => ({
    id: u.id,
    name: u.name || 'تکمیل نشده',
    phone: u.phone,
    email: u.email || 'ثبت نشده',
    role: roleLabel[u.role] || u.role,
    isVerified: u.isVerified,
    isActive: u.isActive,
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('fa-IR') : '-',
    _raw: u,
  })),
)

function goToDetail(row: Record<string, any>) {
  router.push(`/admin/users/${row.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت کاربران</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام کاربران ثبت‌نام شده در پلتفرم</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div class="lg:w-80">
          <AdminSearch v-model="search" placeholder="جستجو با نام، شماره یا ایمیل..." />
        </div>
        <AdminFilter
          v-model="roleFilter"
          label="نقش"
          :options="roleOptions"
          placeholder="همه نقش‌ها"
        />
        <AdminFilter
          v-model="statusFilter"
          label="وضعیت"
          :options="statusOptions"
          placeholder="همه وضعیت‌ها"
        />
        <AdminFilter
          v-model="verifiedFilter"
          label="احراز هویت"
          :options="verifiedOptions"
          placeholder="همه"
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
        empty-text="هیچ کاربری یافت نشد"
        @row-click="goToDetail"
      >
        <template #cell-isVerified="{ value }">
          <StatusBadge :status="value ? 'active' : 'inactive'" />
        </template>
        <template #cell-isActive="{ value }">
          <StatusBadge :status="value ? 'active' : 'inactive'" />
        </template>
        <template #cell-actions="{ row }">
          <button
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            :class="
              row._raw.isActive
                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                : 'bg-green-50 hover:bg-green-100 text-green-600'
            "
            @click.stop="toggleStatus(row.id)"
          >
            {{ row._raw.isActive ? 'مسدود کردن' : 'فعال‌سازی' }}
          </button>
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
