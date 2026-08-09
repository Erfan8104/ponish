<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import CategoryFormModal from '@/components/admin/ui/CategoryFormModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'
import type { CategoryOption } from '@/components/admin/ui/CategoryFormModal.vue'

const categories = ref<any[]>([])
const loading = ref(true)

async function fetchCategories() {
  loading.value = true
  try {
    const data = await getAllCategoriesApi()
    if (data?.success) {
      categories.value = data.categories || []
    }
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌ها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)

const columns: TableColumn[] = [
  { key: 'name', label: 'نام' },
  { key: 'slug', label: 'اسلاگ', align: 'center' },
  { key: 'parent', label: 'والد', align: 'center' },
  { key: 'description', label: 'توضیحات' },
  { key: 'projectsCount', label: 'تعداد پروژه', align: 'center' },
  { key: 'actions', label: 'اکشن‌ها', align: 'center' },
]

const rows = computed(() =>
  categories.value.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent: c.parent?.name || '—',
    description: c.description || '—',
    projectsCount: c._count?.projects ?? 0,
    childrenCount: c._count?.children ?? 0,
  })),
)

const parentOptions = computed<CategoryOption[]>(() =>
  categories.value.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentId,
  })),
)

// ---------- Create / Edit Modal ----------
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formLoading = ref(false)
const formError = ref<string | null>(null)
const editingCategory = ref<any>(null)

function openCreate() {
  formMode.value = 'create'
  editingCategory.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(row: Record<string, any>) {
  const full = categories.value.find((c) => c.id === row.id)
  if (!full) return
  formMode.value = 'edit'
  editingCategory.value = full
  formError.value = null
  formOpen.value = true
}

async function handleFormSubmit(payload: {
  name: string
  slug: string
  description: string
  parentId: number | null
}) {
  formLoading.value = true
  formError.value = null
  try {
    let res
    if (formMode.value === 'create') {
      res = await createCategoryApi(payload)
    } else {
      res = await updateCategoryApi(editingCategory.value.id, payload)
    }

    if (!res?.success) {
      formError.value = res?.message || 'خطا در ذخیره‌سازی'
      return
    }

    await fetchCategories()
    formOpen.value = false
  } catch (error: any) {
    formError.value = error?.response?.data?.message || error?.message || 'خطا در ذخیره‌سازی'
  } finally {
    formLoading.value = false
  }
}

// ---------- Delete Modal ----------
const deleteOpen = ref(false)
const deleteLoading = ref(false)
const deleteTarget = ref<{ id: number; name: string } | null>(null)

function openDelete(row: Record<string, any>) {
  deleteTarget.value = { id: row.id, name: row.name }
  deleteOpen.value = true
}

async function handleDeleteConfirm() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    const res = await deleteCategoryApi(deleteTarget.value.id)
    if (!res?.success) throw new Error(res?.message)
    await fetchCategories()
    deleteOpen.value = false
  } catch (error: any) {
    console.error('خطا در حذف دسته‌بندی:', error)
    alert(error?.message || 'خطا در حذف دسته‌بندی')
  } finally {
    deleteLoading.value = false
    deleteTarget.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">مدیریت دسته‌بندی‌ها</h1>
          <p class="text-xs text-gray-400 mt-1">دسته‌بندی‌های خدمات پلتفرم</p>
        </div>

        <button
          class="h-10 px-4 rounded-xl text-sm font-bold bg-[#008f55] hover:bg-[#007a48] text-white transition-colors"
          @click="openCreate"
        >
          + دسته‌بندی جدید
        </button>
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ دسته‌بندی‌ای یافت نشد"
      >
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              @click="openEdit(row)"
            >
              ویرایش
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              @click="openDelete(row)"
            >
              حذف
            </button>
          </div>
        </template>
      </AdminTable>
    </div>

    <CategoryFormModal
      v-model="formOpen"
      :mode="formMode"
      :initial="
        editingCategory
          ? {
              id: editingCategory.id,
              name: editingCategory.name,
              slug: editingCategory.slug,
              description: editingCategory.description,
              parentId: editingCategory.parentId,
            }
          : undefined
      "
      :categories="parentOptions"
      :loading="formLoading"
      :error-message="formError"
      @submit="handleFormSubmit"
    />

    <ConfirmModal
      v-model="deleteOpen"
      title="حذف دسته‌بندی"
      :message="`آیا از حذف «${deleteTarget?.name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`"
      confirm-text="حذف کن"
      variant="danger"
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
