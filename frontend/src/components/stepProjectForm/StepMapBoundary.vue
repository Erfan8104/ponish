<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import LeafletBoundaryMap from '../map/LeafletBoundaryMap.vue'
import FileUploader from './FileUploader.vue'

const store = useProjectStore()

// بررسی اینکه آیا کتگوری انتخابی جزو مواردی است که نیازی به نقشه/محدوده ندارند
const isGisOrDrafting = computed(() => {
  return ['gis', 'drafting'].includes(store.formData.category)
})

const terrainOptions = [
  { id: 'hard_mountain', label: 'کوهستانی سخت' },
  { id: 'mountain', label: 'کوهستانی' },
  { id: 'hilly', label: 'تپه ماهور' },
  { id: 'forest', label: 'جنگل' },
  { id: 'urban_rural', label: 'شهری / روستایی' },
]

const toggleTerrain = (id: string) => {
  const index = store.formData.terrainTypes.indexOf(id)
  if (index === -1) {
    store.formData.terrainTypes.push(id)
  } else {
    store.formData.terrainTypes.splice(index, 1)
  }
}

onMounted(() => {
  if (!store.formData.areaSelectionMethod) store.formData.areaSelectionMethod = 'map'
  if (!store.formData.utmZone) store.formData.utmZone = 'auto'
})
</script>

<template>
  <div class="space-y-8 text-right" style="direction: rtl">
    <!-- اگر کاربر خدمات GIS یا ترسیم و کارتوگرافی را انتخاب کرده باشد، این بخش‌ها مخفی می‌شوند -->
    <template v-if="!isGisOrDrafting">
      <!-- 1. انتخاب نوع پروژه (طولی یا مساحتی) -->
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-3 mr-1">نوع پروژه نقشه‌برداری</label>
        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            @click="store.setMappingType('area')"
            class="p-4 border rounded-xl text-xs font-bold transition-all"
            :class="
              store.formData.mappingType === 'area'
                ? 'border-[#008f55] bg-emerald-50 text-[#008f55]'
                : 'border-gray-200 hover:border-gray-300'
            "
          >
            📐 پروژه‌های مساحتی
          </button>
          <button
            type="button"
            @click="store.setMappingType('corridor')"
            class="p-4 border rounded-xl text-xs font-bold transition-all"
            :class="
              store.formData.mappingType === 'corridor'
                ? 'border-[#008f55] bg-emerald-50 text-[#008f55]'
                : 'border-gray-200 hover:border-gray-300'
            "
          >
            🛣️ پروژه‌های مسیر (کریدور)
          </button>
        </div>
      </div>

      <!-- 2. فیلد ورودی طول در صورت انتخاب کریدور -->
      <div v-if="store.formData.mappingType === 'corridor'" class="bg-gray-50 p-4 rounded-xl">
        <label class="block text-xs font-bold text-gray-600 mb-2">طول مسیر پروژه (کیلومتر)</label>
        <input
          v-model="store.formData.corridorLength"
          type="number"
          placeholder="مثال: 5.5"
          class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#008f55]"
        />
      </div>

      <!-- 3. انتخاب روش تعیین محدوده -->
      <div v-if="store.formData.mappingType">
        <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
          >محدوده پروژه را چگونه مشخص می‌کنید؟</label
        >
        <div class="flex bg-gray-100 p-1.5 rounded-xl max-w-md">
          <button
            type="button"
            @click="store.formData.areaSelectionMethod = 'map'"
            class="flex-1 py-2.5 text-xs font-bold rounded-lg"
            :class="
              store.formData.areaSelectionMethod === 'map'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400'
            "
          >
            🗺️ رسم روی نقشه
          </button>
          <button
            type="button"
            @click="store.formData.areaSelectionMethod = 'upload'"
            class="flex-1 py-2.5 text-xs font-bold rounded-lg"
            :class="
              store.formData.areaSelectionMethod === 'upload'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400'
            "
          >
            📂 آپلود فایل
          </button>
        </div>
      </div>

      <!-- 4. نقشه یا آپلود -->
      <div
        v-if="store.formData.mappingType && store.formData.areaSelectionMethod === 'map'"
        class="space-y-4"
      >
        <div class="relative overflow-hidden rounded-2xl border min-h-[300px]">
          <LeafletBoundaryMap />
        </div>

        <!-- نمایش محاسبات -->
        <div
          v-if="store.formData.calculatedArea > 0 || store.formData.corridorLength > 0"
          class="bg-emerald-50 border border-emerald-100 rounded-xl p-4"
        >
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">{{
              store.formData.mappingType === 'area' ? 'مساحت محاسبه شده:' : 'طول محاسبه شده:'
            }}</span>
            <span class="font-bold text-[#008f55]">
              {{
                store.formData.mappingType === 'area'
                  ? store.formData.calculatedArea + ' هکتار'
                  : store.formData.corridorLength + ' کیلومتر'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- حالت آپلود فایل -->
      <div
        v-if="store.formData.mappingType && store.formData.areaSelectionMethod === 'upload'"
        class="space-y-4"
      >
        <FileUploader />
      </div>
    </template>

    <!-- پیام راهنما در صورت انتخاب خدمات GIS یا ترسیم و کارتوگرافی -->
    <div v-else class="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 text-sm">
      ℹ️ برای حوزه‌های «خدمات GIS» و «ترسیم و کارتوگرافی» نیازی به مشخص کردن محدوده روی نقشه یا
      آپلود فایل جغرافیایی نیست. لطفاً فقط نوع منطقه را تعیین کنید.
    </div>

    <!-- 5. سایر تنظیمات (نوع زمین و مختصات) -->
    <div class="pt-4 space-y-6">
      <div class="border-t pt-6">
        <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
          >نوع منطقه (انتخاب چندگانه)</label
        >
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="terrain in terrainOptions"
            :key="terrain.id"
            @click="toggleTerrain(terrain.id)"
            class="border rounded-xl p-3 cursor-pointer text-center text-xs font-bold transition-all"
            :class="
              store.formData.terrainTypes.includes(terrain.id)
                ? 'border-[#008f55] bg-emerald-50 text-[#008f55]'
                : 'border-gray-200 bg-white text-gray-600'
            "
          >
            {{ terrain.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
