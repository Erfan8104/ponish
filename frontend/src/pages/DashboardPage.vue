<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRoleStore } from '@/stores/role.store'

import StatsCards from '@/components/dashboard/StatsCards.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import ProjectsMap from '@/components/dashboard/ProjectsMap.vue'
import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import ProjectList from '@/components/dashboard/ProjectList.vue'
import ProposalModal from '@/components/modal/ProposalModal.vue'
import MyProject from '@/components/dashboard/MyProject.vue'
const authStore = useAuthStore()
const roleStore = useRoleStore()

// بهتر است نام متغیر واضح‌تر باشد
const isEmployer = computed(() => roleStore.role === 'employer')

const isLoading = ref(true)

const fakeFetchDashboardData = () => {
  isLoading.value = true

  setTimeout(() => {
    if (!authStore.name) {
      authStore.setName('')
      authStore.setEmail('')
    }
    isLoading.value = false
  }, 800)
}

onMounted(() => {
  fakeFetchDashboardData()
})
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
    <div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <!-- Profile -->
      <section class="mb-10">
        <ProfileCard />
      </section>
      <MyProject v-if="isEmployer" />

      <!-- Projects - فقط برای Employer نمایش داده شود -->
      <section v-if="!isEmployer" class="mb-12">
        <ProjectList />
      </section>

      <!-- Quick Actions -->
      <section class="mb-12">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">دسترسی سریع</h2>
          <p class="mt-2 text-sm text-slate-500">میانبرهای مورد نیاز شما</p>
        </div>
        <QuickActions />
      </section>

      <!-- Statistics -->
      <section class="mb-12">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">آمار فعالیت</h2>
          <p class="mt-2 text-sm text-slate-500">خلاصه وضعیت حساب کاربری شما</p>
        </div>
        <StatsCards />
      </section>

      <!-- Map -->
      <section>
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">نقشه پروژه‌ها</h2>
          <p class="mt-2 text-sm text-slate-500">پراکندگی جغرافیایی پروژه‌ها</p>
        </div>
        <ProjectsMap />
      </section>
    </div>

    <ProposalModal />
  </main>
</template>
