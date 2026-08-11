<script setup lang="ts">
const props = defineProps<{
  count: number
  showActivate?: boolean
  showDeactivate?: boolean
  showDelete?: boolean
  showExport?: boolean
}>()

const emit = defineEmits<{
  activate: []
  deactivate: []
  delete: []
  export: []
  clear: []
}>()
</script>

<template>
  <div
    v-if="count > 0"
    class="sticky top-2 z-10 bg-gray-900 text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg"
    style="direction: rtl"
  >
    <div class="flex items-center gap-3">
      <span class="text-xs font-bold">{{ count }} مورد انتخاب شده</span>
      <button class="text-[11px] text-gray-300 hover:text-white underline" @click="emit('clear')">
        لغو انتخاب
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-if="showActivate"
        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[11px] font-medium transition-colors"
        @click="emit('activate')"
      >
        فعال‌سازی گروهی
      </button>
      <button
        v-if="showDeactivate"
        class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-[11px] font-medium transition-colors"
        @click="emit('deactivate')"
      >
        غیرفعال‌سازی گروهی
      </button>
      <button
        v-if="showExport"
        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] font-medium transition-colors"
        @click="emit('export')"
      >
        خروجی CSV
      </button>
      <button
        v-if="showDelete"
        class="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-[11px] font-medium transition-colors"
        @click="emit('delete')"
      >
        حذف گروهی
      </button>
    </div>
  </div>
</template>
