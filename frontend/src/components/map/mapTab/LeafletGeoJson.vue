<script setup lang="ts">
import { inject, shallowRef, watch } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  geoJson?: GeoJSON.GeoJsonObject | null
}>()

const map = inject<any>('leaflet-map')

const layer = shallowRef<L.GeoJSON>()

watch(
  () => [map?.value, props.geoJson],
  () => {
    if (!map?.value) return

    layer.value?.remove()

    if (!props.geoJson) return

    layer.value = L.geoJSON(props.geoJson, {
      style: {
        color: 'red',
        weight: 3,
      },
    }).addTo(map.value)

    map.value.fitBounds(layer.value.getBounds())
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template />
