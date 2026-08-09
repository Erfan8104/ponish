<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getAllSkillsApi,
  createSkillApi,
  updateSkillApi,
  deleteSkillApi,
  mergeSkillsApi,
} from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import SkillFormModal from '@/components/admin/ui/SkillFormModal.vue'
import MergeSkillsModal from '@/components/admin/ui/MergeSkillsModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'
import type { MergeCandidate } from '@/components/admin/ui/MergeSkillsModal.vue'

const skills = ref<any[]>([])
const loading = ref(true)
const selectedIds = ref<Set<number>>(new Set())

async function fetchSkills() {
  loading.value = true
  try {
    const data = await getAllSkillsApi()
    if (data?.success) {
      skills.value = data.skills || []
    }
  } catch (error) {
    console.error('خطا در دریافت مهارت‌ها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSkills)

const columns: TableColumn[] = [
  { key: 'select', label: '', width: '40px' },
  { key: 'name', label: 'نام' },
  { key: 'slug', label: 'اسلاگ', align: 'center' },
  { key: 'freelancersCount', label: 'فریلنسرها', align: 'center' },
  { key: 'projectsCount', label: 'پروژه‌ها', align: 'center' },
  { key: 'actions', label: 'اکشن‌ها', align: 'center' },
]

const rows = computed(() =>
  skills.value.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    freelancersCount: s._count?.freelancers ?? 0,
    projectsCount: s._count?.projects ?? 0,
  })),
)

function toggleSelect(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

const selectedCount = computed(() => selectedIds.value.size)

// ---------- Create / Edit Modal ----------
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formLoading = ref(false)
const formError = ref<string | null>(null)
const editingSkill = ref<any>(null)

function openCreate() {
  formMode.value = 'create'
  editingSkill.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(row: Record<string, any>) {
  const full = skills.value.find((s) => s.id === row.id)
  if (!full) return
  formMode.value = 'edit'
  editingSkill.value = full
  formError.value = null
  formOpen.value = true
}

async function handleFormSubmit(payload: { name: string; slug: string }) {
  formLoading.value = true
  formError.value = null
  try {
    let res
    if (formMode.value === 'create') {
      res = await createSkillApi(payload)
    } else {
      res = await updateSkillApi(editingSkill.value.id, payload)
    }

    if (!res?.success) {
      formError.value = res?.message || 'خطا در ذخیره‌سازی'
      return
    }

    await fetchSkills()
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
    const res = await deleteSkillApi(deleteTarget.value.id)
    if (!res?.success) throw new Error(res?.message)
    await fetchSkills()
    deleteOpen.value = false
  } catch (error: any) {
    console.error('خطا در حذف مهارت:', error)
    alert(error?.message || 'خطا در حذف مهارت')
  } finally {
    deleteLoading.value = false
    deleteTarget.value = null
  }
}

// ---------- Merge Modal ----------
const mergeOpen = ref(false)
const mergeLoading = ref(false)
const mergeError = ref<string | null>(null)

const mergeCandidates = computed<MergeCandidate[]>(() =>
  skills.value
    .filter((s) => selectedIds.value.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      freelancersCount: s._count?.freelancers ?? 0,
      projectsCount: s._count?.projects ?? 0,
    })),
)

function openMerge() {
  if (selectedCount.value < 2) return
  mergeError.value = null
  mergeOpen.value = true
}

async function handleMergeSubmit(payload: { sourceSkillIds: number[]; targetSkillId: number }) {
  mergeLoading.value = true
  mergeError.value = null
  try {
    const res = await mergeSkillsApi(payload)
    if (!res?.success) {
      mergeError.value = res?.message || 'خطا در ادغام مهارت‌ها'
      return
    }
    selectedIds.value = new Set()
    await fetchSkills()
    mergeOpen.value = false
  } catch (error: any) {
    mergeError.value = error?.response?.data?.message || error?.message || 'خطا در ادغام مهارت‌ها'
  } finally {
    mergeLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900">مدیریت مهارت‌ها</h1>
          <p class="text-xs text-gray-400 mt-1">مهارت‌های قابل انتخاب برای فریلنسرها و پروژه‌ها</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="selectedCount >= 2"
            class="h-10 px-4 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            @click="openMerge"
          >
            ادغام {{ selectedCount }} مهارت انتخاب‌شده
          </button>

          <button
            class="h-10 px-4 rounded-xl text-sm font-bold bg-[#008f55] hover:bg-[#007a48] text-white transition-colors"
            @click="openCreate"
          >
            + مهارت جدید
          </button>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ مهارتی یافت نشد"
      >
        <template #cell-select="{ row }">
          <input
            type="checkbox"
            class="accent-[#008f55] w-4 h-4 cursor-pointer"
            :checked="selectedIds.has(row.id)"
            @click.stop
            @change="toggleSelect(row.id)"
          />
        </template>

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

    <SkillFormModal
      v-model="formOpen"
      :mode="formMode"
      :initial="
        editingSkill
          ? { id: editingSkill.id, name: editingSkill.name, slug: editingSkill.slug }
          : undefined
      "
      :loading="formLoading"
      :error-message="formError"
      @submit="handleFormSubmit"
    />

    <ConfirmModal
      v-model="deleteOpen"
      title="حذف مهارت"
      :message="`آیا از حذف «${deleteTarget?.name}» مطمئن هستید؟ این مهارت از تمام فریلنسرها و پروژه‌های مرتبط هم حذف خواهد شد.`"
      confirm-text="حذف کن"
      variant="danger"
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
    />

    <MergeSkillsModal
      v-model="mergeOpen"
      :skills="mergeCandidates"
      :loading="mergeLoading"
      :error-message="mergeError"
      @submit="handleMergeSubmit"
    />
  </div>
</template>
