<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/project.store'
import { computed } from 'vue'

const store = useProjectStore()
const router = useRouter()

const formatPrice = (value: number | string) => {
  const num = Number(value || 0)
  return new Intl.NumberFormat('fa-IR').format(num)
}

const categoryTitle = computed(() => {
  return (
    {
      mapping: 'نقشه‌برداری زمینی',
      drone: 'عکس‌برداری هوایی',
      gis: 'خدمات GIS',
      drafting: 'ترسیم و کارتوگرافی',
    }[store.formData.category] || '-'
  )
})

const handlePublishProject = async () => {
  try {
    await store.submitProject()
    router.push('/dashboard')
  } catch (err: any) {
    console.error('submit failed:', err)
  }
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <!-- پیام خطا در صورت وجود -->
    <div
      v-if="store.error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm"
    >
      {{ store.error }}
    </div>

    <!-- اطلاعات کلی پروژه -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm">
      <h3 class="font-black mb-4 text-gray-800">خلاصه مشخصات پروژه</h3>

      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500 text-xs">عنوان پروژه:</span>
          <div class="font-bold text-gray-800 mt-1">{{ store.formData.title || 'بدون عنوان' }}</div>
        </div>

        <div>
          <span class="text-gray-500 text-xs">نوع نقشه‌برداری:</span>
          <div class="font-bold text-gray-800 mt-1">{{ categoryTitle }}</div>
        </div>

        <!-- نمایش مساحت یا طول کریدور بسته به نوع انتخاب شده -->
        <div v-if="store.formData.mappingType === 'corridor'">
          <span class="text-gray-500 text-xs">طول کریدور:</span>
          <div class="font-bold text-gray-800 mt-1">
            {{ store.formData.corridorLength }} کیلومتر
          </div>
        </div>
        <div v-else>
          <span class="text-gray-500 text-xs">مساحت محاسبه‌شده:</span>
          <div class="font-bold text-gray-800 mt-1">{{ store.formData.calculatedArea }} هکتار</div>
        </div>

        <div>
          <span class="text-gray-500 text-xs">استان و شهر:</span>
          <div class="font-bold text-gray-800 mt-1">
            {{ store.formData.province || 'تعیین نشده' }} - {{ store.formData.city || '' }}
          </div>
        </div>

        <div>
          <span class="text-gray-500 text-xs">زمان تحویل:</span>
          <div class="font-bold text-gray-800 mt-1">
            {{ store.formData.deliveryTime || 'توافقی' }}
          </div>
        </div>

        <div>
          <span class="text-gray-500 text-xs">نوع بودجه:</span>
          <div class="font-bold text-gray-800 mt-1">
            {{ store.formData.budgetType === 'negotiable' ? 'قیمت توافقی' : 'بودجه ثابت' }}
          </div>
        </div>
      </div>

      <!-- جزئیات بودجه ثابت -->
      <div
        v-if="store.formData.budgetType === 'fixed'"
        class="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4 text-sm"
      >
        <div>
          <span class="text-gray-500 text-xs">حداقل بودجه پیشنهادی:</span>
          <div class="font-bold text-emerald-700 mt-1">
            {{ formatPrice(store.formData.minBudget) }} تومان
          </div>
        </div>
        <div>
          <span class="text-gray-500 text-xs">حداکثر بودجه پیشنهادی:</span>
          <div class="font-bold text-emerald-700 mt-1">
            {{ formatPrice(store.formData.maxBudget) }} تومان
          </div>
        </div>
      </div>
    </div>

    <!-- خدمات فنی (Tech Type) -->
    <div v-if="store.formData.techType.length" class="bg-white border rounded-2xl p-6 shadow-sm">
      <h3 class="font-black mb-3 text-gray-800 text-sm">تجهیزات و فناوری‌های مورد نیاز</h3>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in store.formData.techType"
          :key="item"
          class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <!-- فایل‌های پیوست شده -->
    <div v-if="store.uploadedFiles.length" class="bg-white border rounded-2xl p-6 shadow-sm">
      <h3 class="font-black mb-3 text-gray-800 text-sm">فایل‌های پیوست شده</h3>

      <div class="space-y-2">
        <div
          v-for="file in store.uploadedFiles"
          :key="file.name"
          class="text-sm text-gray-600 flex items-center gap-2"
        >
          <span>📎</span>
          <span>{{ file.name }}</span>
        </div>
      </div>
    </div>

    <!-- برآورد هزینه سامانه -->

    <!-- دکمه نهایی ثبت پروژه -->
    <button
      @click="handlePublishProject"
      :disabled="store.isLoading"
      class="w-full bg-[#008f55] hover:bg-[#007546] text-white py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
    >
      {{ store.isLoading ? 'در حال ارسال و ثبت پروژه...' : 'تایید و انتشار نهایی پروژه' }}
    </button>
  </div>
</template>
