<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import LeafletBoundaryMap from '../map/LeafletBoundaryMap.vue'

const store = useProjectStore()

const showCoordinateSettings = ref(false)

const handleBoundaryFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  store.addFiles(Array.from(target.files))
  target.value = ''
}

// مقداردهی پیش‌فرض امن
onMounted(() => {
  if (!store.formData.areaSelectionMethod) {
    store.formData.areaSelectionMethod = 'map'
  }

  if (!store.formData.coordinateSystem) {
    store.formData.coordinateSystem = 'WGS84'
  }

  if (!store.formData.utmZone) {
    store.formData.utmZone = 'auto'
  }
})
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
          class="flex-1 py-2.5 text-xs font-bold rounded-lg"
          :class="
            store.formData.areaSelectionMethod === 'map'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-400'
          "
        >
          🗺️ رسم روی نقشه
        </button>

        <button
          type="button"
          @click="store.formData.areaSelectionMethod = 'upload'"
          class="flex-1 py-2.5 text-xs font-bold rounded-lg"
          :class="
            store.formData.areaSelectionMethod === 'upload'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-400'
          "
        >
          📂 آپلود فایل
        </button>
      </div>
    </div>

    <!-- حالت نقشه -->
    <div v-if="store.formData.areaSelectionMethod === 'map'" class="space-y-4">
      <div class="relative overflow-hidden rounded-2xl border">
        <LeafletBoundaryMap />
      </div>

      <div v-if="store.formData.calculatedArea > 0" class="bg-emerald-50 border rounded-xl p-4">
        <div class="flex justify-between">
          <span class="text-xs">مساحت:</span>
          <span class="font-bold text-emerald-700">
            {{ store.formData.calculatedArea }} هکتار
          </span>
        </div>
      </div>

      <div v-if="store.formData.polygonCoordinates.length" class="bg-white border rounded-xl p-4">
        <div class="flex justify-between mb-2">
          <span class="text-xs font-bold">نقاط ثبت شده</span>
          <span class="text-sm font-bold">
            {{ store.formData.polygonCoordinates.length }}
          </span>
        </div>

        <button type="button" @click="store.clearPolygon()" class="text-red-500 text-xs font-bold">
          پاک کردن محدوده
        </button>
      </div>
    </div>

    <!-- حالت آپلود -->
    <div v-if="store.formData.areaSelectionMethod === 'upload'" class="space-y-4">
      <div class="border-dashed border p-6 rounded-xl text-center bg-gray-50">
        <input
          type="file"
          multiple
          class="hidden"
          id="fileInput"
          accept=".kml,.kmz,.geojson,.json,.zip"
          @change="handleBoundaryFileChange"
        />

        <label
          for="fileInput"
          class="cursor-pointer text-xs font-bold bg-white px-4 py-2 rounded-lg border"
        >
          انتخاب فایل
        </label>
      </div>

      <div v-if="store.uploadedFiles.length" class="space-y-2">
        <div
          v-for="(file, index) in store.uploadedFiles"
          :key="index"
          class="flex justify-between border p-3 rounded-lg"
        >
          <span class="text-xs">{{ file.name }}</span>

          <button type="button" @click="store.removeFile(index)" class="text-red-500 text-xs">
            حذف
          </button>
        </div>
      </div>
    </div>

    <!-- تنظیمات پیشرفته -->
    <div class="pt-4">
      <button
        type="button"
        @click="showCoordinateSettings = !showCoordinateSettings"
        class="text-xs font-bold text-gray-500"
      >
        ⚙️ تنظیمات مختصات
      </button>
    </div>

    <div v-if="showCoordinateSettings" class="space-y-4 p-4 border rounded-xl">
      <!-- سیستم مختصات -->
      <div class="grid gap-3">
        <label class="flex justify-between border p-3 rounded-lg">
          <span class="text-xs">WGS84</span>
          <input type="radio" v-model="store.formData.coordinateSystem" value="WGS84" />
        </label>

        <label class="flex justify-between border p-3 rounded-lg">
          <span class="text-xs">UTM</span>
          <input type="radio" v-model="store.formData.coordinateSystem" value="UTM" />
        </label>

        <label class="flex justify-between border p-3 rounded-lg">
          <span class="text-xs">Local</span>
          <input type="radio" v-model="store.formData.coordinateSystem" value="Local" />
        </label>
      </div>

      <!-- UTM Zone -->
      <div v-if="store.formData.coordinateSystem === 'UTM'" class="flex gap-2 flex-wrap">
        <button
          v-for="zone in ['auto', '38N', '39N', '40N', '41N']"
          :key="zone"
          type="button"
          @click="store.formData.utmZone = zone"
          class="px-3 py-1 border rounded text-xs"
          :class="store.formData.utmZone === zone ? 'bg-green-600 text-white' : ''"
        >
          {{ zone }}
        </button>
      </div>
    </div>
  </div>
</template>
