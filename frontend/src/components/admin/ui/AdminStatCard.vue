<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon?: string
    trend?: number
    trendLabel?: string
    color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'
  }>(),
  {
    color: 'green',
  },
)

type ColorConfig = {
  bg: string
  text: string
  iconBg: string
}

const colorMap: Record<string, ColorConfig> = {
  green: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100 text-red-700',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    iconBg: 'bg-gray-100 text-gray-700',
  },
}

const colors = computed<ColorConfig>(() => {
  return colorMap[props.color] ?? colorMap.green
})

const trendPositive = computed(() => (props.trend ?? 0) >= 0)
</script>

<template>
  <div
    class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between gap-3">
      <!-- متن -->
      <div class="min-w-0 flex-1">
        <p class="text-xs text-gray-400 font-medium mb-1.5">{{ title }}</p>
        <p class="text-2xl font-black text-gray-900 tracking-tight">
          {{ value }}
        </p>

        <!-- روند -->
        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-2">
          <span
            class="text-[11px] font-semibold"
            :class="trendPositive ? 'text-emerald-600' : 'text-red-500'"
          >
            {{ trendPositive ? '↑' : '↓' }}
            {{ Math.abs(trend) }}%
          </span>
          <span v-if="trendLabel" class="text-[11px] text-gray-400">
            {{ trendLabel }}
          </span>
        </div>
      </div>

      <!-- آیکون -->
      <div
        v-if="icon || $slots.icon"
        class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        :class="colors.iconBg"
      >
        <slot name="icon">
          {{ icon }}
        </slot>
      </div>
    </div>
  </div>
</template>
