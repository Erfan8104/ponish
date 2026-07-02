<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()
const router = useRouter()

const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

const estimatedPrice = computed(() => {
  const area = Number(store.formData.calculatedArea || 0)
  if (!area) return 0

  let price = area * 2500000

  if (store.formData.category === 'uav') price *= 1.2
  if (store.formData.category === 'gis') price *= 0.8
  if (store.formData.category === 'cadastral') price *= 1.5

  return Math.round(price)
})

const categoryTitle = computed(() => {
  return (
    {
      terrestrial: 'نقشه‌برداری زمینی',
      uav: 'فتوگرامتری پهپادی',
      gis: 'GIS',
      cadastral: 'کاداستر',
    }[store.formData.category] || '-'
  )
})

const handlePublishProject = async () => {
  try {
    await store.submitProject()
    router.push('/dashboard')
  } catch (err) {
    console.error('submit failed:', err)
  }
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div
      v-if="store.error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm"
    >
      {{ store.error }}
    </div>

    <div class="bg-white border rounded-2xl p-6">
      <h3 class="font-black mb-4">خلاصه پروژه</h3>

      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span>عنوان:</span>
          <div class="font-bold">{{ store.formData.title }}</div>
        </div>

        <div>
          <span>نوع:</span>
          <div class="font-bold">{{ categoryTitle }}</div>
        </div>

        <div>
          <span>مساحت:</span>
          <div class="font-bold">{{ store.formData.calculatedArea }} هکتار</div>
        </div>

        <div>
          <span>سیستم مختصات:</span>
          <div class="font-bold">{{ store.formData.coordinateSystem }}</div>
        </div>
      </div>
    </div>

    <div v-if="store.formData.techType.length" class="bg-white border rounded-2xl p-6">
      <h3 class="font-black mb-3">خدمات</h3>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in store.formData.techType"
          :key="item"
          class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div v-if="store.uploadedFiles.length" class="bg-white border rounded-2xl p-6">
      <h3 class="font-black mb-3">فایل‌ها</h3>

      <div v-for="file in store.uploadedFiles" :key="file.name" class="text-sm">
        {{ file.name }}
      </div>
    </div>

    <div class="bg-emerald-50 border rounded-2xl p-6">
      <div class="flex justify-between">
        <span>هزینه تخمینی</span>
        <span class="font-black text-green-700"> {{ formatPrice(estimatedPrice) }} تومان </span>
      </div>
    </div>

    <button
      @click="handlePublishProject"
      :disabled="store.isLoading"
      class="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
    >
      {{ store.isLoading ? 'در حال ارسال...' : 'ثبت پروژه' }}
    </button>
  </div>
</template>
