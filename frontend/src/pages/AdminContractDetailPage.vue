<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getContractDetailApi,
  cancelContractApi,
  completeContractApi,
  resolveContractDisputeApi,
} from '@/services/admin.service'
import AdminCard from '@/components/admin/ui/AdminCard.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const route = useRoute()
const router = useRouter()
const contractId = Number(route.params.id)

const contract = ref<any>(null)
const loading = ref(true)
const actionLoading = ref(false)

async function fetchContract() {
  loading.value = true
  try {
    const data = await getContractDetailApi(contractId)
    if (data?.success) {
      contract.value = data.contract
    }
  } catch (error) {
    console.error('خطا در دریافت جزئیات قرارداد:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchContract)

function formatMoney(n: any) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('fa-IR') + ' تومان'
}

function formatDate(d: any) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(d: any) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fa-IR')
}

// ---------- Tabs ----------
type TabKey = 'milestones' | 'payments' | 'messages' | 'reviews' | 'amendments'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'milestones', label: 'مایلستون‌ها' },
  { key: 'payments', label: 'پرداخت‌ها' },
  { key: 'messages', label: 'پیام‌ها' },
  { key: 'reviews', label: 'نظرات' },
  { key: 'amendments', label: 'اصلاحیه‌ها' },
]

const activeTab = ref<TabKey>('milestones')

const milestoneColumns: TableColumn[] = [
  { key: 'title', label: 'عنوان' },
  { key: 'amount', label: 'مبلغ' },
  { key: 'dueDate', label: 'مهلت', align: 'center' },
  { key: 'status', label: 'وضعیت', align: 'center' },
]

const milestoneRows = computed(() =>
  (contract.value?.milestones || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    amount: formatMoney(m.amount),
    dueDate: m.dueDate ? formatDate(m.dueDate) : '—',
    status: m.status,
  })),
)

const paymentColumns: TableColumn[] = [
  { key: 'amount', label: 'مبلغ' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'gateway', label: 'درگاه', align: 'center' },
  { key: 'trackingCode', label: 'کد پیگیری', align: 'center' },
  { key: 'paidAt', label: 'تاریخ پرداخت', align: 'center' },
]

const paymentRows = computed(() =>
  (contract.value?.payments || []).map((p: any) => ({
    id: p.id,
    amount: formatMoney(p.amount),
    status: p.status,
    gateway: p.gateway || '—',
    trackingCode: p.trackingCode || '—',
    paidAt: p.paidAt ? formatDate(p.paidAt) : '—',
  })),
)

const amendmentColumns: TableColumn[] = [
  { key: 'proposedArea', label: 'مساحت پیشنهادی', align: 'center' },
  { key: 'proposedLength', label: 'طول پیشنهادی', align: 'center' },
  { key: 'proposedAmount', label: 'مبلغ پیشنهادی' },
  { key: 'proposedDelivery', label: 'زمان تحویل (روز)', align: 'center' },
  { key: 'status', label: 'وضعیت', align: 'center' },
]

const amendmentRows = computed(() =>
  (contract.value?.amendments || []).map((a: any) => ({
    id: a.id,
    proposedArea: a.proposed_area ?? '—',
    proposedLength: a.proposed_length ?? '—',
    proposedAmount: a.proposed_amount ? formatMoney(a.proposed_amount) : '—',
    proposedDelivery: a.proposed_delivery_time ?? '—',
    status: a.status,
    notes: a.notes,
  })),
)

const reviews = computed(() => contract.value?.reviews || [])
const messages = computed(() => contract.value?.messages || [])

// ---------- Confirm Modal State ----------
const confirmOpen = ref(false)

type ActionType =
  | 'cancel'
  | 'complete'
  | 'resolve-active'
  | 'resolve-completed'
  | 'resolve-cancelled'
const pendingAction = reactive<{ type: ActionType | null }>({ type: null })

