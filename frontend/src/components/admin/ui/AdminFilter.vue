<script setup lang="ts">
export interface FilterOption {
  label: string
  value: string | number | boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | boolean | null
    label?: string
    options: FilterOption[]
    placeholder?: string
  }>(),
  {
    modelValue: null,
    placeholder: 'همه',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
  change: [value: string | number | boolean | null]
}>()

function onChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value

  let value: string | number | boolean | null = raw

  if (raw === '') {
    value = null
  } else if (raw === 'true') {
    value = true
  } else if (raw === 'false') {
    value = false
  } else if (!isNaN(Number(raw)) && raw.trim() !== '') {
    // اگر مقدار عددی بود و در options هم عدد است
    const matched = props.options.find((o) => String(o.value) === raw)
    if (matched && typeof matched.value === 'number') {
      value = Number(raw)
    }
  }

  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 min-w-[140px]">
    <label v-if="label" class="text-[11px] font-medium text-gray-400 mr-1">
      {{ label }}
    </label>

    <select
      :value="modelValue === null || modelValue === undefined ? '' : String(modelValue)"
      class="h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-gray-700 cursor-pointer"
      style="direction: rtl"
      @change="onChange"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
