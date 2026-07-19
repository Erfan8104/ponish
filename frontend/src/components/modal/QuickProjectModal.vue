<template>
  <Transition name="fade">
    <div
      v-if="modalStore.isOpen"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div
        @click="modalStore.closeModal"
        class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      ></div>

      <div
        class="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8"
        style="direction: rtl"
      >
        <h3 class="text-2xl font-black text-gray-800 mb-2">ثبت سریع پروژه</h3>
        <p class="text-sm text-gray-500 mb-6">اطلاعات اولیه را وارد کنید تا پروژه شما ثبت شود.</p>

        <div class="space-y-4">
          <!-- عنوان پروژه -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 mr-1">عنوان پروژه</label>
            <input
              v-model="projectStore.formData.title"
              type="text"
              placeholder="مثال: نقشه‌برداری زمین کشاورزی..."
              :class="{ 'border-red-500': errors.title }"
              class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p v-if="errors.title" class="text-red-500 text-xs mt-1 mr-1">{{ errors.title }}</p>
          </div>

          <!-- انتخاب نوع پروژه -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 mr-1">نوع پروژه</label>
            <select
              v-model="projectStore.formData.category"
              :class="{ 'border-red-500': errors.category }"
              class="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option value="" disabled>انتخاب کنید...</option>
              <option value="mapping">نقشه‌برداری زمینی</option>
              <option value="drone">عکس‌برداری هوایی</option>
              <option value="drafting">ترسیم و کارتوگرافی</option>
              <option value="gis">خدمات GIS</option>
              <option value="other">سایر (وارد کنید...)</option>
            </select>
            <p v-if="errors.category" class="text-red-500 text-xs mt-1 mr-1">
              {{ errors.category }}
            </p>

            <input
              v-if="projectStore.formData.category === 'other'"
              v-model="customCategory"
              type="text"
              placeholder="نوع پروژه را بنویسید..."
              class="w-full p-3 mt-2 rounded-xl border border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <!-- فیلد مخصوص نقشه برداری زمینی -->
          <div
            v-if="
              projectStore.formData.category === 'mapping' ||
              projectStore.formData.category === 'drone'
            "
            class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
          >
            <label class="block text-xs font-bold text-emerald-800 mb-2 mr-1"
              >نوع عملیات نقشه برداری</label
            >
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="projectStore.formData.mappingType"
                  value="area"
                  class="accent-emerald-600"
                />
                <span class="text-sm font-medium text-emerald-900">مقطع (مساحت)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="projectStore.formData.mappingType"
                  value="corridor"
                  class="accent-emerald-600"
                />
                <span class="text-sm font-medium text-emerald-900">کریدور (طولی)</span>
              </label>
            </div>
            <p v-if="errors.mapping" class="text-red-500 text-xs mt-2">{{ errors.mapping }}</p>
          </div>

          <!-- مساحت/طول و زمان تحویل -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-if="
                projectStore.formData.category === 'mapping' ||
                projectStore.formData.category === 'drone'
              "
            >
              <label class="block text-xs font-bold text-gray-700 mb-1 mr-1">
                {{
                  projectStore.formData.mappingType === 'corridor' ? 'طول مسیر (km)' : 'مساحت (ha)'
                }}
              </label>
              <input
                v-if="projectStore.formData.mappingType === 'corridor'"
                v-model.number="projectStore.formData.corridorLength"
                type="number"
                :class="{ 'border-red-500': errors.mapping }"
                class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                v-else
                v-model.number="projectStore.formData.calculatedArea"
                type="number"
                :class="{ 'border-red-500': errors.mapping }"
                class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1 mr-1"
                >زمان انجام پروژه</label
              >
              <select
                v-model="projectStore.formData.deliveryTime"
                :class="{ 'border-red-500': errors.deliveryTime }"
                class="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="" disabled selected>زمان انجام پروژه را انتخاب کنید...</option>
                <option value="1-week">کمتر از یک هفته</option>
                <option value="2-weeks">یک تا دو هفته</option>
                <option value="1-month">یک ماه</option>
                <option value="custom-days">تعداد روز دستی</option>
              </select>
              <p v-if="errors.deliveryTime" class="text-red-500 text-xs mt-1 mr-1">
                {{ errors.deliveryTime }}
              </p>
            </div>
          </div>

          <input
            v-if="projectStore.formData.deliveryTime === 'custom-days'"
            v-model="customDays"
            type="number"
            placeholder="تعداد روز مورد نظر..."
            class="w-full p-3 rounded-xl border border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            v-model="projectStore.formData.minBudget"
            type="number"
            placeholder="مبلغ پیشنهادی (تومان)"
            class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <textarea
            v-model="projectStore.formData.description"
            placeholder="توضیحات تکمیلی..."
            class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
          ></textarea>

          <button
            @click="handleFastSubmit"
            :disabled="projectStore.isLoading"
            class="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {{ projectStore.isLoading ? 'در حال ثبت...' : 'ثبت نهایی پروژه' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { useQuickProjectModalStore } from '@/stores/QuickProject.modal.store'

const projectStore = useProjectStore()
const modalStore = useQuickProjectModalStore()
const errors = ref<Record<string, string>>({})
const customCategory = ref('')
const customDays = ref<number | null>(null)

// پاک کردن خطا هنگام تغییر هر فیلد
watch(
  () => projectStore.formData,
  () => {
    errors.value = {}
  },
  { deep: true },
)

// مدیریت تغییر نوع نقشه برداری
watch(
  () => projectStore.formData.mappingType,
  (val) => {
    if (val === 'area') projectStore.formData.corridorLength = 0
    else projectStore.formData.calculatedArea = 0
  },
)

const validateForm = () => {
  errors.value = {}
  // ... سایر اعتبارسنجی‌ها

  // اصلاح شرط زیر برای پشتیبانی از mapping و drone
  if (['mapping', 'drone'].includes(projectStore.formData.category)) {
    if (!projectStore.formData.mappingType) {
      errors.value.mapping = 'نوع عملیات نقشه‌برداری را انتخاب کنید'
    } else if (
      projectStore.formData.mappingType === 'area' &&
      !projectStore.formData.calculatedArea
    ) {
      errors.value.mapping = 'مساحت را وارد کنید'
    } else if (
      projectStore.formData.mappingType === 'corridor' &&
      !projectStore.formData.corridorLength
    ) {
      errors.value.mapping = 'طول مسیر را وارد کنید'
    }
  }
  return Object.keys(errors.value).length === 0
}

const handleFastSubmit = async () => {
  if (!validateForm()) return

  if (projectStore.formData.category === 'other') {
    projectStore.formData.category = customCategory.value
  }
  if (projectStore.formData.deliveryTime === 'custom-days') {
    projectStore.formData.deliveryTime = `${customDays.value}-days`
  }
  // قبلاً فقط mapping چک می‌شد، حالا drone هم اضافه شد
  if (projectStore.formData.category !== 'mapping' && projectStore.formData.category !== 'drone') {
    projectStore.formData.mappingType = null
  }
  // --

  projectStore.isQuickEntry = true
  try {
    await projectStore.submitProject()
    modalStore.closeModal()
    customCategory.value = ''
    customDays.value = null
  } catch (error) {
    console.error(error)
  }
}
</script>
