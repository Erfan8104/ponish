<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// متد مدیریت تغییر فایل
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    store.addFiles(Array.from(target.files))
    target.value = '' // ریست کردن برای آپلودهای بعدی
  }
}

// متد درگ اند دراپ
const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    store.addFiles(Array.from(event.dataTransfer.files))
  }
}
</script>

<template>
  <div class="relative text-right" style="direction: rtl">
    <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">پروژه خود را توضیح دهید</label>
    <textarea
      v-model="store.formData.description"
      rows="4"
      placeholder="توضیحات کامل پروژه..."
      class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none transition-all resize-none"
    ></textarea>

    <div
      @dragover.prevent
      @drop.prevent="handleDrop"
      class="mt-6 border border-dashed border-gray-200 bg-gray-50/40 rounded-xl p-6 text-center"
    >
      <input
        type="file"
        id="unique-project-file-uploader"
        multiple
        class="hidden"
        @change="handleFileChange"
      />

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-right sm:order-1 order-2">
          <p class="text-[11px] text-gray-500 font-medium mb-1">
            فایل‌ها و تصاویری که به توضیحات شما کمک می‌کند را اینجا رها کنید.
          </p>
          <div class="flex items-center gap-4 text-[10px] text-gray-400">
            <span>حداکثر تعداد فایل: ۵۰</span>
            <span>حداکثر حجم: ۱۵ MB</span>
          </div>
        </div>

        <label
          for="unique-project-file-uploader"
          class="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 inline-block select-none"
        >
          آپلود فایل
        </label>
      </div>

      <div
        v-if="store.uploadedFiles && store.uploadedFiles.length > 0"
        class="mt-5 text-right flex flex-wrap gap-2"
      >
        <div
          v-for="(file, fIdx) in store.uploadedFiles"
          :key="fIdx"
          class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-2 pr-3 py-1.5 text-[11px] text-gray-700 shadow-sm"
        >
          <span class="font-medium truncate max-w-[180px]">{{ file.name }}</span>
          <button
            type="button"
            @click="store.removeFile(fIdx)"
            class="text-red-400 hover:text-red-600 cursor-pointer mr-1 font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
