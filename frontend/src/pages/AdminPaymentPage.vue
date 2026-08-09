<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPaymentsApi } from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import AdminFilter from '@/components/admin/ui/AdminFilter.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'
import type { FilterOption } from '@/components/admin/ui/AdminFilter.vue'

const router = useRouter()

const payments = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref<string | null>(null)

async function fetchPayments() {
  loading.value = true
  try {
    const data = await getAllPaymentsApi({
      status: statusFilter.value || undefined,
    })
    if (data?.success) {
      payments.value = data.payments || []
    }
  } catch (error) {
    console.error('خطا در دریافت پرداخت‌ها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPayments)
watch(statusFilter, fetchPayments)

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

const statusOptions: FilterOption[] = [
  { label: 'در انتظار', value: 'pending' },
  { label: 'پرداخت‌شده', value: 'paid' },
  { label: 'بازگشت‌شده', value: 'refunded' },
  { label: 'ناموفق', value: 'failed' },
]

const columns: TableColumn[] = [
  { key: 'contract', label: 'قرارداد' },
  { key: 'amount', label: 'مبلغ' },
  { key: 'gateway', label: 'درگاه', align: 'center' },
  { key: 'trackingCode', label: 'کد پیگیری', align: 'center' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'paidAt', label: 'تاریخ پرداخت', align: 'center' },
]

const rows = computed(() =>
  payments.value.map((p) => ({
    id: p.id,
    contractId: p.contract?.id ?? p.contractId,
    contract: p.contract?.project?.title || `قرارداد #${p.contract?.id ?? p.contractId}`,
    employer: p.contract?.employer?.name || p.contract?.employer?.phone || '—',
    freelancer: p.contract?.freelancer?.name || p.contract?.freelancer?.phone || '—',
    amount: formatMoney(p.amount),
    gateway: p.gateway || '—',
    trackingCode: p.trackingCode || '—',
    status: p.status,
    paidAt: p.paidAt ? formatDate(p.paidAt) : '—',
  })),
)

function goToContract(row: Record<string, any>) {
  if (!row.contractId) return
  router.push(`/admin/contracts/${row.contractId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت پرداخت‌ها</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام تراکنش‌های پرداخت در پلتفرم</p>
      </div>

      <div class="flex items-center gap-3">
        <AdminFilter
          v-model="statusFilter"
          :options="statusOptions"
          label="وضعیت"
          placeholder="همه وضعیت‌ها"
        />
      </div>

      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ پرداختی یافت نشد"
        @row-click="goToContract"
      >
        <template #cell-contract="{ row }">
          <div>
            <p class="text-sm font-medium text-gray-700">{{ row.contract }}</p>
            <p class="text-[11px] text-gray-400">{{ row.employer }} ← {{ row.freelancer }}</p>
          </div>
        </template>

        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
      </AdminTable>
    </div>
  </div>
</template>
