<script setup lang="ts">
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-50" style="direction: rtl">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader />

      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
