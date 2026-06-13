<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

const technicalServices = [
  {
    id: 'gps',
    title: 'GPS',
    icon: '📡',
  },
  {
    id: 'rtk',
    title: 'RTK',
    icon: '📍',
  },
  {
    id: 'totalstation',
    title: 'توتال استیشن',
    icon: '📐',
  },
  {
    id: 'uav',
    title: 'فتوگرامتری پهپادی',
    icon: '🚁',
  },
  {
    id: 'lidar',
    title: 'LiDAR',
    icon: '🌐',
  },
  {
    id: 'gis',
    title: 'GIS',
    icon: '🗺️',
  },
  {
    id: 'cadastre',
    title: 'کاداستر',
    icon: '📋',
  },
]

const outputFormats = [
  'DWG',
  'DXF',
  'SHP',
  'GeoJSON',
  'KML',
  'PDF',
  'Orthophoto',
  'DEM',
  'Contours',
]

const accuracies = ['1-2cm', '2-5cm', '5-10cm', '10-20cm', '20cm+']

const toggleService = (id: string) => {
  const index = store.formData.techType.indexOf(id)

  if (index === -1) {
    store.formData.techType.push(id)
  } else {
    store.formData.techType.splice(index, 1)
  }
}

const toggleOutput = (format: string) => {
  const index = store.formData.outputFormats.indexOf(format)

  if (index === -1) {
    store.formData.outputFormats.push(format)
  } else {
    store.formData.outputFormats.splice(index, 1)
  }
}
</script>

<template>
  <div class="space-y-8 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> خدمات مورد نیاز </label>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="item in technicalServices"
          :key="item.id"
          type="button"
          @click="toggleService(item.id)"
          class="border rounded-xl p-4 transition-all"
          :class="
            store.formData.techType.includes(item.id)
              ? 'border-[#008f55] bg-emerald-50'
              : 'border-gray-200 bg-white'
          "
        >
          <div class="text-xl mb-2">
            {{ item.icon }}
          </div>

          <div class="text-xs font-bold">
            {{ item.title }}
          </div>
        </button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> فرمت خروجی مورد نیاز </label>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="format in outputFormats"
          :key="format"
          type="button"
          @click="toggleOutput(format)"
          class="px-4 py-2 rounded-lg border text-xs font-bold transition-all"
          :class="
            store.formData.outputFormats.includes(format)
              ? 'bg-[#008f55] text-white border-[#008f55]'
              : 'bg-white border-gray-200 text-gray-600'
          "
        >
          {{ format }}
        </button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> دقت مورد نیاز </label>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <label
          v-for="acc in accuracies"
          :key="acc"
          class="border rounded-xl p-3 cursor-pointer flex items-center justify-between"
          :class="
            store.formData.requiredAccuracy === acc
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200'
          "
        >
          <span class="text-xs font-bold">
            {{ acc }}
          </span>

          <input
            type="radio"
            :value="acc"
            v-model="store.formData.requiredAccuracy"
            class="accent-[#008f55]"
          />
        </label>
      </div>
    </div>
  </div>
</template>
