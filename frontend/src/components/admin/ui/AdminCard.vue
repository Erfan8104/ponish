<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    padding?: boolean
    noBorder?: boolean
  }>(),
  {
    padding: true,
    noBorder: false,
  },
)
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm"
    :class="[noBorder ? '' : 'border border-gray-100', padding ? 'p-5' : '']"
  >
    <!-- هدر کارت -->
    <div
      v-if="title || $slots.header || $slots.actions"
      class="flex items-start justify-between gap-3 mb-4"
      :class="{ 'px-5 pt-5': !padding }"
    >
      <div class="min-w-0">
        <slot name="header">
          <h3 v-if="title" class="text-sm font-bold text-gray-900 truncate">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">
            {{ subtitle }}
          </p>
        </slot>
      </div>

      <div v-if="$slots.actions" class="flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <!-- محتوای اصلی -->
    <div :class="{ 'px-5 pb-5': !padding && (title || $slots.header) }">
      <slot />
    </div>

    <!-- فوتر اختیاری -->
    <div
      v-if="$slots.footer"
      class="mt-4 pt-4 border-t border-gray-50"
      :class="{ 'px-5 pb-5': !padding }"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
