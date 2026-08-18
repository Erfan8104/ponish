```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const store = useProjectStore()

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type Coordinate = [number, number]

/* -------------------------------------------------------------------------- */
/*                                Refs                                        */
/* -------------------------------------------------------------------------- */

const mapContainer = ref<HTMLElement | null>(null)

const map = ref<L.Map | null>(null)

const drawnLayer = ref<L.Polygon | L.Polyline | null>(null)

const markersLayer = ref<L.LayerGroup | null>(null)

const isDrawing = ref(false)

const coordinates = ref<Coordinate[]>([])

/* -------------------------------------------------------------------------- */
/*                              Computed                                      */
/* -------------------------------------------------------------------------- */

const mappingType = computed(() => store.formData.mappingType)

const isAreaMode = computed(() => mappingType.value === 'area')

const isCorridorMode = computed(() => mappingType.value === 'corridor')

const modeTitle = computed(() => {
  if (isAreaMode.value) {
    return 'رسم محدوده پروژه'
  }

  if (isCorridorMode.value) {
    return 'رسم مسیر پروژه'
  }

  return 'محدوده پروژه'
})

const modeDescription = computed(() => {
  if (isAreaMode.value) {
    return 'نقاط محدوده را روی نقشه انتخاب کنید تا یک محدوده مساحتی ایجاد شود.'
  }

  if (isCorridorMode.value) {
    return 'مسیر پروژه را با انتخاب حداقل دو نقطه روی نقشه مشخص کنید.'
  }

  return 'ابتدا نوع پروژه را انتخاب کنید.'
})

/* -------------------------------------------------------------------------- */
/*                            Map configuration                               */
/* -------------------------------------------------------------------------- */

const DEFAULT_CENTER: Coordinate = [35.6892, 51.389]

const DEFAULT_ZOOM = 6

/* -------------------------------------------------------------------------- */
/*                           Leaflet helpers                                  */
/* -------------------------------------------------------------------------- */

const createMap = () => {
  if (!mapContainer.value || map.value) return

  map.value = L.map(mapContainer.value, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)

  markersLayer.value = L.layerGroup().addTo(map.value)

  map.value.on('click', handleMapClick)
}

/* -------------------------------------------------------------------------- */
/*                            Map click handler                               */
/* -------------------------------------------------------------------------- */

const handleMapClick = (event: L.LeafletMouseEvent) => {
  if (!mappingType.value) {
    return
  }

  const point: Coordinate = [event.latlng.lat, event.latlng.lng]

  coordinates.value.push(point)

  addPointMarker(event.latlng)

  redrawShape()

  syncWithStore()
}

/* -------------------------------------------------------------------------- */
/*                              Marker                                         */
/* -------------------------------------------------------------------------- */

const addPointMarker = (latlng: L.LatLng) => {
  if (!markersLayer.value) return

  const marker = L.circleMarker(latlng, {
    radius: 5,
    weight: 2,
    fillOpacity: 1,
  })

  marker.addTo(markersLayer.value)
}

/* -------------------------------------------------------------------------- */
/*                             Draw shape                                      */
/* -------------------------------------------------------------------------- */

const redrawShape = () => {
  if (!map.value) return

  if (drawnLayer.value) {
    map.value.removeLayer(drawnLayer.value)
    drawnLayer.value = null
  }

  if (coordinates.value.length === 0) {
    return
  }

  if (isAreaMode.value) {
    if (coordinates.value.length < 3) {
      return
    }

    const polygon = L.polygon(coordinates.value, {
      weight: 3,
      fillOpacity: 0.25,
    })

    polygon.addTo(map.value)

    drawnLayer.value = polygon
  }

  if (isCorridorMode.value) {
    if (coordinates.value.length < 2) {
      return
    }

    const polyline = L.polyline(coordinates.value, {
      weight: 5,
      lineCap: 'round',
      lineJoin: 'round',
    })

    polyline.addTo(map.value)

    drawnLayer.value = polyline
  }
}

/* -------------------------------------------------------------------------- */
/*                         Sync with Pinia store                              */
/* -------------------------------------------------------------------------- */

const syncWithStore = () => {
  store.formData.polygonCoordinates = coordinates.value.map(([lat, lng]) => [lng, lat])

  if (isAreaMode.value) {
    if (coordinates.value.length >= 3) {
      const area = calculatePolygonArea(coordinates.value)

      store.formData.calculatedArea = Number((area / 1_000_000).toFixed(2))
    } else {
      store.formData.calculatedArea = 0
    }
  }

  if (isCorridorMode.value) {
    if (coordinates.value.length >= 2) {
      const length = calculatePolylineLength(coordinates.value)

      store.formData.corridorLength = Number((length / 1000).toFixed(2))
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                         Polygon area calculation                           */
/* -------------------------------------------------------------------------- */

/**
 * محاسبه تقریبی مساحت Polygon بر اساس مختصات جغرافیایی
 *
 * خروجی:
 * متر مربع
 */

const calculatePolygonArea = (points: Coordinate[]): number => {
  if (points.length < 3) {
    return 0
  }

  const earthRadius = 6378137

  let area = 0

  for (let i = 0; i < points.length; i++) {
    const current = points[i]

    const next = points[(i + 1) % points.length]

    const lat1 = (current[0] * Math.PI) / 180
    const lat2 = (next[0] * Math.PI) / 180

    const lng1 = (current[1] * Math.PI) / 180
    const lng2 = (next[1] * Math.PI) / 180

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = (Math.abs(area) * earthRadius * earthRadius) / 2

  return area
}

/* -------------------------------------------------------------------------- */
/*                        Polyline length calculation                         */
/* -------------------------------------------------------------------------- */

const calculatePolylineLength = (points: Coordinate[]): number => {
  if (points.length < 2) {
    return 0
  }

  let totalDistance = 0

  for (let i = 1; i < points.length; i++) {
    const previous = L.latLng(points[i - 1][0], points[i - 1][1])

    const current = L.latLng(points[i][0], points[i][1])

    totalDistance += previous.distanceTo(current)
  }

  return totalDistance
}

/* -------------------------------------------------------------------------- */
/*                            Clear drawing                                    */
/* -------------------------------------------------------------------------- */

const clearDrawing = () => {
  coordinates.value = []

  if (drawnLayer.value && map.value) {
    map.value.removeLayer(drawnLayer.value)
    drawnLayer.value = null
  }

  if (markersLayer.value) {
    markersLayer.value.clearLayers()
  }

  store.formData.polygonCoordinates = []

  store.formData.calculatedArea = 0

  if (isCorridorMode.value) {
    store.formData.corridorLength = 0
  }
}

/* -------------------------------------------------------------------------- */
/*                              Undo point                                     */
/* -------------------------------------------------------------------------- */

const undoLastPoint = () => {
  if (coordinates.value.length === 0) {
    return
  }

  coordinates.value.pop()

  redrawMarkers()

  redrawShape()

  syncWithStore()
}

const redrawMarkers = () => {
  if (!markersLayer.value) return

  markersLayer.value.clearLayers()

  coordinates.value.forEach(([lat, lng]) => {
    addPointMarker(L.latLng(lat, lng))
  })
}

/* -------------------------------------------------------------------------- */
/*                          Fit map to drawing                                */
/* -------------------------------------------------------------------------- */

const fitToDrawing = () => {
  if (!map.value || coordinates.value.length === 0) {
    return
  }

  const bounds = L.latLngBounds(coordinates.value.map(([lat, lng]) => L.latLng(lat, lng)))

  map.value.fitBounds(bounds, {
    padding: [40, 40],
  })
}

/* -------------------------------------------------------------------------- */
/*                         Restore previous data                               */
/* -------------------------------------------------------------------------- */

const restoreFromStore = () => {
  const storedCoordinates = store.formData.polygonCoordinates

  if (!Array.isArray(storedCoordinates) || storedCoordinates.length === 0) {
    coordinates.value = []

    return
  }

  /**
   * در Store مختصات به صورت:
   *
   * [lng, lat]
   *
   * ذخیره شده‌اند.
   *
   * Leaflet نیاز دارد:
   *
   * [lat, lng]
   */

  coordinates.value = storedCoordinates
    .filter(
      (point: unknown) =>
        Array.isArray(point) &&
        point.length >= 2 &&
        typeof point[0] === 'number' &&
        typeof point[1] === 'number',
    )
    .map(([lng, lat]: [number, number]) => [lat, lng] as Coordinate)

  redrawMarkers()

  redrawShape()

  if (coordinates.value.length > 0) {
    fitToDrawing()
  }
}

/* -------------------------------------------------------------------------- */
/*                         Mapping type change                                */
/* -------------------------------------------------------------------------- */

const handleMappingTypeChange = () => {
  clearDrawing()

  if (map.value) {
    map.value.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
  }
}

watch(mappingType, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return
  }

  handleMappingTypeChange()
})

/* -------------------------------------------------------------------------- */
/*                              Lifecycle                                      */
/* -------------------------------------------------------------------------- */

onMounted(() => {
  createMap()

  restoreFromStore()
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.off('click', handleMapClick)

    map.value.remove()

    map.value = null
  }
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-gray-800">
          {{ modeTitle }}
        </h3>

        <p class="text-xs text-gray-500 mt-1">
          {{ modeDescription }}
        </p>
      </div>

      <!-- تعداد نقاط -->
      <div
        v-if="mappingType"
        class="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
      >
        {{ coordinates.length }} نقطه
      </div>
    </div>

    <!-- No mapping type -->
    <div
      v-if="!mappingType"
      class="min-h-[300px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-center p-6"
    >
      <div>
        <div class="text-3xl mb-3">🗺️</div>

        <p class="text-sm font-bold text-gray-700">ابتدا نوع پروژه را انتخاب کنید</p>

        <p class="text-xs text-gray-400 mt-2">پروژه مساحتی یا پروژه مسیر (کریدور)</p>
      </div>
    </div>

    <!-- Map -->
    <div v-else class="relative overflow-hidden rounded-2xl border border-gray-200">
      <div ref="mapContainer" class="w-full h-[420px] sm:h-[500px]"></div>

      <!-- Map instructions -->
      <div
        class="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm shadow-lg rounded-xl px-4 py-3 max-w-[260px]"
      >
        <div class="flex items-start gap-2">
          <span class="text-lg">
            {{ isAreaMode ? '📐' : '🛣️' }}
          </span>

          <div>
            <p class="text-xs font-black text-gray-800">
              {{ isAreaMode ? 'رسم محدوده' : 'رسم مسیر' }}
            </p>

            <p class="text-[11px] text-gray-500 mt-1 leading-5">
              {{
                isAreaMode
                  ? 'روی نقشه کلیک کنید و حداقل ۳ نقطه انتخاب کنید.'
                  : 'روی نقشه کلیک کنید و حداقل ۲ نقطه برای مسیر انتخاب کنید.'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Drawing controls -->
      <div class="absolute bottom-3 right-3 left-3 z-[1000] flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          @click="undoLastPoint"
          :disabled="coordinates.length === 0"
          class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white shadow-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ↩️ حذف آخرین نقطه
        </button>

        <button
          type="button"
          @click="clearDrawing"
          :disabled="coordinates.length === 0"
          class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white shadow-lg border border-red-100 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          🗑️ پاک کردن
        </button>

        <button
          type="button"
          @click="fitToDrawing"
          :disabled="coordinates.length === 0"
          class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white shadow-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          🎯 نمایش محدوده
        </button>
      </div>
    </div>

    <!-- Calculation -->
    <div v-if="mappingType && coordinates.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Area -->
      <div v-if="isAreaMode" class="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-600"> مساحت تقریبی </span>

          <span class="font-black text-sm text-[#008f55]">
            {{
              store.formData.calculatedArea > 0
                ? store.formData.calculatedArea + ' هکتار'
                : 'حداقل ۳ نقطه لازم است'
            }}
          </span>
        </div>
      </div>

      <!-- Corridor -->
      <div v-if="isCorridorMode" class="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-600"> طول تقریبی مسیر </span>

          <span class="font-black text-sm text-blue-700">
            {{
              coordinates.length >= 2
                ? store.formData.corridorLength + ' کیلومتر'
                : 'حداقل ۲ نقطه لازم است'
            }}
          </span>
        </div>
      </div>

      <!-- Point count -->
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-600"> تعداد نقاط انتخاب شده </span>

          <span class="font-black text-sm text-gray-800">
            {{ coordinates.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-control-attribution) {
  font-size: 9px;
}

:deep(.leaflet-container) {
  font-family: inherit;
  z-index: 1;
}
</style>
```
