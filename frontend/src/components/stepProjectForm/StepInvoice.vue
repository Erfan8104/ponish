<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router' // اضافه شده برای انتقال کاربر بعد از ثبت موفق
import { useProjectStore } from '../../stores/project.store' // نام فایل استور خود را بررسی کنید

const store = useProjectStore()
const router = useRouter()

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value)
}

const estimatedPrice = computed(() => {
  let area = Number(store.formData.calculatedArea || 0)
  if (!area) return 0

  let price = area * 2500000
  if (store.formData.category === 'uav') price *= 1.2
  if (store.formData.category === 'gis') price *= 0.8
  if (store.formData.category === 'cadastral') price *= 1.5

  return Math.round(price)
})

const categoryTitle = computed(() => {
  const map: Record<string, string> = {
    terrestrial: 'نقشه‌برداری زمینی',
    uav: 'فتوگرامتری پهپادی',
    gis: 'GIS',
    cadastral: 'کاداستر',
  }
  return map[store.formData.category] || '-'
})

// متد ارسال نهایی داده‌ها به بک‌اَند
const handlePublishProject = async () => {
  try {
    // صدا زدن اکشن پینیا که داده‌ها و فایل‌ها را به صورت Multipart به سرویس متصل به PostgreSQL می‌فرستد
    await store.submitProject()

    // هدایت کاربر به صفحه داشبورد پس از موفقیت‌آمیز بودن ثبت پروژه
    router.push('/dashboard')
  } catch (error) {
    console.error('ثبت پروژه با خطا مواجه شد:', error)
  }
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div
      v-if="store.errorMessages.length > 0"
      class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm"
    >
      <p class="font-bold mb-1">خطا در ثبت پروژه:</p>
      <ul class="list-disc list-inside text-xs space-y-1">
        <li v-for="(err, index) in store.errorMessages" :key="index">{{ err }}</li>
      </ul>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-black text-lg mb-5">خلاصه پروژه</h3>

      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500"> عنوان پروژه: </span>
          <div class="font-bold mt-1">{{ store.formData.title }}</div>
        </div>

        <div>
          <span class="text-gray-500"> نوع پروژه: </span>
          <div class="font-bold mt-1">{{ categoryTitle }}</div>
        </div>

        <div>
          <span class="text-gray-500"> استان: </span>
          <div class="font-bold mt-1">{{ store.formData.province }}</div>
        </div>

        <div>
          <span class="text-gray-500"> شهر: </span>
          <div class="font-bold mt-1">{{ store.formData.city }}</div>
        </div>

        <div>
          <span class="text-gray-500"> سیستم مختصات: </span>
          <div class="font-bold mt-1">{{ store.formData.coordinateSystem }}</div>
        </div>

        <div>
          <span class="text-gray-500"> زون UTM: </span>
          <div class="font-bold mt-1">{{ store.formData.utmZone || '-' }}</div>
        </div>

        <div>
          <span class="text-gray-500"> مساحت: </span>
          <div class="font-bold mt-1">{{ store.formData.calculatedArea }} هکتار</div>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-black mb-4">خدمات انتخاب شده</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in store.formData.techType"
          :key="item"
          class="px-3 py-2 bg-emerald-50 text-[#008f55] rounded-lg text-xs font-bold"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-black mb-4">خروجی‌های موردنیاز</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in store.formData.outputFormats"
          :key="item"
          class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div v-if="store.uploadedFiles.length" class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-black mb-4">فایل‌های ضمیمه</h3>
      <div class="space-y-2">
        <div
          v-for="file in store.uploadedFiles"
          :key="file.name"
          class="flex justify-between items-center border border-gray-100 rounded-xl p-3"
        >
          <span>{{ file.name }}</span>
          <span class="text-xs text-gray-400"> {{ (file.size / 1024).toFixed(1) }} KB </span>
        </div>
      </div>
    </div>

    <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
      <div class="flex justify-between items-center">
        <span class="font-bold"> برآورد هزینه پروژه </span>
        <span class="text-2xl font-black text-[#008f55]">
          {{ formatPrice(estimatedPrice) }} تومان
        </span>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button
        @click="handlePublishProject"
        :disabled="store.isLoading"
        class="w-full md:w-auto px-8 py-3 bg-[#008f55] hover:bg-[#007645] text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <template v-if="store.isLoading">
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          در حال ثبت و ارسال اطلاعات...
        </template>
        <template v-else> تایید نهایی و انتشار پروژه </template>
      </button>
    </div>
  </div>
</template>
