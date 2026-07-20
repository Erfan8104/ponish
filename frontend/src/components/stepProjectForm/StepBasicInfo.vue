<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// لیست دسته‌بندی‌ها مطابق با اسلاگ‌های دیتابیس
const surveyCategories = [
  {
    id: 'mapping',
    name: 'نقشه‌برداری زمینی',
    icon: '📐',
    desc: 'برداشت با توتال استیشن و GPS',
  },
  {
    id: 'drone',
    name: 'عکس‌برداری هوایی',
    icon: '✈️',
    desc: 'تصویربرداری هوایی و تهیه ارتوفتو',
  },
  {
    id: 'gis',
    name: 'خدمات GIS',
    icon: '🗺️',
    desc: 'تحلیل داده، ژئورفرنس و پایگاه داده',
  },
  {
    id: 'drafting',
    name: 'ترسیم و کارتوگرافی',
    icon: '📋',
    desc: 'امور ثبتی، نقشه‌کشی و کارتوگرافی',
  },
]

onMounted(() => {
  if (!store.formData.category) {
    store.formData.category = ''
  }
})
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1">
        یک عنوان واضح برای پروژه خود انتخاب کنید <span class="text-red-500">*</span>
      </label>
      <input
        v-model="store.formData.title"
        type="text"
        placeholder="مثال: تهیه نقشه توپوگرافی زمین ۱۰ هکتاری"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
          >استان محل پروژه <span class="text-red-500">*</span></label
        >
        <input
          v-model="store.formData.province"
          type="text"
          placeholder="مثال: تهران"
          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
          >شهر محل پروژه <span class="text-red-500">*</span></label
        >
        <input
          v-model="store.formData.city"
          type="text"
          placeholder="مثال: دماوند"
          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
        >آدرس دقیق محل اجرای پروژه</label
      >
      <input
        v-model="store.formData.address"
        type="text"
        placeholder="مثال: جاده فیروزکوه، بعد از گیلاوند، دشت مشاء"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
      />
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
        >توضیحات تکمیلی پروژه (اختیاری)</label
      >
      <textarea
        v-model="store.formData.description"
        rows="4"
        placeholder="هرگونه جزئیات، عوارض زمین، هدف از نقشه‌برداری یا توضیحی که فکر می‌کنید به کارشناسان کمک می‌کند را به زبان ساده بنویسید..."
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all resize-none"
      ></textarea>
    </div>

    <hr class="border-gray-100 my-4" />

    <!-- بخش انتخاب حوزه تخصصی به صورت کاملاً مستقیم و بدون دکمه بازشو -->
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >نوع حوزه نقشه‌برداری پروژه را مشخص کنید <span class="text-red-500">*</span></label
      >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="cat in surveyCategories"
          :key="cat.id"
          @click="store.formData.category = cat.id"
          class="border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all select-none"
          :class="
            store.formData.category === cat.id
              ? 'border-[#008f55] bg-emerald-50/20 ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/50 bg-white'
          "
        >
          <span class="text-2xl mt-0.5">{{ cat.icon }}</span>
          <div>
            <h4 class="text-sm font-bold text-gray-800">{{ cat.name }}</h4>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ cat.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
