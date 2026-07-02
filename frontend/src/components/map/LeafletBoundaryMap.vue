<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import L from 'leaflet'
import 'leaflet-draw'
import * as turf from '@turf/turf'

import type { Feature, Polygon, GeoJsonProperties } from 'geojson'

const store = useProjectStore()

let map: L.Map | null = null
let drawnItems: L.FeatureGroup | null = null

const updateStoreFromLayer = (layer: L.Layer) => {
  const geojson = layer.toGeoJSON() as Feature<Polygon, GeoJsonProperties>

  if (!geojson?.geometry?.coordinates?.[0]) return

  const areaMeters = turf.area(geojson)
  const areaHa = Number((areaMeters / 10000).toFixed(2))

  const coordinates: [number, number][] = geojson.geometry.coordinates[0].map((c) => [c[1], c[0]])

  store.formData.polygonCoordinates = coordinates
  store.formData.calculatedArea = areaHa
  store.formData.geoJson = geojson
}

onMounted(() => {
  map = L.map('project-map').setView([35.7219, 51.3347], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  drawnItems = new L.FeatureGroup()
  map.addLayer(drawnItems)

  const drawControl = new L.Control.Draw({
    draw: {
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
      polyline: false,
      polygon: {
        allowIntersection: false,
        showArea: true,
      },
    },
    edit: {
      featureGroup: drawnItems,
    },
  })

  map.addControl(drawControl)

  // ✅ IMPORTANT: draw:created (نه فقط CREATED constant)
  map.on('draw:created', (e: any) => {
    drawnItems?.clearLayers()

    const layer = e.layer
    drawnItems?.addLayer(layer)

    updateStoreFromLayer(layer)
  })

  map.on('draw:edited', (e: any) => {
    e.layers.eachLayer((layer: L.Layer) => {
      updateStoreFromLayer(layer)
    })
  })

  map.on('draw:deleted', () => {
    store.formData.polygonCoordinates = []
    store.formData.calculatedArea = 0
    store.formData.geoJson = null
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
  drawnItems = null
})
</script>

<template>
  <div id="project-map" class="w-full h-[500px] rounded-2xl overflow-hidden" />
</template>