const confirmConfig = computed(() => {
  switch (pendingAction.type) {
    case 'cancel':
      return {
        title: 'لغو قرارداد',
        message: 'این قرارداد لغو می‌شود و پروژه‌ی مرتبط هم بسته خواهد شد. مطمئن هستید؟',
        confirmText: 'لغو کن',
        variant: 'danger' as const,
      }
    case 'complete':
      return {
        title: 'تکمیل قرارداد',
        message: 'این قرارداد به‌عنوان تکمیل‌شده علامت‌گذاری می‌شود. مطمئن هستید؟',
        confirmText: 'تکمیل کن',
        variant: 'primary' as const,
      }
    case 'resolve-active':
      return {
        title: 'بازگشت به حالت فعال',
        message: 'اختلاف رفع می‌شود و قرارداد به روال عادی (فعال) بازمی‌گردد. مطمئن هستید؟',
        confirmText: 'بازگشت به فعال',
        variant: 'primary' as const,
      }
    case 'resolve-completed':
      return {
        title: 'رفع اختلاف — تکمیل',
        message: 'اختلاف به نفع تکمیل قرارداد رفع می‌شود. مطمئن هستید؟',
        confirmText: 'تکمیل کن',
        variant: 'primary' as const,
      }
    case 'resolve-cancelled':
      return {
        title: 'رفع اختلاف — لغو',
        message: 'اختلاف به نفع لغو قرارداد رفع می‌شود. مطمئن هستید؟',
        confirmText: 'لغو کن',
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

function openConfirm(type: ActionType) {
  pendingAction.type = type
  confirmOpen.value = true
}

async function handleConfirm() {
  if (!pendingAction.type) return

  actionLoading.value = true
  try {
    let res
    if (pendingAction.type === 'cancel') {
      res = await cancelContractApi(contractId)
    } else if (pendingAction.type === 'complete') {
      res = await completeContractApi(contractId)
    } else if (pendingAction.type === 'resolve-active') {
      res = await resolveContractDisputeApi(contractId, 'active')
    } else if (pendingAction.type === 'resolve-completed') {
      res = await resolveContractDisputeApi(contractId, 'completed')
    } else if (pendingAction.type === 'resolve-cancelled') {
      res = await resolveContractDisputeApi(contractId, 'cancelled')
    }

    if (!res?.success) throw new Error(res?.message)

    await fetchContract()
    confirmOpen.value = false
  } catch (error: any) {
    console.error('خطا در انجام عملیات:', error)
    alert(error?.message || 'خطا در انجام عملیات')
  } finally {
    actionLoading.value = false
    pendingAction.type = null
  }
}

function handleCancel() {
  pendingAction.type = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- بازگشت -->
      <button
        class="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        @click="router.push('/admin/contracts')"
      >
        ← بازگشت به لیست قراردادها
      </button>

      <div v-if="loading" class="flex flex-col items-center gap-2 text-gray-400 py-16">
        <div
          class="w-6 h-6 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
        <span class="text-xs">در حال بارگذاری...</span>
      </div>

      <template v-else-if="contract">
        <!-- هدر قرارداد -->
        <AdminCard>
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <h1 class="text-lg font-bold text-gray-900">
                  {{ contract.project?.title || 'بدون عنوان' }}
                </h1>
                <StatusBadge :status="contract.status" size="md" />
              </div>
              <p class="text-xs text-gray-400">قرارداد شماره #{{ contract.id }}</p>
            </div>

            <div class="text-left">
              <p class="text-[11px] text-gray-400 mb-1">مبلغ کل قرارداد</p>
              <p class="text-xl font-black text-gray-900">
                {{ formatMoney(contract.totalAmount) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div>
              <p class="text-[11px] text-gray-400 mb-1">کارفرما</p>
              <p class="text-sm font-medium text-gray-700">
                {{ contract.employer?.name || contract.employer?.phone }}
              </p>
              <p class="text-xs text-gray-400">{{ contract.employer?.phone }}</p>
            </div>
            <div>
              <p class="text-[11px] text-gray-400 mb-1">فریلنسر</p>
              <p class="text-sm font-medium text-gray-700">
                {{ contract.freelancer?.name || contract.freelancer?.phone }}
              </p>
              <p class="text-xs text-gray-400">{{ contract.freelancer?.phone }}</p>
            </div>
            <div>
              <p class="text-[11px] text-gray-400 mb-1">تاریخ شروع</p>
              <p class="text-sm text-gray-700">{{ formatDate(contract.startedAt) }}</p>
            </div>
            <div>
              <p class="text-[11px] text-gray-400 mb-1">تاریخ پایان/لغو</p>
              <p class="text-sm text-gray-700">
                {{ formatDate(contract.completedAt || contract.cancelledAt) }}
              </p>
            </div>
          </div>

          <!-- اکشن‌ها -->
          <div
            v-if="contract.status === 'active' || contract.status === 'disputed'"
            class="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-50"
          >
            <template v-if="contract.status === 'active'">
              <button
                class="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                @click="openConfirm('complete')"
              >
                تکمیل قرارداد
              </button>
              <button
                class="px-4 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                @click="openConfirm('cancel')"
              >
                لغو قرارداد
              </button>
            </template>

            <template v-else-if="contract.status === 'disputed'">
              <span class="text-xs text-gray-400 ml-1">رفع اختلاف:</span>
              <button
                class="px-4 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                @click="openConfirm('resolve-active')"
              >
                بازگشت به فعال
              </button>
              <button
                class="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                @click="openConfirm('resolve-completed')"
              >
                تکمیل قرارداد
              </button>
              <button
                class="px-4 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                @click="openConfirm('resolve-cancelled')"
              >
                لغو قرارداد
              </button>
            </template>
          </div>
        </AdminCard>

        <!-- تب‌ها -->
        <div class="flex items-center gap-1 border-b border-gray-100 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors"
            :class="
              activeTab === tab.key
                ? 'border-[#008f55] text-[#008f55]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- محتوای تب‌ها -->
        <div v-if="activeTab === 'milestones'">
          <AdminTable
            :columns="milestoneColumns"
            :rows="milestoneRows"
            empty-text="هیچ مایلستونی ثبت نشده است"
          >
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </AdminTable>
        </div>

        <div v-else-if="activeTab === 'payments'">
          <AdminTable
            :columns="paymentColumns"
            :rows="paymentRows"
            empty-text="هیچ پرداختی ثبت نشده است"
          >
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </AdminTable>
        </div>

        <div v-else-if="activeTab === 'messages'">
          <AdminCard v-if="!messages.length">
            <p class="text-xs text-gray-400 text-center py-8">پیامی ثبت نشده است</p>
          </AdminCard>
          <div v-else class="space-y-2">
            <AdminCard v-for="m in messages" :key="m.id" :padding="false">
              <div class="p-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[11px] text-gray-400">
                    از کاربر #{{ m.senderId }} به کاربر #{{ m.receiverId }}
                  </span>
                  <span class="text-[11px] text-gray-300">{{ formatDateTime(m.createdAt) }}</span>
                </div>
                <p v-if="m.type === 'text'" class="text-sm text-gray-700">{{ m.content }}</p>
                <a
                  v-else-if="m.type === 'file'"
                  :href="m.fileUrl"
                  target="_blank"
                  class="text-sm text-blue-600 underline"
                >
                  فایل پیوست
                </a>
                <p v-else class="text-xs text-gray-400 italic">پیام سیستمی</p>
              </div>
            </AdminCard>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'">
          <AdminCard v-if="!reviews.length">
            <p class="text-xs text-gray-400 text-center py-8">نظری ثبت نشده است</p>
          </AdminCard>
          <div v-else class="space-y-2">
            <AdminCard v-for="r in reviews" :key="r.id">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="text-sm font-medium text-gray-700">
                    {{ r.reviewer?.name }} → {{ r.reviewed?.name }}
                  </p>
                  <p class="text-[11px] text-gray-400">
                    هدف: {{ r.target === 'employer' ? 'کارفرما' : 'فریلنسر' }}
                  </p>
                </div>
                <span class="text-sm font-bold text-amber-500">{{ r.rating }} / ۵</span>
              </div>
              <p v-if="r.comment" class="text-xs text-gray-600 leading-relaxed">
                {{ r.comment }}
              </p>
            </AdminCard>
          </div>
        </div>

        <div v-else-if="activeTab === 'amendments'">
          <AdminTable
            :columns="amendmentColumns"
            :rows="amendmentRows"
            empty-text="اصلاحیه‌ای ثبت نشده است"
          >
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </AdminTable>
        </div>
      </template>

      <AdminCard v-else>
        <p class="text-xs text-gray-400 text-center py-8">قرارداد یافت نشد</p>
      </AdminCard>
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
