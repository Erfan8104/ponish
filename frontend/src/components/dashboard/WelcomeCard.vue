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
  <div
    class="bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-500 rounded-[28px] p-8 text-white shadow-lg shadow-cyan-500/20"
  >
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.24em] text-cyan-100/90">داشبورد</p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight">{{ greeting }}, {{ userName }}!</h1>
        <p class="mt-4 max-w-xl text-base text-cyan-100/90">
          در حال حاضر {{ projectStore.dashboardStats.totalProjects }} پروژه در سیستم دارید. همه چیز
          تحت کنترل است.
        </p>
      </div>
      <button
        @click="handleNewProject"
        class="inline-flex items-center justify-center rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-cyan-700 shadow-sm transition duration-200 hover:bg-white"
      >
        پروژه جدید +
      </button>
    </div>
  </div>
</template>
