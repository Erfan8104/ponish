<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllContractsApi } from '@/services/admin.service'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'
import { useRouter } from 'vue-router'

const contracts = ref<any[]>([])
const loading = ref(true)
const router = useRouter()

async function fetchContracts() {
  loading.value = true
  try {
    const data = await getAllContractsApi()
    if (data?.success) {
      contracts.value = data.contracts || []
    }
  } catch (error) {
    console.error('خطا در دریافت قراردادها:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchContracts)

function formatMoney(n: any) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('fa-IR') + ' تومان'
}

function goToDetail(row: Record<string, any>) {
  router.push(`/admin/contracts/${row.id}`)
}

const columns: TableColumn[] = [
  { key: 'employer', label: 'کارفرما' },
  { key: 'freelancer', label: 'فریلنسر' },
  { key: 'project', label: 'پروژه' },
  { key: 'amount', label: 'مبلغ کل' },
  { key: 'status', label: 'وضعیت', align: 'center' },
  { key: 'startedAt', label: 'تاریخ شروع', align: 'center' },
]

const rows = computed(() =>
  contracts.value.map((c) => ({
    id: c.id,
    employer: c.employer?.name || c.employer?.phone || '—',
    freelancer: c.freelancer?.name || c.freelancer?.phone || '—',
    project: c.project?.title || 'بدون عنوان',
    amount: formatMoney(c.totalAmount),
    status: c.status,
    startedAt: c.startedAt ? new Date(c.startedAt).toLocaleDateString('fa-IR') : '—',
  })),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت قراردادها</h1>
        <p class="text-xs text-gray-400 mt-1">فهرست تمام قراردادهای منعقدشده در پلتفرم</p>
      </div>
      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="هیچ قراردادی یافت نشد"
        @row-click="goToDetail"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
      </AdminTable>
    </div>
  </div>
</template>
