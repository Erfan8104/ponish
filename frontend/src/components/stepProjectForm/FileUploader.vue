<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  store.addFiles(Array.from(target.files))
  target.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#008f55] transition-all"
    >
      <input
        type="file"
        multiple
        class="hidden"
        id="fileInput"
        accept=".kml,.kmz,.geojson,.json,.zip"
        @change="handleFileChange"
      />
      <label for="fileInput" class="cursor-pointer">
        <span class="block text-4xl mb-2">📁</span>
        <span class="text-sm font-bold text-gray-600">انتخاب فایل‌های محدوده</span>
      </label>
    </div>

    <div v-if="store.uploadedFiles.length" class="space-y-2">
      <div
        v-for="(file, index) in store.uploadedFiles"
        :key="index"
        class="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm"
      >
        <span class="text-xs truncate max-w-[80%]">{{ file.name }}</span>
        <button
          type="button"
          @click="store.removeFile(index)"
          class="text-red-500 text-xs font-bold hover:underline"
        >
          حذف
        </button>
      </div>
    </div>
  </div>
</template>
