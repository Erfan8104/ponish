<template>
  <AppHeader />
  <RouterView />
  <ProjectOptionsModal />
  <AppFooter />
</template>
<script setup lang="ts">
import AppHeader from './components/layouts/header.vue'
import AppFooter from './components/layouts/footer.vue'
import ProjectOptionsModal from './components/modal/ProjectOptionsModal.vue'
</script>
