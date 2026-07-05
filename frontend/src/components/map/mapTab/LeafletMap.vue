<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, provide } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
  }>(),
  {
    center: () => [32.4279, 53.688],
    zoom: 5,
  },
)

const mapElement = ref<HTMLDivElement | null>(null)
const map = shallowRef<L.Map | null>(null)

provide('leaflet-map', map)

onMounted(() => {
  if (!mapElement.value) return

  map.value = L.map(mapElement.value).setView(props.center, props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map.value)
})

onBeforeUnmount(() => {
  map.value?.remove()
})
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="mapElement" class="absolute inset-0 rounded-xl" />

    <slot />
  </div>
</template>
