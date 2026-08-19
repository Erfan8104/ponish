```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import 'leaflet/dist/leaflet.css'

const store = useProjectStore()

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Coordinate = [number, number]

/* -------------------------------------------------------------------------- */
/* Refs                                                                       */
/* -------------------------------------------------------------------------- */

const mapContainer = ref<HTMLElement | null>(null)

const map = ref<L.Map | null>(null)

const currentLayer = ref<L.Polygon | L.Polyline | null>(null)

const isDrawing = ref(false)

const isEditing = ref(false)

/* -------------------------------------------------------------------------- */
/* Computed                                                                   */
/* -------------------------------------------------------------------------- */

const mappingType = computed(() => store.formData.mappingType)

const isAreaMode = computed(() => mappingType.value === 'area')

const isCorridorMode = computed(() => mappingType.value === 'corridor')

const pointCount = ref(0)

/* -------------------------------------------------------------------------- */
/* Map configuration                                                          */
/* -------------------------------------------------------------------------- */

const DEFAULT_CENTER: [number, number] = [35.6892, 51.389]

const DEFAULT_ZOOM = 6

/* -------------------------------------------------------------------------- */
/* Map initialization                                                         */
/* -------------------------------------------------------------------------- */

const initializeMap = async () => {
  await nextTick()

  if (!mapContainer.value || map.value) {
    return
  }

  map.value = L.map(mapContainer.value, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    doubleClickZoom: false,
  })

  /*
   * OpenStreetMap
   */
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)

  /*
   * Zoom control را سمت راست پایین قرار می‌دهیم
   * تا با UI فارسی تداخل نداشته باشد.
   */
  L.control
    .zoom({
      position: 'bottomright',
    })
    .addTo(map.value)

  /*
   * Geoman controls
   *
   * ابزارهای پیش‌فرض را مخفی می‌کنیم.
   * Drawing را خودمان بر اساس mappingType کنترل می‌کنیم.
   */
  map.value.pm.addControls({
    position: 'topleft',

    drawText: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawMarker: false,
    drawRectangle: false,

    drawPolygon: false,
    drawPolyline: false,

    editMode: true,
    dragMode: false,
    cutPolygon: false,
    removalMode: true,

    rotateMode: false,
  })

  /*
   * Event مربوط به شروع Drawing
   */
  map.value.on('pm:drawstart', handleDrawStart)

  /*
   * Event مربوط به ایجاد Shape
   */
  map.value.on('pm:create', handleShapeCreated)

  /*
   * Event مربوط به Edit
   */
  map.value.on('pm:edit', handleShapeEdited)

  /*
   * Event مربوط به حذف
   */
  map.value.on('pm:remove', handleShapeRemoved)

  /*
   * Event مربوط به شروع Edit
   */
  map.value.on('pm:globaleditmodetoggled', handleEditMode)

  /*
   * بعد از ساخت نقشه، داده قبلی Store را بازیابی کن.
   */
  restoreShapeFromStore()

  /*
   * اگر mappingType از قبل انتخاب شده،
   * Drawing را فعال کن.
   */
  if (mappingType.value) {
    startDrawing()
  }
}

/* -------------------------------------------------------------------------- */
/* Start drawing                                                              */
/* -------------------------------------------------------------------------- */

const startDrawing = () => {
  if (!map.value || !mappingType.value) {
    return
  }

  /*
   * اگر Shape قبلی وجود دارد،
   * اول Drawing جدید را شروع نمی‌کنیم.
   */
  if (currentLayer.value) {
    return
  }

  isDrawing.value = true

  /*
   * Area
   */
  if (mappingType.value === 'area') {
    map.value.pm.enableDraw('Polygon', {
      allowSelfIntersection: false,

      /*
       * بعد از ۳ نقطه می‌توان Polygon را بست.
       */
      finishOn: 'snap',

      snappable: true,

      snapDistance: 20,

      templineStyle: {
        color: '#008f55',
        weight: 3,
        dashArray: '6 6',
      },

      hintlineStyle: {
        color: '#008f55',
        weight: 2,
        dashArray: '5 5',
      },

      pathOptions: {
        color: '#008f55',
        fillColor: '#008f55',
        fillOpacity: 0.18,
        weight: 3,
      },
    })

    return
  }

  /*
   * Corridor
   */
  if (mappingType.value === 'corridor') {
    map.value.pm.enableDraw('Line', {
      allowSelfIntersection: true,

      /*
       * کاربر با Double Click مسیر را تمام می‌کند.
       */
      finishOn: 'dblclick',

      snappable: true,

      snapDistance: 20,

      templineStyle: {
        color: '#008f55',
        weight: 4,
        dashArray: '8 6',
      },

      hintlineStyle: {
        color: '#008f55',
        weight: 2,
        dashArray: '5 5',
      },

      pathOptions: {
        color: '#008f55',
        weight: 5,
        lineCap: 'round',
        lineJoin: 'round',
      },
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Draw start                                                                 */
/* -------------------------------------------------------------------------- */

const handleDrawStart = () => {
  isDrawing.value = true

  pointCount.value = 0
}

/* -------------------------------------------------------------------------- */
/* Shape created                                                              */
/* -------------------------------------------------------------------------- */

const handleShapeCreated = (event: any) => {
  if (!map.value) {
    return
  }

  /*
   * اگر Shape قبلی وجود داشت،
   * حذفش کن.
   */
  if (currentLayer.value) {
    map.value.removeLayer(currentLayer.value)
  }

  currentLayer.value = event.layer

  isDrawing.value = false

  pointCount.value = getLayerPointCount(event.layer)

  /*
   * فعال کردن Edit روی Shape
   */
  enableLayerEditing(event.layer)

  /*
   * ذخیره در Store
   */
  syncLayerToStore(event.layer)

  /*
   * Drawing دوباره خاموش شود.
   */
  map.value.pm.disableDraw()

  /*
   * روی Shape زوم کن.
   */
  fitCurrentShape()
}

/* -------------------------------------------------------------------------- */
/* Enable editing                                                             */
/* -------------------------------------------------------------------------- */

const enableLayerEditing = (layer: any) => {
  if (!layer?.pm) {
    return
  }

  layer.pm.enable({
    allowSelfIntersection: false,

    snappable: true,

    snapDistance: 20,
  })

  isEditing.value = true
}

/* -------------------------------------------------------------------------- */
/* Shape edited                                                               */
/* -------------------------------------------------------------------------- */

const handleShapeEdited = (event: any) => {
  const layer = event.layer

  if (!layer) {
    return
  }

  currentLayer.value = layer

  pointCount.value = getLayerPointCount(layer)

  syncLayerToStore(layer)
}

/* -------------------------------------------------------------------------- */
/* Edit mode                                                                  */
/* -------------------------------------------------------------------------- */

const handleEditMode = (event: any) => {
  isEditing.value = Boolean(event.enabled)
}

/* -------------------------------------------------------------------------- */
/* Shape removed                                                              */
/* -------------------------------------------------------------------------- */

const handleShapeRemoved = () => {
  currentLayer.value = null

  pointCount.value = 0

  isEditing.value = false

  store.clearPolygon()
}

/* -------------------------------------------------------------------------- */
/* Sync layer -> Store                                                        */
/* -------------------------------------------------------------------------- */

const syncLayerToStore = (layer: any) => {
  if (!layer) {
    return
  }

  const geoJsonFeature = layer.toGeoJSON()

  /*
   * GeoJSON
   */
  store.formData.geoJson = geoJsonFeature

  /*
   * Coordinates
   *
   * Store:
   * [lng, lat]
   */
  if (isAreaMode.value) {
    const polygon = geoJsonFeature.geometry?.coordinates?.[0]

    if (Array.isArray(polygon)) {
      store.formData.polygonCoordinates = polygon.map(
        (coordinate: number[]) => [coordinate[0], coordinate[1]] as Coordinate,
      )
    }

    /*
     * Area
     */
    const area = calculateGeoJsonArea(geoJsonFeature.geometry?.coordinates?.[0] ?? [])

    store.formData.calculatedArea = Number((area / 1_000_000).toFixed(2))

    store.formData.corridorLength = 0
  }

  /*
   * Corridor
   */
  if (isCorridorMode.value) {
    const line = geoJsonFeature.geometry?.coordinates ?? []

    store.formData.polygonCoordinates = line.map(
      (coordinate: number[]) => [coordinate[0], coordinate[1]] as Coordinate,
    )

    const length = calculateGeoJsonLength(line)

    store.formData.corridorLength = Number((length / 1000).toFixed(2))

    store.formData.calculatedArea = 0
  }

  pointCount.value = getLayerPointCount(layer)
}

/* -------------------------------------------------------------------------- */
/* Get point count                                                            */
/* -------------------------------------------------------------------------- */

const getLayerPointCount = (layer: any): number => {
  if (!layer) {
    return 0
  }

  const geometry = layer.toGeoJSON()?.geometry

  if (!geometry) {
    return 0
  }

  if (geometry.type === 'Polygon') {
    const coordinates = geometry.coordinates?.[0]

    if (!coordinates) {
      return 0
    }

    /*
     * آخرین نقطه Polygon معمولاً همان نقطه اول است.
     */
    return Math.max(0, coordinates.length - 1)
  }

  if (geometry.type === 'LineString') {
    return geometry.coordinates?.length ?? 0
  }

  return 0
}

/* -------------------------------------------------------------------------- */
/* Calculate Polygon area                                                     */
/* -------------------------------------------------------------------------- */

const calculateGeoJsonArea = (coordinates: number[][]): number => {
  if (coordinates.length < 3) {
    return 0
  }

  const earthRadius = 6378137

  let area = 0

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]

    const lat1Rad = (lat1 * Math.PI) / 180
    const lat2Rad = (lat2 * Math.PI) / 180

    const lng1Rad = (lng1 * Math.PI) / 180
    const lng2Rad = (lng2 * Math.PI) / 180

    area += (lng2Rad - lng1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad))
  }

  return Math.abs((area * earthRadius * earthRadius) / 2)
}

/* -------------------------------------------------------------------------- */
/* Calculate LineString length                                                 */
/* -------------------------------------------------------------------------- */

const calculateGeoJsonLength = (coordinates: number[][]): number => {
  if (coordinates.length < 2) {
    return 0
  }

  let total = 0

  for (let i = 1; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i - 1]
    const [lng2, lat2] = coordinates[i]

    const first = L.latLng(lat1, lng1)
    const second = L.latLng(lat2, lng2)

    total += first.distanceTo(second)
  }

  return total
}

/* -------------------------------------------------------------------------- */
/* Restore Shape                                                               */
/* -------------------------------------------------------------------------- */

const restoreShapeFromStore = () => {
  if (!map.value) {
    return
  }

  const coordinates = store.formData.polygonCoordinates

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return
  }

  /*
   * Polygon
   */
  if (isAreaMode.value && coordinates.length >= 3) {
    const latLngs = coordinates.map(([lng, lat]) => [lat, lng] as Coordinate)

    /*
     * اگر Polygon بسته نشده باشد،
     * Leaflet خودش آن را می‌بندد.
     */
    const polygon = L.polygon(latLngs, {
      color: '#008f55',
      fillColor: '#008f55',
      fillOpacity: 0.18,
      weight: 3,
    }).addTo(map.value)

    currentLayer.value = polygon

    enableLayerEditing(polygon)

    pointCount.value = coordinates.length

    fitCurrentShape()

    return
  }

  /*
   * Corridor
   */
  if (isCorridorMode.value && coordinates.length >= 2) {
    const latLngs = coordinates.map(([lng, lat]) => [lat, lng] as Coordinate)

    const polyline = L.polyline(latLngs, {
      color: '#008f55',
      weight: 5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map.value)

    currentLayer.value = polyline

    enableLayerEditing(polyline)

    pointCount.value = coordinates.length

    fitCurrentShape()
  }
}

/* -------------------------------------------------------------------------- */
/* Fit current shape                                                          */
/* -------------------------------------------------------------------------- */

const fitCurrentShape = () => {
  if (!map.value || !currentLayer.value) {
    return
  }

  const bounds = currentLayer.value.getBounds()

  if (!bounds.isValid()) {
    return
  }

  map.value.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 17,
  })
}

/* -------------------------------------------------------------------------- */
/* Clear current shape                                                        */
/* -------------------------------------------------------------------------- */

const clearCurrentShape = () => {
  if (!map.value) {
    return
  }

  if (currentLayer.value) {
    map.value.removeLayer(currentLayer.value)

    currentLayer.value = null
  }

  store.clearPolygon()

  pointCount.value = 0

  isEditing.value = false

  isDrawing.value = false

  /*
   * Drawing را خاموش می‌کنیم.
   */
  map.value.pm.disableDraw()
}

/* -------------------------------------------------------------------------- */
/* Restart drawing                                                            */
/* -------------------------------------------------------------------------- */

const restartDrawing = () => {
  clearCurrentShape()

  /*
   * کمی تأخیر برای جلوگیری از conflict
   * بین Geoman و Leaflet.
   */
  setTimeout(() => {
    startDrawing()
  }, 100)
}

/* -------------------------------------------------------------------------- */
/* Mapping type changed                                                       */
/* -------------------------------------------------------------------------- */

const handleMappingTypeChanged = (
  newType: 'area' | 'corridor' | null,
  oldType: 'area' | 'corridor' | null,
) => {
  if (newType === oldType) {
    return
  }

  clearCurrentShape()

  if (!newType) {
    return
  }

  setTimeout(() => {
    startDrawing()
  }, 150)
}

/* -------------------------------------------------------------------------- */
/* Watch mapping type                                                         */
/* -------------------------------------------------------------------------- */

watch(mappingType, (newType, oldType) => {
  handleMappingTypeChanged(newType, oldType)
})

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                  */
/* -------------------------------------------------------------------------- */

onMounted(() => {
  initializeMap()
})

onBeforeUnmount(() => {
  if (!map.value) {
    return
  }

  map.value.off('pm:drawstart', handleDrawStart)

  map.value.off('pm:create', handleShapeCreated)

  map.value.off('pm:edit', handleShapeEdited)

  map.value.off('pm:remove', handleShapeRemoved)

  map.value.off('pm:globaleditmodetoggled', handleEditMode)

  map.value.remove()

  map.value = null

  currentLayer.value = null
})
</script>

<template>
  <div class="w-full space-y-3" dir="rtl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="mr-5 mt-5">
        <h3 class="text-sm font-black text-gray-800">
          {{ isAreaMode ? 'محدوده پروژه' : isCorridorMode ? 'مسیر پروژه' : 'محدوده پروژه' }}
        </h3>

        <p class="text-[11px] text-gray-500 mt-1">
          <template v-if="isAreaMode">
            روی نقشه کلیک کنید و محدوده پروژه را مشخص کنید. برای اصلاح، نقاط را جابه‌جا کنید.
          </template>

          <template v-else-if="isCorridorMode">
            روی نقشه کلیک کنید و مسیر پروژه را مشخص کنید. برای پایان مسیر دوبار کلیک کنید.
          </template>

          <template v-else> ابتدا نوع پروژه را انتخاب کنید. </template>
        </p>
      </div>

      <!-- Stats -->
      <div v-if="mappingType" class="flex items-center gap-2">
        <div
          class="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600"
        >
          {{ pointCount }} نقطه
        </div>

        <div
          v-if="isAreaMode && store.formData.calculatedArea > 0"
          class="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-black text-[#008f55]"
        >
          {{ store.formData.calculatedArea }} هکتار
        </div>

        <div
          v-if="isCorridorMode && store.formData.corridorLength > 0"
          class="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-700"
        >
          {{ store.formData.corridorLength }} کیلومتر
        </div>
      </div>
    </div>

    <!-- Map -->
    <div class="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <div ref="mapContainer" class="w-full h-[430px] sm:h-[520px]"></div>

      <!-- Drawing hint -->
      <div v-if="mappingType && isDrawing" class="absolute top-3 right-3 z-20">
        <div
          class="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl px-4 py-3 border border-gray-100"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 bg-[#008f55] rounded-full animate-pulse"></span>

            <span class="text-[11px] font-bold text-gray-700">
              {{ isAreaMode ? 'در حال رسم محدوده...' : 'در حال رسم مسیر...' }}
            </span>
          </div>

          <p class="text-[10px] text-gray-400 mt-1">
            {{
              isAreaMode
                ? 'برای بستن محدوده روی نقطه اول کلیک کنید'
                : 'برای پایان مسیر دوبار کلیک کنید'
            }}
          </p>
        </div>
      </div>

      <!-- Completed state -->
      <div v-if="currentLayer && !isDrawing" class="absolute top-3 right-3 z-20">
        <div
          class="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl px-4 py-3 border border-emerald-100"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#008f55] text-[10px]"
            >
              ✓
            </span>

            <span class="text-[11px] font-bold text-gray-700">
              {{ isAreaMode ? 'محدوده ثبت شد' : 'مسیر ثبت شد' }}
            </span>
          </div>

          <p class="text-[10px] text-gray-400 mt-1">نقاط را بکشید تا محدوده را اصلاح کنید.</p>
        </div>
      </div>

      <!-- Bottom actions -->
      <div v-if="currentLayer && !isDrawing" class="absolute bottom-3 mr-30 right-3 z-20">
        <button
          type="button"
          @click="restartDrawing"
          class="px-4 py-2.5 bg-red-400 text-white rounded-xl shadow-lg border border-gray-200 text-[11px] font-bold hover:bg-gray-50 transition-all"
        >
          ↻ رسم مجدد
        </button>
      </div>
    </div>

    <!-- Calculation summary -->
    <div v-if="currentLayer && !isDrawing" class="grid grid-cols-2 gap-3">
      <!-- Area -->
      <div v-if="isAreaMode" class="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
        <div class="text-[10px] text-gray-500 mb-1">مساحت محدوده</div>

        <div class="text-sm font-black text-[#008f55]">
          {{ store.formData.calculatedArea }}
          هکتار
        </div>
      </div>

      <!-- Corridor -->
      <div v-if="isCorridorMode" class="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <div class="text-[10px] text-gray-500 mb-1">طول مسیر</div>

        <div class="text-sm font-black text-blue-700">
          {{ store.formData.corridorLength }}
          کیلومتر
        </div>
      </div>

      <!-- Points -->
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-3">
        <div class="text-[10px] text-gray-500 mb-1">تعداد نقاط</div>

        <div class="text-sm font-black text-gray-700">
          {{ pointCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  background: #f3f4f6;
  z-index: 1; /* Keep the base map low in the stacking context */
}

/* Lower the z-index of interactive map overlays, hints, and controls */
:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 10 !important;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12) !important;
}

:deep(.leaflet-control-zoom a) {
  width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  font-size: 18px !important;
  color: #374151 !important;
  background: white !important;
  border: none !important;
}

:deep(.leaflet-control-zoom a:first-child) {
  border-radius: 10px 10px 0 0;
}

:deep(.leaflet-control-zoom a:last-child) {
  border-radius: 0 0 10px 10px;
}

:deep(.leaflet-pm-toolbar) {
  display: none !important;
}

:deep(.leaflet-pm-icon) {
  display: none;
}

:deep(.leaflet-tooltip) {
  font-family: inherit;
}
</style>
