<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  geoJson?: any
  mappingType?: string | null
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let geoLayer: L.GeoJSON | null = null

function renderGeoJson() {
  if (!map) return

  if (geoLayer) {
    map.removeLayer(geoLayer)
    geoLayer = null
  }

  if (!props.geoJson) return

  try {
    geoLayer = L.geoJSON(props.geoJson, {
      style: {
        color: '#008f55',
        weight: 3,
        fillColor: '#008f55',
        fillOpacity: 0.15,
      },
    }).addTo(map)

    const bounds = geoLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  } catch (error) {
    console.error('خطا در نمایش GeoJson:', error)
  }
}

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    dragging: true,
    scrollWheelZoom: false,
    zoomControl: true,
  }).setView([35.7219, 51.3347], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  renderGeoJson()
})

watch(() => props.geoJson, renderGeoJson)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-[400px] rounded-2xl overflow-hidden relative z-0" />
</template>

<style scoped>
:deep(.leaflet-container) {
  z-index: 0;
}
</style>
