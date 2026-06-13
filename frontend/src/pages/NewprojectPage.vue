<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../stores/project.store'
import { useToast } from 'vue-toastification' // ۱. وارد کردن توست

import StepBasicInfo from '../components/steps/StepBasicInfo.vue'
import StepMapBoundary from '../components/steps/StepMapBoundary.vue'
import StepTechnicalSpecs from '../components/steps/StepTechnicalSpecs.vue'
import StepTimingBudget from '../components/steps/StepTimingBudget.vue'
import StepInvoice from '../components/steps/StepInvoice.vue'

const store = useProjectStore()
const toast = useToast() // ۲. راه‌اندازی توست

const steps = [
  { id: 1, type: 'basic-info', title: 'اطلاعات پروژه', question: 'پروژه خود را معرفی کنید' },
  {
    id: 2,
    type: 'map-boundary',
    title: 'محدوده پروژه',
    question: 'محدوده عملیات را روی نقشه مشخص کنید',
  },
  {
    id: 3,
    type: 'technical-specs',
    title: 'خدمات و خروجی‌ها',
    question: 'نوع خدمات و خروجی مورد نیاز را انتخاب کنید',
  },
  {
    id: 4,
    type: 'timing-budget',
    title: 'زمان و بودجه',
    question: 'زمان تحویل، بودجه و فایل‌های ضمیمه را مشخص کنید',
  },
  { id: 5, type: 'preview', title: 'بازبینی نهایی', question: 'اطلاعات پروژه را بررسی و ثبت کنید' },
]

const currentStep = ref(0)
const currentStepData = computed(() => steps[currentStep.value])

const progress = computed(() => {
  return Math.round(((currentStep.value + 1) / steps.length) * 100)
})

const isStepValid = computed(() => {
  const type = currentStepData.value.type

  if (type === 'basic-info') {
    return store.formData.title.trim().length > 1 && store.formData.province && store.formData.city
  }
  if (type === 'map-boundary') {
    if (store.formData.areaSelectionMethod === 'map') {
      return store.formData.polygonCoordinates.length >= 3
    }
    return store.uploadedFiles.length > 0
  }
  if (type === 'technical-specs') {
    return store.formData.techType.length > 0 && store.formData.outputFormats.length > 0
  }
  if (type === 'timing-budget') {
    if (store.formData.budgetType === 'custom') {
      const min = Number(store.formData.minBudget)
      const max = Number(store.formData.maxBudget)
      return min > 0 && max >= min
    }
    return true
  }
  return true
})

// ۳. تابع جدید مدیریت کلیک روی هدر با نوتیفیکیشن
const goToStep = (targetIndex: number) => {
  if (targetIndex === currentStep.value) return

  // بازگشت به مراحل قبلی همیشه مجاز است
  if (targetIndex < currentStep.value) {
    currentStep.value = targetIndex
    return
  }

  // تلاش برای رفتن به مراحل جلوتر
  if (targetIndex > currentStep.value) {
    if (!isStepValid.value) {
      toast.error('لطفاً ابتدا اطلاعات مرحله فعلی را به طور کامل و صحیح وارد کنید.')
      return
    }

    // جلو افتادن بیش از یک مرحله مجاز نیست (باید پله پله جلو برود)
    if (targetIndex > currentStep.value + 1) {
      toast.warning('شما نمی‌توانید مراحل را جا بیندازید. لطفاً گام به گام جلو بروید.')
      return
    }

    currentStep.value = targetIndex
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextStep = () => {
  if (!isStepValid.value) return

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    submitProject()
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitProject = async () => {
  const payload = {
    ...store.formData,
    filesCount: store.uploadedFiles.length,
  }
  console.log('PROJECT PAYLOAD', payload)
  toast.success('پروژه شما با موفقیت ثبت شد!')
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-3" style="direction: rtl">
          <h1 class="text-xl font-black text-gray-800">ثبت پروژه نقشه‌برداری</h1>
          <span class="text-xs font-bold text-gray-500">
            مرحله {{ currentStep + 1 }} از {{ steps.length }}
          </span>
        </div>

        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#008f55] transition-all duration-300"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <div class="grid grid-cols-5 gap-1 mb-6" style="direction: rtl">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          @click="goToStep(index)"
          class="rounded-xl border items-center py-3 justify-center text-center transition-all cursor-pointer select-none"
          :class="[
            currentStep === index
              ? 'border-[#008f55] bg-emerald-50'
              : currentStep > index
                ? 'border-emerald-200 bg-white'
                : 'border-gray-200 bg-white',
          ]"
        >
          <div
            class="flex text-[8px] md:text-[13px] items-center justify-center font-semibold"
            :class="currentStep >= index ? 'text-[#008f55]' : 'text-gray-400'"
          >
            {{ step.title }}
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div class="mb-8 text-right" style="direction: rtl">
          <h2 class="text-lg font-black text-gray-800">
            {{ currentStepData.question }}
          </h2>
        </div>

        <StepBasicInfo v-if="currentStepData.type === 'basic-info'" />
        <StepMapBoundary v-if="currentStepData.type === 'map-boundary'" />
        <StepTechnicalSpecs v-if="currentStepData.type === 'technical-specs'" />
        <StepTimingBudget v-if="currentStepData.type === 'timing-budget'" />
        <StepInvoice v-if="currentStepData.type === 'preview'" />

        <div class="flex gap-3 mt-10" style="direction: rtl">
          <button
            v-if="currentStep > 0"
            @click="previousStep"
            type="button"
            class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            مرحله قبل
          </button>

          <button
            @click="nextStep"
            :disabled="!isStepValid"
            type="button"
            class="flex-1 py-3 rounded-xl font-bold transition-all"
            :class="
              isStepValid
                ? 'bg-[#008f55] text-white hover:bg-[#007646]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            "
          >
            {{ currentStep === steps.length - 1 ? 'ثبت نهایی پروژه' : 'ادامه' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
