<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

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

const finalPayload = computed(() => ({
  ...store.formData,
  files: store.uploadedFiles.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  })),
}))
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-black text-lg mb-5">خلاصه پروژه</h3>

      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500"> عنوان پروژه: </span>

          <div class="font-bold mt-1">
            {{ store.formData.title }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> نوع پروژه: </span>

          <div class="font-bold mt-1">
            {{ categoryTitle }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> استان: </span>

          <div class="font-bold mt-1">
            {{ store.formData.province }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> شهر: </span>

          <div class="font-bold mt-1">
            {{ store.formData.city }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> سیستم مختصات: </span>

          <div class="font-bold mt-1">
            {{ store.formData.coordinateSystem }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> زون UTM: </span>

          <div class="font-bold mt-1">
            {{ store.formData.utmZone || '-' }}
          </div>
        </div>

        <div>
          <span class="text-gray-500"> مساحت: </span>

          <div class="font-bold mt-1">
            {{ store.formData.calculatedArea }}
            هکتار
          </div>
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
          <span>
            {{ file.name }}
          </span>

          <span class="text-xs text-gray-400"> {{ (file.size / 1024).toFixed(1) }} KB </span>
        </div>
      </div>
    </div>

    <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
      <div class="flex justify-between items-center">
        <span class="font-bold"> برآورد هزینه پروژه </span>

        <span class="text-2xl font-black text-[#008f55]">
          {{ formatPrice(estimatedPrice) }}
          تومان
        </span>
      </div>
    </div>

    <div class="bg-gray-900 rounded-2xl p-5">
      <h3 class="text-white font-black mb-4">JSON ارسالی به API</h3>

      <pre class="text-green-400 text-xs overflow-auto">{{
        JSON.stringify(finalPayload, null, 2)
      }}</pre>
    </div>
  </div>
</template>
