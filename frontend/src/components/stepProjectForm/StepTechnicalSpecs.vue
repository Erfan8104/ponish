<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// وضعیت باز یا بسته بودن بخش‌های کشویی (Accordion)
const activeAccordion = ref<string | null>('ground') // پیش‌فرض می‌توانیم بخش زمینی را باز بگذاریم یا همه را بسته (null) بگذاریم

const toggleAccordion = (section: string) => {
  activeAccordion.value = activeAccordion.value === section ? null : section
}

// گزینه‌های نمونه برای مشخصات فنی (می‌توانید مطابق با داده‌های خودتان تکمیل یا از استور بگیرید)
const groundOptions = [
  'برداشت توپوگرافی با دوربین توتال استیشن',
  'تهیه پروفیل طولی و عرضی',
  'پیاده‌سازی نقشه و میخ‌کوبی (Staking out)',
  'کنترل شاقولی ستون‌ها و سازه‌ها',
  'برداشت کاداستر و تفکیک اراضی',
]

const aerialOptions = [
  'تولید ارتوفتو (Orthomosaic) با پهپاد',
  'تهیه مدل رقومی ارتفاعی زمین (DEM / DTM)',
  'محاسبه حجم عملیات خاکی (احجام)',
  'ابر نقاط (Point Cloud) با دقت بالا',
]

const gisOptions = [
  'ورود داده‌ها و ژئورفرنس کردن نقشه‌ها',
  'تحلیل‌های مکانی و پهنه‌بندی',
  'طراحی پایگاه داده توصیفی و مکانی (Geodatabase)',
  'تهیه نقشه‌های موضوعی (Thematic Maps)',
]

const equipmentOptions = [
  'دوربین توتال استیشن مهندسی',
  'گیرنده دوفرکانسه GNSS / GPS سه فرکانسه',
  'پهپاد نقشه‌برداری (RTK/PPK)',
  'اسکنر لیزری زمینی (TLS)',
  'تراز دیجیتال',
]

const outputFormatsList = [
  'فرمت اتوکد (DWG / DXF)',
  'فرمت‌های GIS (Shapefile / GeoPackage)',
  'گزارش محاسبات و فایل اکسل (Excel)',
  'گزارش PDF ممهور به مهر نظام مهندسی یا کارشناس',
  'فایل‌های تصویری و ارتوایج (GeoTIFF)',
]
</script>

<template>
  <div class="space-y-4 text-right" dir="rtl">
    <div
      class="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 leading-relaxed"
    >
      💡 **راهنمایی:** انتخاب این بخش‌ها اختیاری است. اگر برای پروژه خود مشخصات فنی یا تجهیزات خاصی
      مد نظر دارید، روی عنوان هر بخش کلیک کنید تا گزینه‌های آن نمایش داده شوند.
    </div>

    <!-- ۱. مشخصات فنی نقشه‌برداری زمینی -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all">
      <button
        type="button"
        @click="toggleAccordion('ground')"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-800 text-sm"
      >
        <span class="flex items-center gap-2">
          📍 مشخصات فنی نقشه‌برداری زمینی
          <span
            v-if="store.formData.groundTechnicalSpecs?.length > 0"
            class="bg-emerald-100 text-[#008f55] text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ store.formData.groundTechnicalSpecs.length }} انتخاب شده
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180': activeAccordion === 'ground' }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-show="activeAccordion === 'ground'" class="p-4 border-t border-gray-100 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            v-for="item in groundOptions"
            :key="item"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="store.formData.groundTechnicalSpecs"
              class="w-4 h-4 text-[#008f55] rounded border-gray-300 focus:ring-[#008f55]"
            />
            <span class="text-xs text-gray-700 font-medium">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ۲. مشخصات فنی فتوگرامتری و پهپاد -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all">
      <button
        type="button"
        @click="toggleAccordion('aerial')"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-800 text-sm"
      >
        <span class="flex items-center gap-2">
          ✈️ مشخصات فنی پهپاد و فتوگرامتری
          <span
            v-if="store.formData.aerialTechnicalSpecs?.length > 0"
            class="bg-emerald-100 text-[#008f55] text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ store.formData.aerialTechnicalSpecs.length }} انتخاب شده
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180': activeAccordion === 'aerial' }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-show="activeAccordion === 'aerial'" class="p-4 border-t border-gray-100 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            v-for="item in aerialOptions"
            :key="item"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="store.formData.aerialTechnicalSpecs"
              class="w-4 h-4 text-[#008f55] rounded border-gray-300 focus:ring-[#008f55]"
            />
            <span class="text-xs text-gray-700 font-medium">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ۳. مشخصات کارتوگرافی و GIS -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all">
      <button
        type="button"
        @click="toggleAccordion('gis')"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-800 text-sm"
      >
        <span class="flex items-center gap-2">
          🗺️ سیستم اطلاعات جغرافیایی (GIS) و کارتوگرافی
          <span
            v-if="store.formData.gisTechnicalSpecs?.length > 0"
            class="bg-emerald-100 text-[#008f55] text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ store.formData.gisTechnicalSpecs.length }} انتخاب شده
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180': activeAccordion === 'gis' }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-show="activeAccordion === 'gis'" class="p-4 border-t border-gray-100 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            v-for="item in gisOptions"
            :key="item"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="store.formData.gisTechnicalSpecs"
              class="w-4 h-4 text-[#008f55] rounded border-gray-300 focus:ring-[#008f55]"
            />
            <span class="text-xs text-gray-700 font-medium">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ۴. تجهیزات مورد نیاز -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all">
      <button
        type="button"
        @click="toggleAccordion('equipment')"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-800 text-sm"
      >
        <span class="flex items-center gap-2">
          ⚙️ تجهیزات مورد نیاز پیشنهادی
          <span
            v-if="store.formData.requiredEquipment?.length > 0"
            class="bg-emerald-100 text-[#008f55] text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ store.formData.requiredEquipment.length }} انتخاب شده
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180': activeAccordion === 'equipment' }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-show="activeAccordion === 'equipment'" class="p-4 border-t border-gray-100 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            v-for="item in equipmentOptions"
            :key="item"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="store.formData.requiredEquipment"
              class="w-4 h-4 text-[#008f55] rounded border-gray-300 focus:ring-[#008f55]"
            />
            <span class="text-xs text-gray-700 font-medium">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ۵. فرمت‌های خروجی مورد انتظار -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all">
      <button
        type="button"
        @click="toggleAccordion('outputs')"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-800 text-sm"
      >
        <span class="flex items-center gap-2">
          📁 فرمت‌های خروجی مورد انتظار
          <span
            v-if="store.formData.outputFormats?.length > 0"
            class="bg-emerald-100 text-[#008f55] text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ store.formData.outputFormats.length }} انتخاب شده
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform duration-300"
          :class="{ 'rotate-180': activeAccordion === 'outputs' }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-show="activeAccordion === 'outputs'" class="p-4 border-t border-gray-100 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            v-for="item in outputFormatsList"
            :key="item"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="store.formData.outputFormats"
              class="w-4 h-4 text-[#008f55] rounded border-gray-300 focus:ring-emerald-500"
            />
            <span class="text-xs text-gray-700 font-medium">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
