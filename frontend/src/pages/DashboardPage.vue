<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { useAuthStore } from '@/stores/auth.store'

// کامپوننت‌های ماژولار شما

import StatsCards from '@/components/Dashboard/StatsCards.vue'
import QuickActions from '@/components/Dashboard/QuickActions.vue'
import ProjectsMap from '@/components/Dashboard/ProjectsMap.vue'
import ProfileCard from '@/components/Dashboard/ProfileCard.vue'

const projectStore = useProjectStore()
const authStore = useAuthStore()

// استیت‌های فرانت‌اَند برای شبیه‌سازی رفتار واقعی سرور
const isLoading = ref<boolean>(true)

// تابع شبیه‌ساز دریافت اطلاعات (بدون نیاز به پورت و سرور بک‌اندر)
const fakeFetchDashboardData = () => {
  isLoading.value = true

  // شبیه‌سازی ۲ ثانیه تاخیر شبکه برای دیدن افکت لودینگ (Skeleton)
  setTimeout(() => {
    // ۱. اگر استور پینیا کاربر خالی بود، با اطلاعات فرضی پرش می‌کنیم
    if (!authStore.name) {
      authStore.setName('سینا محسنی')
      authStore.setEmail('sina@example.com')
    }

    // ۲. بارگذاری داده‌های نمونه پروژه‌ها از پینیا استور شما
    if (projectStore.projects.length === 0) {
      projectStore.initializeMockData()
    }

    isLoading.value = false
  }, 50) // ۱.۵ ثانیه لودینگ مصنوعی
}

onMounted(() => {
  fakeFetchDashboardData()
})
</script>

<template>
  <div class="min-h-screen bg-grey-50/90 pb-12 antialiased">
    <!-- نوار هدر بالای صفحه -->

    <main class="max-w-7xl mx-auto pt-6">
      <!-- وضعیت لودینگ: نمایش اسکلتون موقت برای جذابیت بصری -->
      <div v-if="isLoading" class="space-y-6 animate-pulse">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="h-44 bg-gray-200 rounded-xl md:col-span-1"></div>
          <div class="h-44 bg-gray-200 rounded-xl md:col-span-2"></div>
        </div>
        <div class="h-24 bg-gray-200 rounded-xl"></div>
        <div class="h-36 bg-gray-200 rounded-xl"></div>
      </div>

      <!-- لود کامل و ماژولار بخش‌های مختلف فرانت‌اَند -->
      <div v-else class="space-y-6">
        <!-- لایه کارت‌ها (پروفایل + خوش‌آمدگویی) -->
        <div class="bg-red-400">
          <ProfileCard />
        </div>

        <!-- لایه آمار عددی پروژه‌ها -->
        <StatsCards />

        <!-- لایه دسترسی‌های سریع (مثل دکمه ساخت پروژه جدید) -->
        <QuickActions />
        <div class="relative z-0 w-full h-screen">
          <ProjectsMap />
        </div>
        <!-- لایه نقشه موقعیت جغرافیایی پروژه‌ها -->
      </div>
    </main>
  </div>
</template>
