<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// ابزارها و متدهای برداشت فنی حوزه نقشه‌برداری
const technicalTypes = [
  { id: 'gps-rtk', name: 'برداشت با GPS / RTK' },
  { id: 'total-station', name: 'برداشت زمینی (توتال استیشن)' },
  { id: 'uav', name: 'فتوگرامتری با پهپاد' },
  { id: 'lidar', name: 'اسکن لیزری / LiDAR' },
  { id: 'processing', name: 'پردازش داده و ژئورفرنس' },
  { id: 'cadastral', name: 'کاداستر و تفکیک اراضی' },
]

// فرمت‌های استاندارد خروجی مهندسی نقشه
const outputFormats = [
  { id: 'dwg', name: 'DWG (اتوکد)' },
  { id: 'dxf', name: 'DXF (تبادلی)' },
  { id: 'shp', name: 'Shapefile (GIS)' },
  { id: 'geojson', name: 'GeoJSON' },
  { id: 'kml', name: 'KML / KMZ' },
  { id: 'tiff', name: 'Orthomosaic (TIFF)' },
  { id: 'pdf', name: 'نقشه خروجی (PDF)' },
]

// گزینه‌های دقت مورد نیاز پروژه
const accuracyOptions = [
  { id: 'sub-cm', title: 'دقت میلی‌متری (صنعتی / مانیتورینگ)', desc: 'کمتر از ۱ سانتی‌متر' },
  { id: '1-5cm', title: 'دقت بالا (نقشه‌های شهری و ثبتی)', desc: 'بین ۱ تا ۵ سانتی‌متر' },
  { id: '5-20cm', title: 'دقت متوسط (توپوگرافی و اراضی بزرگ)', desc: 'بین ۵ تا ۲۰ سانتی‌متر' },
  { id: 'above-20cm', title: 'دقت عمومی (مطالعات اولیه و GIS)', desc: 'بالاتر از ۲۰ سانتی‌متر' },
]

// متدهای مدیریت انتخاب‌های چندگانه (Multi-select) در استور پینیا
const toggleTechType = (id: string) => {
  if (store.formData.techType.includes(id)) {
    store.formData.techType = store.formData.techType.filter((item) => item !== id)
  } else {
    store.formData.techType.push(id)
  }
}

const toggleOutputFormat = (id: string) => {
  if (store.formData.outputFormats.includes(id)) {
    store.formData.outputFormats = store.formData.outputFormats.filter((item) => item !== id)
  } else {
    store.formData.outputFormats.push(id)
  }
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >۱. متد یا نوع پروژه نقشه‌برداری چیست؟ (یک یا چند مورد)</label
      >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tech in technicalTypes"
          :key="tech.id"
          type="button"
          @click="toggleTechType(tech.id)"
          class="px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer"
          :class="
            store.formData.techType.includes(tech.id)
              ? 'bg-[#008f55] border-[#008f55] text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          "
        >
          {{ tech.name }}
        </button>
      </div>
    </div>

    <hr class="border-gray-100 my-2" />

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >۲. فایل‌های خروجی را در چه فرمت‌هایی تحویل می‌گیرید؟</label
      >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="format in outputFormats"
          :key="format.id"
          type="button"
          @click="toggleOutputFormat(format.id)"
          class="px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer"
          :class="
            store.formData.outputFormats.includes(format.id)
              ? 'bg-gray-800 border-gray-800 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          "
        >
          {{ format.name }}
        </button>
      </div>
    </div>

    <hr class="border-gray-100 my-2" />

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >۳. سطح دقت زمینی (خطای مجاز هندسی) پروژه چقدر باشد؟</label
      >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          v-for="acc in accuracyOptions"
          :key="acc.id"
          class="border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all bg-white"
          :class="
            store.formData.requiredAccuracy === acc.id
              ? 'border-[#008f55] bg-emerald-50/10 ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/40'
          "
        >
          <div>
            <h4 class="text-xs font-bold text-gray-800">{{ acc.title }}</h4>
            <p class="text-[10px] text-gray-400 mt-1">{{ acc.desc }}</p>
          </div>
          <input
            type="radio"
            :value="acc.id"
            v-model="store.formData.requiredAccuracy"
            class="accent-[#008f55] h-4 w-4"
          />
        </label>
      </div>
    </div>
  </div>
</template>
