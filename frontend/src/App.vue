<template>
  <AppHeader v-if="!isAdminRoute" />
  <RouterView />
  <template v-if="!isAdminRoute">
    <ProjectOptionsModal />
    <QuickProjectModal />
  </template>
  <AppFooter v-if="!isAdminRoute" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layouts/header.vue'
import AppFooter from './components/layouts/footer.vue'
import ProjectOptionsModal from './components/modal/ProjectOptionsModal.vue'
import QuickProjectModal from './components/modal/QuickProjectModal.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
