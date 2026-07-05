<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import {
  LeafletMap,
  LeafletBoundaryMap,
  LeafletGeoJson,
  LeafletMarkerMap,
} from '@/components/map/mapTab'

const store = useProjectStore()

const project = computed(() => store.projectDetails)

const geoJson = computed(() => project.value?.geoJson)

const polygon = computed(() => project.value?.polygonCoordinates)
console.log(project.value)
console.log(geoJson.value)
console.log(polygon.value)
</script>

<template>
  <div class="space-y-5">
    <div class="overflow-hidden rounded-2xl border border-gray-200">
      <div class="h-[600px]">
        <LeafletMap>
          <LeafletGeoJson v-if="geoJson" :geo-json="geoJson" />

          <LeafletBoundaryMap v-else-if="polygon" :polygon="polygon" />
        </LeafletMap>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-2 font-semibold">اطلاعات مکانی</h3>

      <pre class="overflow-auto text-xs"
        >{{ JSON.stringify(geoJson ?? polygon, null, 2) }}
      </pre>
    </div>
  </div>
</template>
