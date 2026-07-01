<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'
import { onMounted } from 'vue'

const projectStore = useProjectStore()

onMounted(() => {
  projectStore.fetchMyProjects()
})
</script>

<template>
  <div>
    <h2>پروژه‌های من</h2>

    <div v-if="projectStore.isLoading">در حال بارگذاری...</div>

    <div v-else-if="projectStore.myProjects.length === 0">هنوز پروژه‌ای ثبت نکرده‌اید.</div>

    <div v-else>
      <ProjectCard
        v-for="project in projectStore.myProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
