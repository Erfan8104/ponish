<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAnalyticsApi } from '@/services/admin.service'
import AdminStatCard from '@/components/admin/ui/AdminStatCard.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import AnalyticsChart from '@/components/admin/ui/AnalyticsChart.vue'

type RangeKey = '7d' | '30d' | '90d' | '365d'

const range = ref<RangeKey>('30d')
const loading = ref(true)
const analytics = ref<any>(null)

const rangeOptions: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '۷ روز' },
  { key: '30d', label: '۳۰ روز' },
  { key: '90d', label: '۹۰ روز' },
  { key: '365d', label: 'یک سال' },
]

async function fetchAnalytics() {
  loading.value = true
  try {
    const data = await getAnalyticsApi(range.value)
    if (data?.success) {
      analytics.value = data
    }
  } catch (error) {
    console.error('خطا در دریافت آنالیتیکس:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnalytics)
watch(range, fetchAnalytics)

function formatMoney(n: number) {
  return n.toLocaleString('fa-IR') + ' تومان'
}

function formatCount(n: number) {
  return n.toLocaleString('fa-IR')
}

const summary = computed(() => analytics.value?.summary)
const charts = computed(() => analytics.value?.charts)

const contractStatusBreakdown = computed(() => {
  const raw = analytics.value?.contractStatusBreakdown || []
  const total = raw.reduce((sum: number, s: any) => sum + s.count, 0) || 1
  return raw.map((s: any) => ({
    status: s.status,
    count: s.count,
    percent: Math.round((s.count / total) * 100),
  }))
})

function trendLabelFor(key: RangeKey) {
  switch (key) {
    case '7d':
      return 'نسبت به ۷ روز قبل'
    case '30d':
      return 'نسبت به ۳۰ روز قبل'
    case '90d':
      return 'نسبت به ۹۰ روز قبل'
    case '365d':
      return 'نسبت به سال قبل'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900">آنالیتیکس</h1>
          <p class="text-xs text-gray-400 mt-1">روند رشد پلتفرم در طول زمان</p>
        </div>

        <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          <button
            v-for="opt in rangeOptions"
            :key="opt.key"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="
              range === opt.key ? 'bg-[#008f55] text-white' : 'text-gray-500 hover:bg-gray-50'
            "
            @click="range = opt.key"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center gap-2 text-gray-400 py-16">
        <div
          class="w-6 h-6 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
        <span class="text-xs">در حال بارگذاری...</span>
      </div>

      <template v-else-if="analytics">
        <!-- کارت‌های خلاصه -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="ثبت‌نام‌های جدید"
            :value="formatCount(summary.registrations.total)"
            :trend="summary.registrations.growth"
            :trend-label="trendLabelFor(range)"
            color="blue"
          >
            <template #icon>👥</template>
          </AdminStatCard>

          <AdminStatCard
            title="درآمد"
            :value="formatMoney(summary.revenue.total)"
            :trend="summary.revenue.growth"
            :trend-label="trendLabelFor(range)"
            color="green"
          >
            <template #icon>💰</template>
          </AdminStatCard>

          <AdminStatCard
            title="پروژه‌های جدید"
            :value="formatCount(summary.projects.total)"
            :trend="summary.projects.growth"
            :trend-label="trendLabelFor(range)"
            color="amber"
          >
            <template #icon>📁</template>
          </AdminStatCard>

          <AdminStatCard
            title="قراردادهای جدید"
            :value="formatCount(summary.contracts.total)"
            :trend="summary.contracts.growth"
            :trend-label="trendLabelFor(range)"
            color="purple"
          >
            <template #icon>📄</template>
          </AdminStatCard>
        </div>

        <!-- نمودارها -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnalyticsChart
            title="ثبت‌نام"
            :data="charts.registrations"
            color="#3b82f6"
            :format-value="formatCount"
          />
          <AnalyticsChart
            title="درآمد"
            :data="charts.revenue"
            color="#008f55"
            :format-value="formatMoney"
          />
          <AnalyticsChart
            title="پروژه‌ها"
            :data="charts.projects"
            color="#f59e0b"
            :format-value="formatCount"
          />
          <AnalyticsChart
            title="قراردادها"
            :data="charts.contracts"
            color="#a855f7"
            :format-value="formatCount"
          />
        </div>

        <!-- تفکیک وضعیت قراردادها -->
        <div class="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 class="text-sm font-bold text-gray-900 mb-4">تفکیک وضعیت قراردادهای این بازه</h3>

          <div
            v-if="!contractStatusBreakdown.length"
            class="text-xs text-gray-400 text-center py-8"
          >
            قراردادی در این بازه ثبت نشده است
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="s in contractStatusBreakdown"
              :key="s.status"
              class="flex items-center gap-3"
            >
              <div class="w-24 flex-shrink-0">
                <StatusBadge :status="s.status" />
              </div>
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#008f55] rounded-full transition-all"
                  :style="{ width: `${s.percent}%` }"
                />
              </div>
              <span class="text-xs text-gray-500 w-20 text-left">
                {{ s.count }} ({{ s.percent }}٪)
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
