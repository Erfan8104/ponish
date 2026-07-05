<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  polygon?: number[][][]
}>()

const hasPolygon = computed(() => !!props.polygon?.length)
</script>

<template>
  <div>
    <div
      v-if="!hasPolygon"
      class="flex h-full items-center justify-center rounded-xl border border-dashed text-gray-400"
    >
      Polygon وجود ندارد
    </div>

    <slot v-else />
  </div>
</template>
