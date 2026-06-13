<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'
import LeafletBoundaryMap from '../map/LeafletBoundaryMap.vue'

const store = useProjectStore()

const iranUtmZones = ['38N', '39N', '40N', '41N']

const handleBoundaryFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (!target.files?.length) return

  store.addFiles(Array.from(target.files))

  target.value = ''
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <!-- انتخاب روش تعیین محدوده -->

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1">
        محدوده پروژه را چگونه مشخص می‌کنید؟
      </label>

      <div class="flex bg-gray-100 p-1.5 rounded-xl max-w-md">
        <button
          type="button"
          @click="store.formData.areaSelectionMethod = 'map'"
          class="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all"
          :class="
            store.formData.areaSelectionMethod === 'map'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          "
        >
          🗺️ رسم روی نقشه
        </button>

        <button
          type="button"
          @click="store.formData.areaSelectionMethod = 'upload'"
          class="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all"
          :class="
            store.formData.areaSelectionMethod === 'upload'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          "
        >
          📂 آپلود فایل
        </button>
      </div>
    </div>

    <!-- رسم روی نقشه -->

    <div v-if="store.formData.areaSelectionMethod === 'map'" class="space-y-4">
      <LeafletBoundaryMap />

      <div
        v-if="store.formData.calculatedArea > 0"
        class="bg-emerald-50 border border-emerald-100 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-600"> مساحت محدوده برداشت شده </span>

          <span class="font-black text-[#008f55]">
            {{ store.formData.calculatedArea }}
            هکتار
          </span>
        </div>
      </div>

      <div
        v-if="store.formData.polygonCoordinates.length"
        class="bg-white border border-gray-200 rounded-xl p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-gray-600"> تعداد نقاط ثبت شده </span>

          <span class="text-sm font-black text-gray-800">
            {{ store.formData.polygonCoordinates.length }}
          </span>
        </div>

        <button type="button" @click="store.clearPolygon()" class="text-red-500 text-xs font-bold">
          حذف محدوده رسم شده
        </button>
      </div>
    </div>

    <!-- آپلود فایل -->

    <div v-if="store.formData.areaSelectionMethod === 'upload'" class="space-y-4">
      <div class="border border-dashed border-gray-200 bg-gray-50 rounded-xl p-6 text-center">
        <input
          id="boundary-file-input"
          type="file"
          multiple
          accept=".kml,.kmz,.zip,.geojson,.json"
          class="hidden"
          @change="handleBoundaryFileChange"
        />

        <p class="text-xs text-gray-500 font-medium mb-3">فایل محدوده پروژه را بارگذاری کنید</p>

        <label
          for="boundary-file-input"
          class="inline-block bg-white border border-gray-200 px-4 py-2 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-gray-50"
        >
          انتخاب فایل
        </label>
      </div>

      <div v-if="store.uploadedFiles.length" class="space-y-2">
        <div
          v-for="(file, index) in store.uploadedFiles"
          :key="index"
          class="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span>📄</span>

            <span class="text-xs text-gray-700">
              {{ file.name }}
            </span>
          </div>

          <button
            type="button"
            @click="store.removeFile(index)"
            class="text-red-500 text-xs font-bold"
          >
            حذف
          </button>
        </div>
      </div>
    </div>

    <hr class="border-gray-100" />

    <!-- سیستم مختصات -->

    <div class="space-y-4">
      <label class="block text-xs font-bold text-gray-600 mr-1"> سیستم مختصات مرجع پروژه </label>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label
          v-for="sys in [
            {
              id: 'WGS84',
              title: 'WGS84',
            },
            {
              id: 'UTM',
              title: 'UTM',
            },
            {
              id: 'Local',
              title: 'Local',
            },
          ]"
          :key="sys.id"
          class="border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all"
          :class="
            store.formData.coordinateSystem === sys.id
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200'
          "
        >
          <span class="text-xs font-bold">
            {{ sys.title }}
          </span>

          <input
            v-model="store.formData.coordinateSystem"
            :value="sys.id"
            type="radio"
            class="accent-[#008f55]"
          />
        </label>
      </div>

      <div
        v-if="store.formData.coordinateSystem === 'UTM'"
        class="bg-gray-50 border border-gray-100 rounded-xl p-4"
      >
        <label class="block text-xs font-bold text-gray-500 mb-3"> زون UTM پروژه </label>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="zone in iranUtmZones"
            :key="zone"
            type="button"
            @click="store.formData.utmZone = zone"
            class="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
            :class="
              store.formData.utmZone === zone
                ? 'bg-[#008f55] border-[#008f55] text-white'
                : 'bg-white border-gray-200 text-gray-600'
            "
          >
            Zone {{ zone }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
