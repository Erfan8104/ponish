<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>
<script setup lang="ts">
import AppHeader from './components/layouts/header.vue'
import AppFooter from './components/layouts/footer.vue'
</script>
