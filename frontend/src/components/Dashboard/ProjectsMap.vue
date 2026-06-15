<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import L from 'leaflet'

const projectStore = useProjectStore()
const router = useRouter()
const mapContainer = ref<HTMLDivElement>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = ref<any>()

const activeProjects = computed(() => projectStore.getProjectsByStatus('active'))

onMounted(() => {
  if (!mapContainer.value) return

  // ایجاد نقشه
  map.value = L.map(mapContainer.value).setView([32.427, 53.688], 5)

  // اضافه‌کردن لایه نقشه
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)

  // اضافه‌کردن نقاط پروژه‌های فعال
  activeProjects.value.forEach((project) => {
    if (project.calculatedArea > 0) {
      const lat = 32.427 + Math.random() * 5
      const lng = 53.688 + Math.random() * 5

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#008f55',
        color: '#006639',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map.value)

      marker.bindPopup(`
        <div class="text-right">
          <h3 class="font-bold">${project.title}</h3>
          <p class="text-sm">${project.city}, ${project.province}</p>
          <p class="text-sm">${project.calculatedArea} هکتار</p>
        </div>
      `)
    }
  })

  map.value.invalidateSize()
})

const handleProjectClick = (projectId: number) => {
  router.push({ name: 'project-detail', params: { id: projectId } })
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">نقشه پروژه‌ها</h2>
      <span class="text-sm text-gray-500">{{ activeProjects.length }} پروژه فعال</span>
    </div>

    <div
      ref="mapContainer"
      class="w-full h-96 rounded-lg border border-gray-200 overflow-hidden"
    ></div>

    <div v-if="activeProjects.length > 0" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <button
        v-for="project in activeProjects.slice(0, 4)"
        :key="project.id"
        @click="handleProjectClick(project.id)"
        class="text-left p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <p class="font-semibold text-gray-800 text-sm truncate">{{ project.title }}</p>
        <p class="text-xs text-gray-600 mt-1">{{ project.city }}, {{ project.province }}</p>
      </button>
    </div>

    <div v-else class="py-8 text-center text-gray-500">
      <p>هیچ پروژه‌ی فعالی برای نمایش روی نقشه وجود ندارد</p>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
}
</style>
