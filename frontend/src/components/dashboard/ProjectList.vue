<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'
import { onMounted } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const projectStore = useProjectStore()
onMounted(async () => {
  await projectStore.fetchProjects()
  console.log(projectStore.projects)
})
</script>

<template>
  <div>
    <ProjectCard />
  </div>
</template>
