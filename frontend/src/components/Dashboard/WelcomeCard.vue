<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useProjectStore } from '@/stores/project.store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const router = useRouter()

const userName = computed(() => authStore.name || authStore.phone || 'کاربر')
const currentHour = computed(() => new Date().getHours())

const greeting = computed(() => {
  if (currentHour.value < 12) return 'صبح‌بخیر'
  if (currentHour.value < 17) return 'بعدازظهر‌بخیر'
  return 'عصر‌بخیر'
})

const handleNewProject = () => {
  router.push({ name: 'new-project' })
}
</script>

<template>
  <div class="bg-linear-to-r from-[#008f55] to-[#00b878] rounded-2xl p-8 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold mb-2">{{ greeting }}, {{ userName }}! 👋</h1>
        <p class="text-green-100 text-lg">
          شما {{ projectStore.dashboardStats.totalProjects }} پروژه فعال دارید
        </p>
      </div>
      <button
        @click="handleNewProject"
        class="bg-white text-[#008f55] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200"
      >
        پروژه جدید +
      </button>
    </div>
  </div>
</template>
