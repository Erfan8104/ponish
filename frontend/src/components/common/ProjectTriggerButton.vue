<!-- src/components/common/ProjectTriggerButton.vue -->

<script setup lang="ts">
import { useButtonCreateProjectStore } from '../../stores/buttoncreateproject.store'

const modalStore = useButtonCreateProjectStore()
</script>

<template>
  <button
    @click="modalStore.openModal()"
    class="flex items-center gap-2 bg-[#008f55] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#007646] transition-all"
  >
    <!-- با استفاده از slot، هر متنی که موقع استفاده از کامپوننت بنویسیم اینجا قرار می‌گیرد -->
    <slot>ثبت پروژه جدید</slot>
  </button>
</template>
