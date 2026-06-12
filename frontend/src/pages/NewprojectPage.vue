<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '../stores/project.store'

// ایمپورت گام‌های ۵ گانه جدید و تخصصی نقشه‌برداری
import StepBasicInfo from '../components/steps/StepBasicInfo.vue'
import StepMapBoundary from '../components/steps/StepMapBoundary.vue'
import StepTechnicalSpecs from '../components/steps/StepTechnicalSpecs.vue'
import StepTimingBudget from '../components/steps/StepTimingBudget.vue'
import StepInvoice from '../components/steps/StepInvoice.vue'

const store = useProjectStore()

// نقشه راه ۵ مرحله‌ای مهندسی نقشه و GIS
const allSteps = [
  { id: 1, type: 'basic-info', question: 'پروژه شما در چه زمینه‌ای است و کجا قرار دارد؟' },
  { id: 2, type: 'map-boundary', question: 'محدوده یا ابعاد پروژه را مشخص کنید.' },
  { id: 3, type: 'technical-specs', question: 'نیازمندی‌های فنی، خروجی و دقت مورد نیاز چیست؟' },
  { id: 4, type: 'timing-budget', question: 'زمان تحویل، بودجه و فایل‌های ضمیمه را تعیین کنید.' },
  { id: 5, type: 'preview-invoice', question: 'پیش‌نمایش و ثبت نهایی پروژه نقشه‌برداری' },
]

// شروع فرم همیشه با گام اول است
const activeSteps = ref([allSteps[0]])

// منطق اعتبارسنجی هوشمند بر اساس فیلدهای تخصصی استور نقشه‌برداری
const isStepValid = (type: string) => {
  // گام ۱: داشتن عنوان، توضیحات، دسته‌بندی و اطلاعات مکانی
  if (type === 'basic-info') {
    return (
      !!store.formData.title &&
      !!store.formData.category &&
      !!store.formData.description &&
      !!store.formData.province &&
      !!store.formData.city
    )
  }

  // گام ۲: اگر رسم روی نقشه‌ است باید مختصات داشته باشد، اگر آپلود فایل است باید حداقل یک فایل در استور باشد
  if (type === 'map-boundary') {
    if (store.formData.areaSelectionMethod === 'map') {
      return store.formData.polygonCoordinates.length > 0
    } else {
      return store.uploadedFiles.length > 0 // فایل نقشه‌ای مثل KML آپلود شده باشد
    }
  }

  // گام ۳: حداقل یک متد برداشت فنی و حداقل یک فرمت خروجی انتخاب شده باشد
  if (type === 'technical-specs') {
    return store.formData.techType.length > 0 && store.formData.outputFormats.length > 0
  }

  // گام ۴: تعیین بازه بودجه دلخواه در صورت انتخاب تیک مربوطه
  if (type === 'timing-budget') {
    if (store.formData.budgetType === 'custom') {
      return !!store.formData.minBudget && !!store.formData.maxBudget
    }
    return true
  }

  return true
}

// متد هول دادن کاربر به گام بعدی و اسکرول نرم به پایین
const nextStep = () => {
  if (activeSteps.value.length < allSteps.length) {
    activeSteps.value.push(allSteps[activeSteps.value.length])
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  } else {
    // مرحله آخر: ارسال دیتای نهایی ساختار استور به سمت API سرور شما
    console.log('ثبت نهایی پروژه مهندسی در سرور:', store.formData, store.uploadedFiles)
  }
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-10 px-4 select-none">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="mb-6 text-right" style="direction: rtl">
        <div class="flex items-center gap-3 justify-start">
          <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#008f55] transition-all duration-300"
              :style="{ width: `${(activeSteps.length / allSteps.length) * 100}%` }"
            ></div>
          </div>
          <span class="text-xs font-bold text-gray-500 tabular-nums">
            گام {{ activeSteps.length }} از {{ allSteps.length }}
          </span>
        </div>
      </div>

      <div
        v-for="(step, index) in activeSteps"
        :key="step.id"
        class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm transition-all duration-300"
        :class="{
          'opacity-50 pointer-events-none scale-[0.99] bg-gray-50/50':
            index < activeSteps.length - 1,
        }"
      >
        <h2 class="text-lg font-bold text-gray-800 mb-6 text-right" style="direction: rtl">
          {{ step.question }}
        </h2>

        <StepBasicInfo v-if="step.type === 'basic-info'" />
        <StepMapBoundary v-if="step.type === 'map-boundary'" />
        <StepTechnicalSpecs v-if="step.type === 'technical-specs'" />
        <StepTimingBudget v-if="step.type === 'timing-budget'" />
        <StepInvoice v-if="step.type === 'preview-invoice'" />

        <div v-if="index === activeSteps.length - 1" class="mt-8 flex justify-center">
          <button
            @click="nextStep"
            :disabled="!isStepValid(step.type)"
            :class="[
              'w-full py-3.5 rounded-xl text-sm font-bold shadow-sm transition-all',
              isStepValid(step.type)
                ? 'bg-[#008f55] text-white cursor-pointer hover:bg-[#007646]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            {{
              activeSteps.length === allSteps.length
                ? 'ثبت نهایی و انتشار پروژه'
                : 'تایید و مرحله بعد'
            }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
