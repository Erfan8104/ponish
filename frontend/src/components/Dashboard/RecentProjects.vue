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
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">پروژه‌های اخیر</h2>
      <button
        @click="router.push({ name: 'projects' })"
        class="text-[#008f55] hover:text-[#00b878] font-semibold text-sm transition-colors"
      >
        مشاهده همه →
      </button>
    </div>

    <div v-if="recentProjects.length === 0" class="py-12 text-center">
      <p class="text-gray-500 text-lg mb-4">هیچ پروژه‌ای ایجاد نشده است</p>
      <button
        @click="router.push({ name: 'new-project' })"
        class="text-[#008f55] hover:text-[#00b878] font-semibold transition-colors"
      >
        ایجاد پروژه اول →
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in recentProjects"
        :key="project.id"
        class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        @click="handleViewProject(project.id)"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-gray-800">{{ project.title }}</h3>
            <span
              class="text-xs px-2 py-1 rounded-full"
              :class="getStatusBadge(project.status).color"
            >
              {{ getStatusBadge(project.status).text }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span>{{ getCategoryDisplay(project.category) }}</span>
            <span>📍 {{ project.province }}, {{ project.city }}</span>
            <span>📏 {{ project.calculatedArea }} هکتار</span>
          </div>
        </div>
        <div class="text-right text-xs text-gray-500">
          {{ new Date(project.createdAt).toLocaleDateString('fa-IR') }}
        </div>
      </div>
    </div>
  </div>
</template>
