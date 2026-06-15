<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import WelcomeCard from '@/components/Dashboard/WelcomeCard.vue'
import StatsCards from '@/components/Dashboard/StatsCards.vue'
import QuickActions from '@/components/Dashboard/QuickActions.vue'
import ProjectsMap from '@/components/Dashboard/ProjectsMap.vue'
import RecentProjects from '@/components/Dashboard/RecentProjects.vue'
import ActivityTimeline from './../components/Dashboard/ActivityTimeline.vue'
import ProfileCard from '@/components/Dashboard/ProfileCard.vue'

const projectStore = useProjectStore()

onMounted(() => {
  // بارگذاری داده‌های نمونه در صورت خالی بودن
  if (projectStore.projects.length === 0) {
    projectStore.initializeMockData()
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <ProfileCard />
    <WelcomeCard />

    <StatsCards class="mt-6" />

    <QuickActions class="mt-6" />

    <ProjectsMap class="mt-6" />

    <div class="grid lg:grid-cols-3 gap-6 mt-6">
      <div class="lg:col-span-2">
        <RecentProjects />
      </div>

      <div class="space-y-6">
        <ActivityTimeline />
      </div>
    </div>
  </div>
</template>
