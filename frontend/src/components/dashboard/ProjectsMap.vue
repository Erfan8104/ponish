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
  <div class="bg-white rounded-[28px] p-6 shadow-sm shadow-slate-200/70 overflow-hidden">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">نقشه پروژه‌ها</h2>
        <p class="text-sm text-slate-500">نمایش سریع پروژه‌های فعال روی نقشه</p>
      </div>
      <span class="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
        {{ activeProjects.length }} پروژه فعال
      </span>
    </div>

    <div
      ref="mapContainer"
      class="w-full h-170 z-0 rounded-[24px] border border-slate-200 overflow-hidden"
    ></div>

    <div v-if="activeProjects.length > 0" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <button
        v-for="project in activeProjects.slice(0, 4)"
        :key="project.id"
        @click="handleProjectClick(project.id)"
        class="text-left rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700 transition duration-200 hover:bg-white hover:shadow-md"
      >
        <p class="font-semibold text-sm truncate">{{ project.title }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ project.city }}, {{ project.province }}</p>
      </button>
    </div>

    <div v-else class="py-8 text-center text-slate-500">
      <p>هیچ پروژه‌ی فعالی برای نمایش روی نقشه وجود ندارد</p>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
}
</style>
