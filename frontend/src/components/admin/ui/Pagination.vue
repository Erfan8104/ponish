<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    totalItems?: number
    perPage?: number
  }>(),
  {
    totalItems: 0,
    perPage: 10,
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() => {
  const result: (number | string)[] = []
  const total = props.totalPages
  const current = props.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i)
    return result
  }

  result.push(1)

  if (current > 3) result.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) result.push(i)

  if (current < total - 2) result.push('...')

  result.push(total)
  return result
})

function goTo(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
    <!-- اطلاعات -->
    <p v-if="totalItems > 0" class="text-xs text-gray-400">
      نمایش
      <span class="font-semibold text-gray-600">
        {{ (page - 1) * perPage + 1 }}
      </span>
      تا
      <span class="font-semibold text-gray-600">
        {{ Math.min(page * perPage, totalItems) }}
      </span>
      از
      <span class="font-semibold text-gray-600">{{ totalItems }}</span>
      مورد
    </p>
    <div v-else />

    <!-- دکمه‌ها -->
    <div class="flex items-center gap-1">
      <!-- قبلی -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        :disabled="page <= 1"
        @click="goTo(page - 1)"
      >
        ‹
      </button>

      <!-- شماره صفحات -->
      <template v-for="(p, idx) in pages" :key="idx">
        <span
          v-if="p === '...'"
          class="w-8 h-8 flex items-center justify-center text-xs text-gray-300"
        >
          …
        </span>
        <button
          v-else
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-colors"
          :class="
            p === page
              ? 'bg-[#008f55] text-white border-[#008f55]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          "
          @click="goTo(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <!-- بعدی -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        :disabled="page >= totalPages"
        @click="goTo(page + 1)"
      >
        ›
      </button>
    </div>
  </div>
</template>
