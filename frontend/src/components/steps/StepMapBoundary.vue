<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '../../stores/project.store'
import LeafletBoundaryMap from '../map/LeafletBoundaryMap.vue'

const store = useProjectStore()

// مدیریت نمایش/مخفی کردن بخش سیستم مختصات تخصصی
const showCoordinateSettings = ref(false)

const iranUtmZones = ['auto', '38N', '39N', '40N', '41N']

const handleBoundaryFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return
  store.addFiles(Array.from(target.files))
  target.value = ''
}

// مقداردهی پیش‌فرض‌های امن برای کاربر غیرفنی
onMounted(() => {
  if (!store.formData.areaSelectionMethod) {
    store.formData.areaSelectionMethod = 'map' // پیش‌فرض رسم روی نقشه که ملموس‌تر است
  }
  if (!store.formData.coordinateSystem) {
    store.formData.coordinateSystem = 'WGS84' // سیستم مختصات پیش‌فرض استاندارد وب
  }
  if (!store.formData.utmZone) {
    store.formData.utmZone = 'auto' // زون پیش‌فرض روی حالت خودکار
  }
})
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
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
          🗺️ رسم روی نقشه (پیشنهادی)
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
          📂 آپلود فایل نقشه
        </button>
      </div>
    </div>

    <div v-if="store.formData.areaSelectionMethod === 'map'" class="space-y-4">
      <p class="text-[11px] text-gray-400 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
        💡 <strong>راهنما:</strong> با کلیک روی نقشه، گوشه‌های محدوده زمین خود را علامت بزنید تا یک
        چندضلعی تشکیل شود.
      </p>

      <div class="relative z-0 overflow-hidden rounded-2xl border border-gray-100">
        <LeafletBoundaryMap />
      </div>

      <div
        v-if="store.formData.calculatedArea > 0"
        class="bg-emerald-50 border border-emerald-100 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-600"> مساحت محاسبه شده بر اساس رسم شما: </span>
          <span class="font-black text-[#008f55]"> {{ store.formData.calculatedArea }} هکتار </span>
        </div>
      </div>

      <div
        v-if="store.formData.polygonCoordinates.length"
        class="bg-white border border-gray-200 rounded-xl p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-gray-600"> تعداد نقاط ثبت شده </span>
          <span class="text-sm font-black text-gray-800">
            {{ store.formData.polygonCoordinates.length - 1 }}
          </span>
        </div>
        <button type="button" @click="store.clearPolygon()" class="text-red-500 text-xs font-bold">
          پاک کردن کل محدوده و رسم مجدد
        </button>
      </div>
    </div>

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

        <p class="text-xs text-gray-700 font-bold mb-1">
          فایل دیجیتال محدوده پروژه را بارگذاری کنید
        </p>
        <p class="text-[10px] text-gray-400 mb-4">
          فرمت‌های مجاز: KML (گوگل‌ارث)، GeoJSON یا فایل‌های مختصات ZIP
        </p>

        <label
          for="boundary-file-input"
          class="inline-block bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-50 shadow-sm transition-all"
        >
          انتخاب فایل از روی دستگاه
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
            <span class="text-xs text-gray-700 font-medium">{{ file.name }}</span>
          </div>
          <button
            type="button"
            @click="store.removeFile(index)"
            class="text-red-500 text-xs font-bold"
          >
            حذف فایل
          </button>
        </div>
      </div>
    </div>

    <hr class="border-gray-100" />

    <div class="flex justify-start">
      <button
        type="button"
        @click="showCoordinateSettings = !showCoordinateSettings"
        class="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-gray-100/70 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-all"
      >
        <span>{{
          showCoordinateSettings
            ? '➖ پنهان کردن تنظیمات پیشرفته مختصات'
            : '⚙️ تنظیمات پیشرفته سیستم مختصات (اختیاری)'
        }}</span>
      </button>
    </div>

    <div
      v-if="showCoordinateSettings"
      class="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 transition-all duration-300"
    >
      <label class="block text-xs font-bold text-gray-600 mr-1"> سیستم مختصات مرجع پروژه </label>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label
          v-for="sys in [
            { id: 'WGS84', title: 'WGS84 (سیستم جهانی دسیمل)' },
            { id: 'UTM', title: 'UTM (سیستم متری کشوری)' },
            { id: 'Local', title: 'Local (سیستم محلی مستقل)' },
          ]"
          :key="sys.id"
          class="border rounded-xl p-4 flex items-center justify-between cursor-pointer bg-white transition-all"
          :class="
            store.formData.coordinateSystem === sys.id
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200'
          "
        >
          <span class="text-xs font-bold text-gray-700">{{ sys.title }}</span>
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
        class="bg-white border border-gray-200 rounded-xl p-4"
      >
        <label class="block text-xs font-bold text-gray-600 mb-3">
          زون UTM پروژه را مشخص کنید
        </label>

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
                : 'bg-gray-100 border-gray-200 text-gray-600'
            "
          >
            {{ zone === 'auto' ? 'تشخیص خودکار توسط کارشناس' : 'Zone ' + zone }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
