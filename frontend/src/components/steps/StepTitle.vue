<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'
const store = useProjectStore()
</script>

<template>
  <div class="relative text-right" style="direction: rtl">
    <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">عنوان پروژه</label>
    <input
      v-model="store.formData.title"
      type="text"
      placeholder="عنوان پروژه خود را وارد کنید..."
      class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none transition-all"
    />
  </div>
</template>
