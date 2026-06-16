<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const projectStore = useProjectStore()
const router = useRouter()

const recentProjects = computed(() => projectStore.getRecentProjects(5))

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: 'در انتظار', color: 'bg-yellow-100 text-yellow-800' },
    active: { text: 'فعال', color: 'bg-green-100 text-green-800' },
    completed: { text: 'تکمیل‌شده', color: 'bg-blue-100 text-blue-800' },
    cancelled: { text: 'لغو‌شده', color: 'bg-red-100 text-red-800' },
  }
  return statusMap[status] || { text: 'نامشخص', color: 'bg-gray-100 text-gray-800' }
}

const getCategoryDisplay = (category: string) => {
  const categoryMap: Record<string, string> = {
    uav: '🚁 پهپاد',
    gis: '🗺️ GIS',
    cadastral: '📐 قنوات',
    unknown: '❓ نامشخص',
  }
  return categoryMap[category] || category
}

const handleViewProject = (projectId: number) => {
  router.push({ name: 'project-detail', params: { id: projectId } })
}
</script>

<template>
  <div class="bg-white rounded-[28px] p-6 shadow-sm shadow-slate-200/60 w-full overflow-hidden">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">پروژه‌های اخیر</h2>
        <p class="text-sm text-slate-500">آخرین پروژه‌هایی که به سیستم اضافه کرده‌اید</p>
      </div>
      <button
        @click="router.push({ name: 'projects' })"
        class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
      >
        مشاهده همه →
      </button>
    </div>

    <div
      v-if="recentProjects.length === 0"
      class="rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center"
    >
      <p class="text-slate-500 text-lg mb-4">هیچ پروژه‌ای ایجاد نشده است</p>
      <button
        @click="router.push({ name: 'new-project' })"
        class="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
      >
        ایجاد پروژه اول →
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in recentProjects"
        :key="project.id"
        @click="handleViewProject(project.id)"
        class="group flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition duration-200 hover:border-cyan-300 hover:bg-white hover:shadow-lg w-full overflow-hidden"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h3 class="truncate text-lg font-semibold text-slate-900">{{ project.title }}</h3>
            <div class="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
              <span>{{ getCategoryDisplay(project.category) }}</span>
              <span>📍 {{ project.province }}, {{ project.city }}</span>
              <span>📏 {{ project.calculatedArea }} هکتار</span>
            </div>
          </div>
          <span
            class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
            :class="getStatusBadge(project.status).color"
          >
            {{ getStatusBadge(project.status).text }}
          </span>
        </div>
        <div class="text-sm text-slate-500">
          {{ new Date(project.createdAt).toLocaleDateString('fa-IR') }}
        </div>
      </div>
    </div>
  </div>
</template>
