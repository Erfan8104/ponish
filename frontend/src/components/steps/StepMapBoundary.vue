<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// زون‌های پرکاربرد ایران در سیستم UTM برای راهنمایی بهتر کاربر
const iranUtmZones = ['38N', '39N', '40N', '41N']

// شبیه‌سازی متد آپلود فایل نقشه‌برداری در استور
const handleBoundaryFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    // افزودن فایل به باندل فایل‌های استور مرکزی
    store.addFiles(Array.from(target.files))
    target.value = ''
  }
}

// برای شبیه‌سازی رسم روی نقشه در این بخش از کامپوننت (تا قبل از کانفیگ کامل Leaflet در محیط شما)
// یک متد تستی می‌گذاریم که با کلیک روی آن، یک مختصات نمونه و مساحت فرضی در استور پر شود
const simulateMapDrawing = () => {
  store.formData.polygonCoordinates = [
    [35.6892, 51.389],
    [35.69, 51.39],
    [35.688, 51.391],
  ]
  store.formData.calculatedArea = 4.2 // ۴.۲ هکتار نمونه
}

const clearDrawings = () => {
  store.formData.polygonCoordinates = []
  store.formData.calculatedArea = 0
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >روش تعیین محدوده یا ابعاد زمین چطور باشد؟</label
      >
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
          📂 آپلود فایل (KML / KMZ)
        </button>
      </div>
    </div>

    <div v-if="store.formData.areaSelectionMethod === 'map'" class="space-y-4">
      <div
        class="relative bg-gray-100 rounded-2xl w-full aspect-video md:h-80 border border-gray-200 overflow-hidden flex flex-col items-center justify-center text-center p-4"
      >
        <div class="z-10 space-y-3">
          <span class="text-3xl">🛰️</span>
          <p class="text-xs font-bold text-gray-700">باکس شبیه‌ساز نقشه ماهواره‌ای</p>
          <p class="text-[11px] text-gray-400 max-w-sm mx-auto">
            در پروژه واقعی، نقشه این‌جا لود می‌شود و کاربر با کلیک روی محیط، چندضلعی ترسیم می‌کند.
          </p>

          <div class="flex justify-center gap-2 pt-2">
            <button
              type="button"
              @click="simulateMapDrawing"
              class="bg-[#008f55] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
            >
              شبیه‌سازی رسم محدوده
            </button>
            <button
              v-if="store.formData.polygonCoordinates.length > 0"
              type="button"
              @click="clearDrawings"
              class="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-100"
            >
              پاک کردن نقشه
            </button>
          </div>
        </div>
        <div
          class="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"
        ></div>
      </div>

      <div
        v-if="store.formData.calculatedArea > 0"
        class="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 flex items-center justify-between"
      >
        <span class="text-xs text-gray-600 font-medium">مساحت محاسبه شده روی نقشه:</span>
        <span class="text-sm font-black text-[#008f55] tabular-nums"
          >{{ store.formData.calculatedArea }}
          <span class="text-xs font-bold text-gray-500 mr-0.5">هکتار</span></span
        >
      </div>
    </div>

    <div v-if="store.formData.areaSelectionMethod === 'upload'" class="space-y-4">
      <div class="border border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-6 text-center">
        <input
          type="file"
          id="boundary-file-input"
          accept=".kml,.kmz,.shp"
          class="hidden"
          @change="handleBoundaryFileChange"
        />
        <p class="text-xs text-gray-500 font-medium mb-3">
          فایل مرز پروژه (با فرمت‌های KML یا KMZ) را انتخاب کنید
        </p>
        <button
          type="button"
          @click="() => document.getElementById('boundary-file-input')?.click()"
          class="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm"
        >
          انتخاب فایل نقشه
        </button>
      </div>
    </div>

    <hr class="border-gray-100 my-2" />

    <div class="space-y-4">
      <label class="block text-xs font-bold text-gray-600 mr-1">سیستم مختصات مرجع پروژه</label>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label
          v-for="sys in [
            { id: 'WGS84', t: 'WGS 84 (جهانی)' },
            { id: 'UTM', t: 'UTM (متریک)' },
            { id: 'Local', t: 'Local (محلی/محاطی)' },
          ]"
          :key="sys.id"
          class="border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all bg-white"
          :class="
            store.formData.coordinateSystem === sys.id
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/40'
          "
        >
          <span class="text-xs font-bold text-gray-700">{{ sys.t }}</span>
          <input
            type="radio"
            :value="sys.id"
            v-model="store.formData.coordinateSystem"
            class="accent-[#008f55] h-4 w-4"
          />
        </label>
      </div>

      <div
        v-if="store.formData.coordinateSystem === 'UTM'"
        class="bg-gray-50 border border-gray-100 rounded-xl p-4 animate-in"
      >
        <label class="block text-xs font-bold text-gray-500 mb-2 mr-1"
          >زون تصویر (UTM Zone) مربوط به محدوده چیست؟</label
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="zone in iranUtmZones"
            :key="zone"
            type="button"
            @click="store.formData.utmZone = zone"
            class="px-4 py-2 text-xs font-bold rounded-lg border transition-all"
            :class="
              store.formData.utmZone === zone
                ? 'bg-[#008f55] border-[#008f55] text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            "
          >
            Zone {{ zone }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
