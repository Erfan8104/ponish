<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: string
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'sm',
  },
)

const statusMap: Record<string, { label: string; class: string }> = {
  // کاربران
  active: { label: 'فعال', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: 'غیرفعال', class: 'bg-gray-50 text-gray-500 border-gray-200' },

  // پروژه
  draft: { label: 'پیش‌نویس', class: 'bg-gray-50 text-gray-600 border-gray-200' },
  open: { label: 'باز', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'در حال انجام', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'تکمیل‌شده', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'لغوشده', class: 'bg-red-50 text-red-600 border-red-200' },
  disputed: { label: 'اختلاف', class: 'bg-orange-50 text-orange-700 border-orange-200' },

  // پیشنهاد / قرارداد / پرداخت
  pending: { label: 'در انتظار', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { label: 'پذیرفته‌شده', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'ردشده', class: 'bg-red-50 text-red-600 border-red-200' },
  withdrawn: { label: 'انصراف', class: 'bg-gray-50 text-gray-500 border-gray-200' },
  paid: { label: 'پرداخت‌شده', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'ناموفق', class: 'bg-red-50 text-red-600 border-red-200' },
  refunded: { label: 'بازگشت‌شده', class: 'bg-purple-50 text-purple-700 border-purple-200' },

  // عمومی
  true: { label: 'فعال', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  false: { label: 'غیرفعال', class: 'bg-gray-50 text-gray-500 border-gray-200' },
}

const config = computed(() => {
  const key = String(props.status).toLowerCase()
  return (
    statusMap[key] || {
      label: props.status,
      class: 'bg-gray-50 text-gray-600 border-gray-200',
    }
  )
})

const sizeClass = computed(() =>
  props.size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5',
)
</script>

<template>
  <span
    class="inline-flex items-center font-medium rounded-lg border whitespace-nowrap"
    :class="[config.class, sizeClass]"
  >
    {{ config.label }}
  </span>
</template>
