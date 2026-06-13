<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// مدیریت نمایش بخش تنظیمات پیشرفته فرمت و دقت
const showAdvancedSpecs = ref(false)

// لیست خدمات اصلاح شده (همراه با گزینه نجات‌بخش عمومی)
const technicalServices = [
  {
    id: 'general_survey',
    title: 'نقشه‌برداری عمومی (ملکی، ارضی، سند)',
    icon: '🏢',
    desc: 'مناسب برای تعیین متراژ زمین، باغ، آپارتمان و امور ثبتی',
  },
  {
    id: 'expert_choice',
    title: 'بررسی و انتخاب توسط کارشناس',
    icon: '🧠',
    desc: 'اگر نمی‌دانید به چه ابزار یا خدماتی نیاز دارید',
  },
  { id: 'gps', title: 'برداشت با GPS / RTK', icon: '📡', desc: 'تعیین مختصات دقیق شمیم' },
  {
    id: 'totalstation',
    title: 'توتال استیشن (دوربین)',
    icon: '📐',
    desc: 'برداشت دقیق عوارض و وضع موجود',
  },
  { id: 'uav', title: 'فتوگرامتری پهپادی', icon: '🚁', desc: 'تصویربرداری هوایی مناطق وسیع' },
  { id: 'lidar', title: 'لیزر اسکنر / LiDAR', icon: '🌐', desc: 'مدل‌سازی سه‌بعدی و عوارض پیچیده' },
  {
    id: 'gis_cadastre',
    title: 'امور GIS و کاداستر',
    icon: '🗺️',
    desc: 'پایگاه داده جغرافیایی و تفکیک اراضی',
  },
]

// فرمت‌های خروجی
const outputFormats = [
  { id: 'STANDARD', label: '🗂️ نسخه چاپی PDF + فایل استاندارد مهندسی (پیشنهادی)' },
  { id: 'DWG', label: 'DWG (اتوکد)' },
  { id: 'DXF', label: 'DXF' },
  { id: 'SHP', label: 'SHP (لایه جی‌آی‌اس)' },
  { id: 'GeoJSON', label: 'GeoJSON' },
  { id: 'KML', label: 'KML (گوگل‌ارث)' },
  { id: 'Orthophoto', label: 'Orthophoto (تصویر قائم پهپاد)' },
  { id: 'DEM', label: 'DEM (مدل رقومی زمین)' },
  { id: 'Contours', label: 'Contours (خطوط تراز)' },
]

const accuracies = [
  { id: 'standard_acc', title: '🎯 دقت استاندارد مهندسی (مناسب اکثر پروژه‌ها)' },
  { id: '1-2cm', title: 'خیلی بالا (۱ تا ۲ سانتی‌متر)' },
  { id: '2-5cm', title: 'بالا (۲ تا ۵ سانتی‌متر)' },
  { id: '5-10cm', title: 'متوسط (۵ تا ۱۰ سانتی‌متر)' },
  { id: '10cm+', title: 'معمولی (بالای ۱۰ سانتی‌متر)' },
]

// مدیریت انتخاب خدمات (پشتیبانی از مولتی‌سلکت)
const toggleService = (id: string) => {
  const index = store.formData.techType.indexOf(id)
  if (index === -1) {
    store.formData.techType.push(id)
  } else {
    store.formData.techType.splice(index, 1)
  }
}

// مدیریت انتخاب فرمت خروجی (پشتیبانی از مولتی‌سلکت)
const toggleOutput = (id: string) => {
  const index = store.formData.outputFormats.indexOf(id)
  if (index === -1) {
    store.formData.outputFormats.push(id)
  } else {
    store.formData.outputFormats.splice(index, 1)
  }
}

// مقداردهی اولیه پیش‌فرض‌های هوشمند برای عبور بدون دردسر کاربر آماتور
onMounted(() => {
  if (store.formData.techType.length === 0) {
    store.formData.techType.push('general_survey') // پیش‌فرض عمومی
  }
  if (store.formData.outputFormats.length === 0) {
    store.formData.outputFormats.push('STANDARD') // پیش‌فرض استاندارد
  }
  if (!store.formData.requiredAccuracy) {
    store.formData.requiredAccuracy = 'standard_acc' // پیش‌فرض تراز دقت
  }
})
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-1 mr-1">
        خدمات مورد نیاز خود را انتخاب کنید
      </label>
      <p class="text-[10px] text-gray-400 mb-3 mr-1">امکان انتخاب همزمان چند گزینه وجود دارد.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="item in technicalServices"
          :key="item.id"
          type="button"
          @click="toggleService(item.id)"
          class="border rounded-xl p-3.5 transition-all text-right flex items-start gap-3 select-none"
          :class="
            store.formData.techType.includes(item.id)
              ? 'border-[#008f55] bg-emerald-50/40 ring-2 ring-emerald-50'
              : 'border-gray-200 bg-white hover:bg-gray-50/50'
          "
        >
          <span class="text-xl mt-0.5">{{ item.icon }}</span>
          <div>
            <div class="text-xs font-bold text-gray-800">{{ item.title }}</div>
            <div v-if="item.desc" class="text-[10px] text-gray-400 mt-0.5 font-medium">
              {{ item.desc }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <hr class="border-gray-100 my-4" />

    <div class="flex justify-start">
      <button
        type="button"
        @click="showAdvancedSpecs = !showAdvancedSpecs"
        class="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-gray-100/70 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-all"
      >
        <span>{{
          showAdvancedSpecs
            ? '➖ پنهان کردن تنظیمات پیشرفته خروجی'
            : '⚙️ تنظیمات پیشرفته فرمت فایل و میزان دقت (اختیاری)'
        }}</span>
      </button>
    </div>

    <div
      v-if="showAdvancedSpecs"
      class="space-y-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 transition-all duration-300"
    >
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-3 mr-1">
          فرمت فایل خروجی مورد نیاز
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="format in outputFormats"
            :key="format.id"
            type="button"
            @click="toggleOutput(format.id)"
            class="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all select-none"
            :class="
              store.formData.outputFormats.includes(format.id)
                ? 'bg-[#008f55] text-white border-[#008f55] shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            "
          >
            {{ format.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-600 mb-3 mr-1">
          میزان دقت هندسی مورد نیاز
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <label
            v-for="acc in accuracies"
            :key="acc.id"
            class="border rounded-xl p-3.5 cursor-pointer flex items-center justify-between bg-white transition-all select-none"
            :class="
              store.formData.requiredAccuracy === acc.id
                ? 'border-[#008f55] ring-2 ring-emerald-50'
                : 'border-gray-200 hover:bg-gray-50/50'
            "
          >
            <span class="text-xs font-bold text-gray-700">
              {{ acc.title }}
            </span>
            <input
              type="radio"
              :value="acc.id"
              v-model="store.formData.requiredAccuracy"
              class="accent-[#008f55]"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
