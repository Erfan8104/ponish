<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../stores/project.store'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

import StepBasicInfo from '../components/steps/StepBasicInfo.vue'
import StepMapBoundary from '../components/steps/StepMapBoundary.vue'
import StepTechnicalSpecs from '../components/steps/StepTechnicalSpecs.vue'
import StepTimingBudget from '../components/steps/StepTimingBudget.vue'
import StepInvoice from '../components/steps/StepInvoice.vue'
import StepSuccess from '../components/steps/SuccessCreateProject.vue' // ۱. وارد کردن صفحه موفقیت

const store = useProjectStore()
const toast = useToast()
const router = useRouter()

const isSubmitted = ref(false) // ۲. وضعیت نمایش صفحه نهایی

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
  if (type === 'basic-info')
    return store.formData.title?.trim().length && store.formData.province && store.formData.city
  if (type === 'map-boundary') {
    if (store.formData.areaSelectionMethod === 'map')
      return store.formData.polygonCoordinates?.length >= 3
    return store.uploadedFiles?.length > 0
  }
  if (type === 'technical-specs')
    return store.formData.techType?.length > 0 && store.formData.outputFormats?.length > 0
  if (type === 'timing-budget') {
    return true
  }
  return true
})

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToStep = (targetIndex: number) => {
  if (isSubmitted.value) return // اگر فرم ثبت شده، کلیک روی هدر قفل شود
  if (targetIndex === currentStep.value) return
  if (targetIndex < currentStep.value) {
    currentStep.value = targetIndex
    return
  }
  if (targetIndex > currentStep.value) {
    if (!isStepValid.value) {
      toast.error('لطفاً ابتدا اطلاعات مرحله فعلی را به طور کامل و صحیح وارد کنید.')
      return
    }
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
  if (currentStep.value > 0) currentStep.value--
}

const submitProject = async () => {
  const payload = {
    ...store.formData,
    filesCount: store.uploadedFiles.length,
  }
  console.log('PROJECT PAYLOAD', payload)

  // تغییر وضعیت به ثبت نهایی و نمایش کامپوننت موفقیت
  isSubmitted.value = true
  toast.success('پروژه شما با موفقیت ثبت شد!')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// تابعی برای ریست کردن کل فرم (مخصوص دکمه ثبت پروژه جدید)
const handleResetForm = () => {
  store.$reset() // اگر پینیا متد ریست دارد، در غیر این صورت فیلدها را دستی خالی کن
  currentStep.value = 0
  isSubmitted.value = false
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <div v-if="!isSubmitted" class="mb-8" style="direction: rtl">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 class="text-lg md:text-xl font-black text-gray-800 text-right">
            ثبت پروژه نقشه‌برداری
          </h1>

          <div
            class="flex items-center justify-between md:justify-end md:gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100"
          >
            <button
              @click="goToDashboard"
              class="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors bg-gray-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg md:bg-transparent md:p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span>خروج و بازگشت</span>
            </button>

            <span
              class="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 md:border-0 md:bg-transparent md:p-0"
            >
              مرحله {{ currentStep + 1 }} از {{ steps.length }}
            </span>
          </div>
        </div>

        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#008f55] transition-all duration-300"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <div v-if="!isSubmitted" class="grid grid-cols-5 gap-1 mb-6" style="direction: rtl">
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
        <div v-if="!isSubmitted">
          <div class="mb-8 text-right" style="direction: rtl">
            <h2 class="text-lg font-black text-gray-800">{{ currentStepData.question }}</h2>
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
              @click="goToDashboard"
              type="button"
              class="px-6 py-3 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition-all mr-auto"
            >
              انصراف و بازگشت
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

        <StepSuccess v-else :projectTitle="store.formData.title" @reset="handleResetForm" />
      </div>
    </div>
  </main>
</template>
