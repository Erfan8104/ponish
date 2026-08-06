<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import AdminStatCard from '@/components/admin/ui/AdminStatCard.vue'
import AdminCard from '@/components/admin/ui/AdminCard.vue'
import AdminTable from '@/components/admin/ui/AdminTable.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import type { TableColumn } from '@/components/admin/ui/AdminTable.vue'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchDashboardStats()
})

const stats = computed(() => adminStore.stats)

function formatNumber(n: number | undefined) {
  if (n === undefined || n === null) return '—'
  return new Intl.NumberFormat('fa-IR').format(n)
}

function formatMoney(n: number | undefined) {
  if (n === undefined || n === null) return '—'
  return new Intl.NumberFormat('fa-IR').format(n) + ' تومان'
}

const roleLabel: Record<string, string> = {
  employer: 'کارفرما',
  freelancer: 'فریلنسر',
  both: 'هردو',
  admin: 'ادمین',
}

const userColumns: TableColumn[] = [
  { key: 'name', label: 'نام' },
  { key: 'phone', label: 'شماره' },
  { key: 'role', label: 'نقش' },
  { key: 'isActive', label: 'وضعیت', align: 'center' },
]

const projectColumns: TableColumn[] = [
  { key: 'title', label: 'عنوان' },
  { key: 'employer', label: 'کارفرما' },
  { key: 'location', label: 'محل' },
  { key: 'status', label: 'وضعیت', align: 'center' },
]

const latestUserRows = computed(() =>
  adminStore.latestUsers.map((u) => ({
    id: u.id,
    name: u.name || '—',
    phone: u.phone,
    role: roleLabel[u.role] || u.role,
    isActive: u.isActive,
  })),
)

const latestProjectRows = computed(() =>
  adminStore.latestProjects.map((p) => ({
    id: p.id,
    title: p.title || 'بدون عنوان',
    employer: p.employer?.name || p.employer?.phone || '—',
    location: [p.province, p.city].filter(Boolean).join('، ') || '—',
    status: p.status,
  })),
)

// برای نمودار ساده میله‌ای
function maxValue(points: { value: number }[]) {
  return Math.max(...points.map((p) => p.value), 1)
}
</script>

<template>
  <div class="space-y-6" style="direction: rtl">
    <!-- هدر -->
    <div>
      <h1 class="text-xl font-bold text-gray-900">داشبورد مدیریت</h1>
      <p class="text-xs text-gray-400 mt-1">خلاصه وضعیت کلی پلتفرم</p>
    </div>

    <!-- لودینگ -->
    <div v-if="adminStore.dashboardLoading && !stats" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- کارت‌های آماری -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminStatCard
          title="کل کاربران"
          :value="formatNumber(stats?.usersCount)"
          icon="👥"
          color="blue"
        />
        <AdminStatCard
          title="کل پروژه‌ها"
          :value="formatNumber(stats?.projectsCount)"
          icon="📋"
          color="purple"
        />
        <AdminStatCard
          title="پروژه‌های فعال"
          :value="formatNumber(stats?.activeProjects)"
          icon="⚡"
          color="green"
        />
        <AdminStatCard
          title="قراردادهای فعال"
          :value="formatNumber(stats?.activeContracts)"
          icon="📝"
          color="amber"
        />
        <AdminStatCard
          title="پرداخت امروز"
          :value="formatNumber(stats?.todayPayments)"
          icon="💳"
          color="green"
        />
        <AdminStatCard
          title="کاربران جدید امروز"
          :value="formatNumber(stats?.newUsersToday)"
          icon="✨"
          color="blue"
        />
      </div>

      <!-- ردیف دوم آمار -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="درآمد کل"
          :value="formatMoney(stats?.revenue)"
          icon="💰"
          color="green"
        />
        <AdminStatCard
          title="نظرات ثبت‌شده"
          :value="formatNumber(stats?.pendingReviews)"
          icon="⭐"
          color="amber"
        />
        <AdminStatCard
          title="گزارش‌های باز"
          :value="formatNumber(stats?.pendingReports)"
          icon="🚩"
          color="red"
        />
      </div>

      <!-- نمودارهای ساده -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- ثبت‌نام روزانه -->
        <AdminCard title="ثبت‌نام روزانه" subtitle="۷ روز اخیر">
          <div class="flex items-end gap-1.5 h-28 mt-2">
            <div
              v-for="point in adminStore.charts.dailyRegistrations"
              :key="point.date"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t-md bg-[#008f55]/80 min-h-[4px] transition-all"
                :style="{
                  height:
                    (point.value / maxValue(adminStore.charts.dailyRegistrations)) * 100 + '%',
                }"
              />
              <span class="text-[9px] text-gray-400 truncate w-full text-center">
                {{ point.label }}
              </span>
            </div>
          </div>
        </AdminCard>

        <!-- ثبت پروژه -->
        <AdminCard title="ثبت پروژه" subtitle="۷ روز اخیر">
          <div class="flex items-end gap-1.5 h-28 mt-2">
            <div
              v-for="point in adminStore.charts.dailyProjects"
              :key="point.date"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t-md bg-blue-500/80 min-h-[4px] transition-all"
                :style="{
                  height: (point.value / maxValue(adminStore.charts.dailyProjects)) * 100 + '%',
                }"
              />
              <span class="text-[9px] text-gray-400 truncate w-full text-center">
                {{ point.label }}
              </span>
            </div>
          </div>
        </AdminCard>

        <!-- پرداخت‌ها -->
        <AdminCard title="پرداخت‌ها" subtitle="۷ روز اخیر (مبلغ)">
          <div class="flex items-end gap-1.5 h-28 mt-2">
            <div
              v-for="point in adminStore.charts.dailyPayments"
              :key="point.date"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t-md bg-amber-500/80 min-h-[4px] transition-all"
                :style="{
                  height: (point.value / maxValue(adminStore.charts.dailyPayments)) * 100 + '%',
                }"
              />
              <span class="text-[9px] text-gray-400 truncate w-full text-center">
                {{ point.label }}
              </span>
            </div>
          </div>
        </AdminCard>
      </div>

      <!-- جداول -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <!-- آخرین کاربران -->
        <AdminCard title="آخرین کاربران" subtitle="۵ کاربر اخیر">
          <template #actions>
            <router-link
              to="/admin/users"
              class="text-xs font-semibold text-[#008f55] hover:underline"
            >
              مشاهده همه
            </router-link>
          </template>

          <AdminTable
            :columns="userColumns"
            :rows="latestUserRows"
            :loading="adminStore.dashboardLoading"
            empty-text="هنوز کاربری ثبت نشده"
          >
            <template #cell-isActive="{ value }">
              <StatusBadge :status="value ? 'active' : 'inactive'" />
            </template>
          </AdminTable>
        </AdminCard>

        <!-- آخرین پروژه‌ها -->
        <AdminCard title="آخرین پروژه‌ها" subtitle="۵ پروژه اخیر">
          <AdminTable
            :columns="projectColumns"
            :rows="latestProjectRows"
            :loading="adminStore.dashboardLoading"
            empty-text="هنوز پروژه‌ای ثبت نشده"
          >
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </AdminTable>
        </AdminCard>
      </div>
    </template>
  </div>
</template>
