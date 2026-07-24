<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import * as turf from '@turf/turf'

const store = useProjectStore()

let map: L.Map | null = null
let drawnItems: L.FeatureGroup | null = null
let drawControl: L.Control.Draw | null = null

// تابع اصلی بروزرسانی استور
const updateStoreFromLayer = (layer: L.Layer) => {
  const geojson = (layer as any).toGeoJSON()
  const geometry = (geojson as any).geometry
  if (!geometry?.coordinates) return

  if (store.formData.mappingType === 'area') {
    // محاسبه برای پلیگون
    const areaMeters = turf.area(geojson)
    store.formData.calculatedArea = Number((areaMeters / 10000).toFixed(2))
    // تبدیل مختصات پلیگون
    store.formData.polygonCoordinates = geometry.coordinates[0].map((c: any) => [c[1], c[0]])
  } else if (store.formData.mappingType === 'corridor') {
    // محاسبه برای لاین (کریدور)
    const lengthMeters = turf.length(geojson, { units: 'kilometers' })
    store.formData.corridorLength = Number(lengthMeters.toFixed(2))

    // ✅ این بخش مهم است: مختصات خط را هم در همان متغیر ذخیره می‌کنیم
    // در لاین، coordinates یک آرایه از نقاط است، نه آرایه در آرایه
    store.formData.polygonCoordinates = geometry.coordinates.map((c: any) => [c[1], c[0]])
  }

  store.formData.geoJson = geojson
}

const initDrawControl = () => {
  if (map && drawControl) map.removeControl(drawControl)

  const isArea = store.formData.mappingType === 'area'

  drawControl = new L.Control.Draw({
    draw: {
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
      polygon: isArea ? { allowIntersection: false, showArea: true } : false,
      polyline: !isArea ? { shapeOptions: { color: '#008f55' } } : false,
    },
    edit: { featureGroup: drawnItems! },
  })

  map?.addControl(drawControl)
}

// واکنش به تغییر نوع پروژه
watch(
  () => store.formData.mappingType,
  () => {
    drawnItems?.clearLayers()
    store.clearPolygon()
    initDrawControl()
  },
)

onMounted(() => {
  map = L.map('project-map').setView([35.7219, 51.3347], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  drawnItems = new L.FeatureGroup()
  map.addLayer(drawnItems)

  initDrawControl()

  map.on('draw:created', (e: any) => {
    drawnItems?.clearLayers()
    const layer = e.layer
    drawnItems?.addLayer(layer)
    updateStoreFromLayer(layer)
  })

  map.on('draw:edited', (e: any) => {
    e.layers.eachLayer((layer: L.Layer) => updateStoreFromLayer(layer))
  })

  map.on('draw:deleted', () => {
    store.formData.polygonCoordinates = []
    store.formData.calculatedArea = 0
    store.formData.corridorLength = 0
    store.formData.geoJson = null
  })
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <div id="project-map" class="w-full h-[500px] rounded-2xl overflow-hidden relative z-0" />
</template>

<style>
/* استایل‌های لازم برای نمایش درست آیکون‌های لیفلت */
.leaflet-container {
  z-index: 0;
}
</style>
