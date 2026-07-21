<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

// وضعیت باز یا بسته بودن منوی پیشرفته (جزئیات و خروجی‌های دقیق)
const showAdvancedSettings = ref(false)
// وضعیت باز یا بسته بودن منوی انتخاب روش‌ها و تجهیزات تخصصی نقشه برداری
const showSurveyMethodSettings = ref(false)

const mapScales = [
  { scale: '1/100', accuracy: '۲ سانتی‌متر' },
  { scale: '1/200', accuracy: '۵ سانتی‌متر' },
  { scale: '1/500', accuracy: '۱۰ سانتی‌متر' },
  { scale: '1/1000', accuracy: '۲۰ سانتی‌متر' },
  { scale: '1/2000', accuracy: '۴۰ سانتی‌متر' },
  { scale: '1/5000', accuracy: '۱ متر' },
]

const outputFormatOptions = [
  { id: 'dwg', label: 'فایل اتوکد (DWG)' },
  { id: 'pdf', label: 'فایل PDF و نقشه چاپی' },
  { id: 'report', label: 'گزارش محاسباتی و متنی' },
]

const groundSurveyOptions = [
  'نقشه‌برداری ثبتی و کاداستر',
  'نقشه‌برداری توپوگرافی',
  'نقشه‌برداری مسیر',
  'نقشه‌برداری کنترل و ترازیابی',
  'نقشه‌برداری پروفیل',
  'ایستگاه ماندگار',
]

const groundEquipmentOptions = [
  'دوربین توتال استیشن',
  'دستگاه GPS',
  'سیستم Base و Rover',
  'متر لیزری',
  'لیزر اسکنر',
]

const aerialSurveyOptions = [
  'نقشه فتوگرامتری',
  'نقشه توپوگرافی',
  'نقشه سه بعدی',
  'نقشه کاداستر و شهری',
  'نقشه مسیر',
  'نظارت هوشمند پروژه',
]

const aerialEquipmentOptions = [
  'پهپاد با ماژول RTK',
  'پهپاد ماتریس',
  'پهپاد مویک ۳',
  'پهپاد مویک ۲ پرو',
  'پهپاد فانتوم ۴ پرو',
]

