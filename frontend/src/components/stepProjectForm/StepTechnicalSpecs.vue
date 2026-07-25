<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

// وضعیت باز یا بسته بودن منوی خروجی‌های پیشرفته (همچنان به صورت کشویی باقی بماند یا آن را هم باز کنید)
const showAdvancedSettings = ref(false)

// 🌟 تعیین خودکار روش اجرا بر اساس کتگوری انتخابی مرحله اول
// تعیین خودکار روش اجرا و پاکسازی/مقداردهی اولیه آرایه‌ها
watchEffect(() => {
  const category = store.formData.category

  if (category === 'gis' || category === 'drafting') {
    store.formData.surveyMethod = 'gis'
  } else if (category === 'drone') {
    store.formData.surveyMethod = 'aerial'
  } else if (category === 'mapping') {
    store.formData.surveyMethod = 'ground'
  } else {
    store.formData.surveyMethod = ''
  }

  // تضمین اینکه هیچ‌کدام از آرایه‌ها undefined نشوند
  const data = store.formData as any
  if (!data.specificSurveys) data.specificSurveys = []
  if (!data.requiredEquipment) data.requiredEquipment = []
  if (!data.groundTechnicalSpecs) data.groundTechnicalSpecs = []
  if (!data.aerialTechnicalSpecs) data.aerialTechnicalSpecs = []
  if (!data.gisTechnicalSpecs) data.gisTechnicalSpecs = []
  if (!data.outputFormats) data.outputFormats = []
})
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

// گزینه‌های روش زمینی
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

const groundTechnicalOptions = [
  'ایستگاه ماندگار بتن سازمان نقشه‌برداری',
  'ایستگاه ماندگار سنگ ریشه دار',
  'ایستگاه ماندگار میخ و واشر',
  'برداشت سامانه شمیم',
  'منحنی میزان استاندارد سازمان نقشه‌برداری',
  'برداشت عوارض خاص',
  'نیاز به علامت برای نقاط برداشتی مسیر',
  'منحنی میزان',
  'توصیف عوارض (چاه، دکل، لبه جدول)',
]

const contourIntervalOptions = ['0.5', '1', '1.5', '2']

// گزینه‌های روش هوایی
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

const aerialTechnicalOptions = [
  'برداشت ایستگاه ماندگار بتن سازمان نقشه‌برداری',
  'برداشت نقاط کنترل',
  'برداشت عوارض خاص (پل، ساختمان، ...)',
  'شناسنامه نقاط',
  'پرواز مایل',
  'پرواز با تراکم بالا برای مدل سازی',
  'پرواز با تراکم بالا در نقاط روستایی و شهری',
  'پرواز ترکیبی عمودی و مایل',
]

