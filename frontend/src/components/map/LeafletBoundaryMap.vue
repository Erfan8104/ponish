<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useProjectStore } from '../../stores/project.store'

import L from 'leaflet'
import 'leaflet-draw'

import * as turf from '@turf/turf'

const store = useProjectStore()

let map: L.Map
let drawnItems: L.FeatureGroup

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

  map.on(L.Draw.Event.CREATED, (e: any) => {
    drawnItems.clearLayers()

    const layer = e.layer

    drawnItems.addLayer(layer)

    const geojson = layer.toGeoJSON()

    const area = turf.area(geojson)

    const coordinates = geojson.geometry.coordinates[0].map((coord: number[]) => [
      coord[1],
      coord[0],
    ])

    store.setPolygon(coordinates, Number((area / 10000).toFixed(2)), geojson)
  })

  map.on(L.Draw.Event.EDITED, () => {
    drawnItems.eachLayer((layer: any) => {
      const geojson = layer.toGeoJSON()

      const area = turf.area(geojson)

      const coordinates = geojson.geometry.coordinates[0].map((coord: number[]) => [
        coord[1],
        coord[0],
      ])

      store.setPolygon(coordinates, Number((area / 10000).toFixed(2)), geojson)
    })
  })

  map.on(L.Draw.Event.DELETED, () => {
    store.clearPolygon()
  })
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <div id="project-map" class="w-full h-[500px] rounded-2xl overflow-hidden" />
</template>
