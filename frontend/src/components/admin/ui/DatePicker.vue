<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    placeholder?: string
    min?: string
    max?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'انتخاب تاریخ',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

const localValue = computed({
  get: () => props.modelValue || '',
  set: (val: string) => {
    const value = val || null
    emit('update:modelValue', value)
    emit('change', value)
  },
})

function clear() {
  emit('update:modelValue', null)
  emit('change', null)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 min-w-[160px]">
    <label v-if="label" class="text-[11px] font-medium text-gray-400 mr-1">
      {{ label }}
    </label>

    <div class="relative">
      <input
        v-model="localValue"
        type="date"
        :min="min"
        :max="max"
        :disabled="disabled"
        :placeholder="placeholder"
        class="w-full h-10 px-3 pl-9 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        style="direction: ltr; text-align: right"
      />

      <!-- دکمه پاک کردن -->
      <button
        v-if="localValue && !disabled"
        type="button"
        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
        @click="clear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
