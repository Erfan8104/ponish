<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  getAllProposalsApi,
  acceptProposalApi,
  rejectProposalApi,
  deleteProposalApi,
} from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const proposals = ref<any[]>([])
const loading = ref(true)

async function fetchProposals() {
  loading.value = true
  try {
    const data = await getAllProposalsApi()
    if (data?.success) {
      proposals.value = data.proposals || []
    }
  } catch (error) {
    console.error('خطا در دریافت پیشنهادها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProposals)

function formatMoney(n: any) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('fa-IR') + ' تومان'
}

const columns: TableColumn[] = [
  { key: 'freelancer', label: 'فریلنسر' },
  { key: 'project', label: 'پروژه' },
  { key: 'amount', label: 'مبلغ' },
  { key: 'deliveryDays', label: 'زمان تحویل', align: 'center' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'actions', label: 'اکشن‌ها', align: 'center' },
]

const rows = computed(() =>
  proposals.value.map((p) => ({
    id: p.id,
    freelancer: p.freelancer?.name || p.freelancer?.phone || '—',
    project: p.project?.title || 'بدون عنوان',
    amount: formatMoney(p.amount),
    deliveryDays: p.deliveryDays ? `${p.deliveryDays} روز` : '—',
    status: p.status,
    rawStatus: p.status,
  })),
)

// ---------- Confirm Modal State ----------
const actionLoading = ref(false)
const confirmOpen = ref(false)

type ActionType = 'accept' | 'reject' | 'delete'
const pendingAction = reactive<{ type: ActionType | null; id: number | null }>({
  type: null,
  id: null,
})

const confirmConfig = computed(() => {
  switch (pendingAction.type) {
    case 'accept':
      return {
        title: 'تایید پیشنهاد',
        message:
          'با تایید این پیشنهاد، قرارداد ساخته می‌شود و سایر پیشنهادهای در انتظارِ همین پروژه رد خواهند شد. ادامه می‌دهید؟',
        confirmText: 'تایید پیشنهاد',
        variant: 'primary' as const,
      }
    case 'reject':
      return {
        title: 'رد پیشنهاد',
        message: 'این پیشنهاد رد می‌شود. مطمئن هستید؟',
        confirmText: 'رد کن',
        variant: 'warning' as const,
      }
    case 'delete':
      return {
        title: 'حذف پیشنهاد',
        message: 'این پیشنهاد برای همیشه حذف می‌شود و قابل بازگشت نیست. مطمئن هستید؟',
        confirmText: 'حذف کن',
        variant: 'danger' as const,
      }
    default:
      return {
        title: 'تأیید',
        message: 'آیا از انجام این عملیات مطمئن هستید؟',
        confirmText: 'تأیید',
        variant: 'primary' as const,
      }
  }
})

function openConfirm(type: ActionType, id: number) {
  pendingAction.type = type
  pendingAction.id = id
  confirmOpen.value = true
}

async function handleConfirm() {
  if (!pendingAction.id || !pendingAction.type) return

  actionLoading.value = true
  try {
    let res
    if (pendingAction.type === 'accept') res = await acceptProposalApi(pendingAction.id)
    else if (pendingAction.type === 'reject') res = await rejectProposalApi(pendingAction.id)
    else res = await deleteProposalApi(pendingAction.id)

    if (!res?.success) throw new Error(res?.message)

    await fetchProposals()
    confirmOpen.value = false
  } catch (error: any) {
    console.error('خطا در انجام عملیات:', error)
    alert(error?.message || 'خطا در انجام عملیات')
  } finally {
    actionLoading.value = false
    pendingAction.type = null
    pendingAction.id = null
  }
}

function handleCancel() {
  pendingAction.type = null
  pendingAction.id = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت پیشنهادها</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام پیشنهادهای ثبت‌شده در پلتفرم</p>
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ پیشنهادی یافت نشد"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-2">
            <template v-if="row.rawStatus === 'pending'">
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                @click="openConfirm('accept', row.id)"
              >
                تایید
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                @click="openConfirm('reject', row.id)"
              >
                رد
              </button>
            </template>

            <button
              v-if="row.rawStatus !== 'accepted'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              @click="openConfirm('delete', row.id)"
            >
              حذف
            </button>

            <span v-if="row.rawStatus === 'accepted'" class="text-xs text-gray-400">
              دارای قرارداد
            </span>
          </div>
        </template>
      </AdminTable>
    </div>

    <ConfirmModal
      v-model="confirmOpen"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :confirm-text="confirmConfig.confirmText"
      :variant="confirmConfig.variant"
      :loading="actionLoading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>
