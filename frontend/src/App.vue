<template>
  <AppHeader />
  <RouterView />
  <ProjectOptionsModal />
  <QuickProjectModal />
  <AppFooter />
</template>
<script setup lang="ts">
import AppHeader from './components/layouts/header.vue'
import AppFooter from './components/layouts/footer.vue'
import ProjectOptionsModal from './components/modal/ProjectOptionsModal.vue'
import QuickProjectModal from './components/modal/QuickProjectModal.vue'
</script>