const gisTechnicalOptions = [
  'ترسیم شبکه معابر',
  'ترسیم فضای سبز',
  'ترسیم عرصه و عیان',
  'جانمایی پلاک ثبتی',
  'تهیه نقشه برای شهرداری',
  'تهیه نقشه برای سند',
  'تعیین مساحت دقیق',
  'تفکیک اراضی',
  'تهیه نقشه برای دادگاه یا کارشناس رسمی',
  'GIS Ready',
]
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
        مشخصات فنی و گزینه‌های زیر بر اساس نوع پروژه انتخابی شما به صورت هوشمند بارگذاری شده است.
        می‌توانید جزئیات دلخواه را انتخاب کنید.
      </p>
    </div>

    <!-- 🌟 ۱. اگر روش زمینی انتخاب شده باشد (حوزه Mapping) -->
    <div
      v-if="store.formData.surveyMethod === 'ground'"
      class="space-y-5 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-emerald-100">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
        <h3 class="text-xs font-black text-emerald-900">تنظیمات تخصصی نقشه‌برداری زمینی</h3>
      </div>

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
              'bg-emerald-50/40 border-emerald-600': (
                store.formData as any
              ).specificSurveys.includes(item),
            }"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="(store.formData as any).specificSurveys"
              class="accent-emerald-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ item }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2">تجهیزات مورد نیاز زمینی</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="eq in groundEquipmentOptions"
            :key="eq"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
            :class="{
              'bg-emerald-50/40 border-emerald-600': store.formData.requiredEquipment.includes(eq),
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

      <div>
        <label class="block text-xs font-bold text-emerald-900 mb-2"
          >مشخصات فنی و انتظارات زمینی</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in groundTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-200 cursor-pointer hover:border-emerald-500 transition-all bg-white"
            :class="{
              'bg-emerald-100/60 border-emerald-600':
                store.formData.groundTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.groundTechnicalSpecs"
              class="accent-emerald-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-emerald-950">{{ spec }}</span>
          </label>
        </div>

        <div
          v-if="store.formData.groundTechnicalSpecs.includes('منحنی میزان')"
          class="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200"
        >
          <label class="block text-xs font-bold text-emerald-900 mb-2"
            >انتخاب فاصله منحنی میزان (متر)</label
          >
          <div class="flex gap-2">
            <button
              type="button"
              v-for="val in contourIntervalOptions"
              :key="val"
              @click="store.formData.contourInterval = val"
              :class="[
                'py-1.5 px-4 text-xs font-bold rounded-lg border transition-all',
                store.formData.contourInterval === val
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400',
              ]"
            >
              {{ val }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی بخش زمینی</label>
        <textarea
          v-model="store.formData.groundDescription"
          rows="2"
          placeholder="نکات خاص یا شرایط محیطی مربوط به بخش زمینی..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- 🌟 ۲. اگر روش هوایی انتخاب شده باشد (حوزه Drone) -->
    <div
      v-if="store.formData.surveyMethod === 'aerial'"
      class="space-y-5 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-indigo-100">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        <h3 class="text-xs font-black text-indigo-900">
          تنظیمات تخصصی نقشه‌برداری هوایی و فتوگرامتری
        </h3>
      </div>

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
              'bg-indigo-50/40 border-indigo-600': (store.formData as any).specificSurveys.includes(
                item,
              ),
            }"
          >
            <input
              type="checkbox"
              :value="item"
              v-model="(store.formData as any).specificSurveys"
              class="accent-indigo-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-gray-800">{{ item }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-2">تجهیزات مورد نیاز هوایی</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="eq in aerialEquipmentOptions"
            :key="eq"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all bg-white"
            :class="{
              'bg-indigo-50/40 border-indigo-600': store.formData.requiredEquipment.includes(eq),
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

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1"
          >نوع پوشش یا دقت پرواز هوایی</label
        >
        <input
          type="text"
          v-model="store.formData.aerialScaleOption"
          placeholder="مثلاً GSD معادل ۳ سانتیمتر بر پیکسل"
          class="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-indigo-900 mb-2"
          >مشخصات فنی خروجی‌ها و پرواز هوایی</label
        >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in aerialTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-indigo-200 cursor-pointer hover:border-indigo-500 transition-all bg-white"
            :class="{
              'bg-indigo-100/60 border-indigo-600':
                store.formData.aerialTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.aerialTechnicalSpecs"
              class="accent-indigo-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-indigo-950">{{ spec }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی بخش هوایی</label>
        <textarea
          v-model="store.formData.aerialDescription"
          rows="2"
          placeholder="محدودیت‌های پروازی، موانع هوایی یا شرایط منطقه..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- 🌟 ۳. اگر روش GIS انتخاب شده باشد (حوزه GIS یا Drafting) -->
    <div
      v-if="store.formData.surveyMethod === 'gis'"
      class="space-y-5 p-5 bg-amber-50/30 rounded-2xl border border-amber-100"
    >
      <div class="flex items-center gap-2 pb-2 border-b border-amber-100">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
        <h3 class="text-xs font-black text-amber-900">تنظیمات تخصصی سیستم اطلاعات مکانی (GIS)</h3>
      </div>

      <div>
        <label class="block text-xs font-bold text-amber-900 mb-2">نوع خدمات و تحلیل‌های GIS</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label
            v-for="spec in gisTechnicalOptions"
            :key="spec"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-500 transition-all bg-white"
            :class="{
              'bg-amber-100/60 border-amber-600': store.formData.gisTechnicalSpecs.includes(spec),
            }"
          >
            <input
              type="checkbox"
              :value="spec"
              v-model="store.formData.gisTechnicalSpecs"
              class="accent-amber-600 w-4 h-4"
            />
            <span class="text-xs font-medium text-amber-950">{{ spec }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-800 mb-1">توضیحات اختصاصی پروژه GIS</label>
        <textarea
          v-model="store.formData.gisDescription"
          rows="2"
          placeholder="فرمت لایه‌های ورودی، سیستم مختصات مرجع یا ساختار پایگاه داده..."
          class="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
        ></textarea>
      </div>
    </div>

    <!-- بخش مقیاس نقشه و خطای مجاز (برای زمینی و هوایی) -->
    <div
      v-if="store.formData.category === 'mapping' || store.formData.category === 'drone'"
      class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100"
    >
      <label class="block text-xs font-bold text-emerald-900 mb-1">مقیاس نقشه مورد نیاز</label>
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

    <!-- بخش تنظیمات خروجی‌ها (اختیاری) -->
    <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
      <button
        type="button"
        @click="showAdvancedSettings = !showAdvancedSettings"
        class="w-full p-4 flex items-center justify-between text-right font-bold text-xs text-gray-700 hover:bg-gray-100/80 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-[#008f55] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">اختیاری</span>
          <span>فرمت‌های خروجی مورد انتظار پروژه</span>
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

      <div v-if="showAdvancedSettings" class="p-4 pt-0 space-y-5 border-t border-gray-200 bg-white">
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
