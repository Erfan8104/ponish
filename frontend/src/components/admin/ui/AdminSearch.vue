<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    debounce?: number
  }>(),
  {
    modelValue: '',
    placeholder: 'جستجو...',
    debounce: 300,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const localValue = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val
  },
)

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  localValue.value = value

  if (timer) clearTimeout(timer)

  timer = setTimeout(() => {
    emit('update:modelValue', value)
    emit('search', value)
  }, props.debounce)
}

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<template>
  <div class="relative w-full">
    <!-- آیکون جستجو -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
    </div>

    <input
      type="text"
      :value="localValue"
      :placeholder="placeholder"
      class="w-full h-10 pr-10 pl-9 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-300"
      style="direction: rtl"
      @input="onInput"
    />

    <!-- دکمه پاک کردن -->
    <button
      v-if="localValue"
      type="button"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
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
</template>