// 🌟 تابع اختصاصی برای مدیریت تغییر روش اجرا (زمینی / هوایی)
const handleSurveyMethodToggle = (method: 'ground' | 'aerial') => {
  if (store.formData.surveyMethod === method) {
    store.formData.surveyMethod = ''
  } else {
    store.formData.surveyMethod = method
  }
  store.formData.specificSurveys = []
  store.formData.requiredEquipment = []
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <!-- راهنمای ساده برای کارفرما -->
    <div class="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5 text-sky-600 mt-0.5 shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p class="text-xs text-sky-900 leading-relaxed">
        نگران جزئیات فنی نباشید! اگر دقیقاً نمی‌دانید چه مواردی را انتخاب کنید، می‌توانید بخش‌های
        پیشرفته را خالی بگذارید تا متخصصان پیشنهادات خود را برای شما ارسال کنند.
      </p>
    </div>

    <!-- بخش انتخاب روش (زمینی/هوایی) و جزئیات تخصصی در قالب منوی کشویی -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
      <button
        type="button"
        @click="showSurveyMethodSettings = !showSurveyMethodSettings"
        class="w-full p-4 flex items-center justify-between text-right font-bold text-xs text-gray-700 hover:bg-gray-100/80 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]"
            >تخصصی (اختیاری)</span
          >
          <span>تعیین روش نقشه‌برداری، زیرشاخه‌ها و تجهیزات مورد نیاز</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 text-gray-500 transition-transform duration-300"
          :class="{ 'rotate-180': showSurveyMethodSettings }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- محتوای داخل منوی کشویی روش‌ها و تجهیزات -->
      <div
        v-if="showSurveyMethodSettings"
        class="p-4 pt-0 space-y-5 border-t border-gray-200 bg-white"
      >
        <!-- انتخاب روش اصلی -->
        <div class="pt-4">
          <label class="block text-xs font-bold text-gray-800 mb-2">روش اجرای پروژه</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleSurveyMethodToggle('ground')"
              :class="[
                'py-3 px-3 text-xs font-bold rounded-xl border transition-all text-center',
                store.formData.surveyMethod === 'ground'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400',
              ]"
            >
              نقشه‌برداری زمینی
            </button>
            <button
              type="button"
              @click="handleSurveyMethodToggle('aerial')"
              :class="[
                'py-3 px-3 text-xs font-bold rounded-xl border transition-all text-center',
                store.formData.surveyMethod === 'aerial'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400',
              ]"
            >
              نقشه‌برداری هوایی
            </button>
          </div>
        </div>

        <!-- اگر روش زمینی انتخاب شد -->
        <div
          v-if="store.formData.surveyMethod === 'ground'"
          class="space-y-4 pt-3 border-t border-gray-100"
        >
          <div>
            <label class="block text-xs font-bold text-gray-800 mb-2"
              >نوع نقشه‌برداری زمینی (چند انتخابی)</label
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label
                v-for="item in groundSurveyOptions"
                :key="item"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
                :class="{
                  'bg-emerald-50/40 border-emerald-600':
                    store.formData.specificSurveys.includes(item),
                }"
              >
                <input
                  type="checkbox"
                  :value="item"
                  v-model="store.formData.specificSurveys"
                  class="accent-emerald-600 w-4 h-4"
                />
                <span class="text-xs font-medium text-gray-800">{{ item }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-800 mb-2"
              >تجهیزات مورد نیاز زمینی</label
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label
                v-for="eq in groundEquipmentOptions"
                :key="eq"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
                :class="{
                  'bg-emerald-50/40 border-emerald-600':
                    store.formData.requiredEquipment.includes(eq),
                }"
              >
                <input
                  type="checkbox"
                  :value="eq"
                  v-model="store.formData.requiredEquipment"
                  class="accent-emerald-600 w-4 h-4"
                />
                <span class="text-xs font-medium text-gray-800">{{ eq }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- اگر روش هوایی انتخاب شد -->
        <div
          v-if="store.formData.surveyMethod === 'aerial'"
          class="space-y-4 pt-3 border-t border-gray-100"
        >
          <div>
            <label class="block text-xs font-bold text-gray-800 mb-2"
              >نوع نقشه‌برداری هوایی (چند انتخابی)</label
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label
                v-for="item in aerialSurveyOptions"
                :key="item"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all bg-white"
                :class="{
                  'bg-indigo-50/40 border-indigo-600':
                    store.formData.specificSurveys.includes(item),
                }"
              >
                <input
                  type="checkbox"
                  :value="item"
                  v-model="store.formData.specificSurveys"
                  class="accent-indigo-600 w-4 h-4"
                />
                <span class="text-xs font-medium text-gray-800">{{ item }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-800 mb-2"
              >تجهیزات مورد نیاز هوایی</label
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label
                v-for="eq in aerialEquipmentOptions"
                :key="eq"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all bg-white"
                :class="{
                  'bg-indigo-50/40 border-indigo-600':
                    store.formData.requiredEquipment.includes(eq),
                }"
              >
                <input
                  type="checkbox"
                  :value="eq"
                  v-model="store.formData.requiredEquipment"
                  class="accent-indigo-600 w-4 h-4"
                />
                <span class="text-xs font-medium text-gray-800">{{ eq }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- بخش مقیاس نقشه و خطای مجاز -->
    <div
      v-if="store.formData.category === 'mapping' || store.formData.category === 'drone'"
      class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100"
    >
      <label class="block text-xs font-bold text-emerald-900 mb-1"> مقیاس نقشه مورد نیاز </label>
      <p class="text-[11px] text-emerald-700 mb-3">
        با انتخاب مقیاس، خطای مجاز به صورت خودکار پیشنهاد می‌شود. (اختیاری)
      </p>

      <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
        <button
          type="button"
          v-for="item in mapScales"
          :key="item.scale"
          @click="store.setMapScale(item.scale)"
          :class="[
            'py-2.5 px-2 text-xs font-bold rounded-xl border transition-all',
            store.formData.mapScale === item.scale
              ? 'bg-[#008f55] text-white border-[#008f55] shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400',
          ]"
        >
          {{ item.scale }}
        </button>
      </div>

      <!-- نمایش خطای مجاز -->
      <div
        v-if="store.formData.requiredAccuracy"
        class="flex items-center gap-2 pt-2 text-xs text-gray-600 border-t border-emerald-200/60"
      >
        <span>خطای مجاز محاسبه شده:</span>
        <span class="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg">
          ± {{ store.formData.requiredAccuracy }}
        </span>
      </div>
    </div>

    <hr class="border-gray-100 my-4" />

    <!-- بخش تنظیمات تخصصی و خروجی‌ها -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
      <button
        type="button"
        @click="showAdvancedSettings = !showAdvancedSettings"
        class="w-full p-4 flex items-center justify-between text-right font-bold text-xs text-gray-700 hover:bg-gray-100/80 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-[#008f55] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">اختیاری</span>
          <span>جزئیات و خروجی‌های خاص مورد انتظار (فرمت‌های خروجی)</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 text-gray-500 transition-transform duration-300"
          :class="{ 'rotate-180': showAdvancedSettings }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- محتوای داخل منوی کشویی خروجی‌ها -->
      <div v-if="showAdvancedSettings" class="p-4 pt-0 space-y-5 border-t border-gray-200 bg-white">
        <!-- فرمت‌های خروجی -->
        <div class="pt-4">
          <label class="block text-xs font-bold text-gray-800 mb-2"
            >چه خروجی‌هایی از پروژه نیاز دارید؟</label
          >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label
              v-for="format in outputFormatOptions"
              :key="format.id"
              class="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#008f55] transition-all bg-white"
              :class="{
                'bg-emerald-50/40 border-[#008f55]': store.formData.outputFormats.includes(
                  format.id,
                ),
              }"
            >
              <input
                type="checkbox"
                :value="format.id"
                v-model="store.formData.outputFormats"
                class="accent-[#008f55] w-4 h-4"
              />
              <span class="text-xs font-medium text-gray-800">{{ format.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
