<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// گزینه‌های تخصصی نقشه‌برداری به جای لیست عمومی پونیشا
const surveyCategories = [
  {
    id: 'terrestrial',
    name: 'نقشه‌برداری زمینی',
    icon: '📐',
    desc: 'برداشت با توتال استیشن و GPS',
  },
  { id: 'uav', name: 'فتوگرامتری با پهپاد', icon: '🛸', desc: 'تصویربرداری هوایی و تهیه ارتوفتو' },
  {
    id: 'gis',
    name: 'سامانه اطلاعات جغرافیایی (GIS)',
    icon: '🗺️',
    desc: 'تحلیل داده، ژئورفرنس و پایگاه داده',
  },
  {
    id: 'cadastral',
    name: 'کاداستر و تفکیک اراضی',
    icon: '📋',
    desc: 'امور ثبتی، سند و تعیین حدود',
  },
]
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
        >یک عنوان واضح برای پروژه خود انتخاب کنید</label
      >
      <input
        v-model="store.formData.title"
        type="text"
        placeholder="مثال: تهیه نقشه توپوگرافی زمین ۱۰ هکتاری"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
      />
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >نوع حوزه نقشه‌برداری پروژه را مشخص کنید</label
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

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
        >جزئیات و توضیحات تکمیلی پروژه</label
      >
      <textarea
        v-model="store.formData.description"
        rows="4"
        placeholder="توضیحات مربوط به عوارض زمین، موانع پرواز، درختان، وضعیت سند یا هر جزئیاتی که به قیمت‌گذاری بهتر کمک می‌کند را بنویسید..."
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all resize-none"
      ></textarea>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2 mr-1">استان محل پروژه</label>
        <input
          v-model="store.formData.province"
          type="text"
          placeholder="مثال: تهران"
          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2 mr-1">شهر محل پروژه</label>
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
        placeholder="مثال: جاده فیروزکوه، بعد از گیلاوند، دشت مشاء، روبه‌روی خیابان اصلی"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#008f55] outline-none transition-all"
      />
    </div>
  </div>
</template>
