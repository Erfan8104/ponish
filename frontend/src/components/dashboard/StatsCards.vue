<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'
import { computed } from 'vue'

const projectStore = useProjectStore()

const stats = computed(() => [
  {
    label: 'کل پروژه‌ها',
    value: projectStore.dashboardStats.totalProjects,
    icon: '📊',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-600',
  },
  {
    label: 'پروژه‌های فعال',
    value: projectStore.dashboardStats.activeProjects,
    icon: '🚀',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-600',
  },
  {
    label: 'تکمیل‌شده',
    value: projectStore.dashboardStats.completedProjects,
    icon: '✅',
    color: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-600',
  },
  {
    label: 'کل مساحت (هکتار)',
    value: projectStore.dashboardStats.totalArea.toFixed(2),
    icon: '📍',
    color: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-600',
  },
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      :class="`${stat.color} border border-white/40 rounded-[26px] p-6 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md`"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            {{ stat.label }}
          </p>
          <p :class="`${stat.textColor} mt-4 text-3xl font-semibold`">{{ stat.value }}</p>
        </div>
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-sm"
        >
          {{ stat.icon }}
        </div>
      </div>
    </div>
  </div>
</template>
