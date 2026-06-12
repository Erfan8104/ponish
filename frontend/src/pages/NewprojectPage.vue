<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '../stores/project.store'

// ایمپورت گام‌های شش‌گانه فُرم
import StepCategory from '../components/steps/StepCategory.vue'
import StepTitle from '../components/steps/StepTitle.vue'
import StepDescription from '../components/steps/StepDescription.vue'
import StepSkills from '../components/steps/StepSkills.vue'
import StepBudget from '../components/steps/StepBudget.vue'
import StepInvoice from '../components/steps/StepInvoice.vue'

const store = useProjectStore()

const allSteps = [
  { id: 1, type: 'basic-info', question: 'پروژه شما در چه زمینه‌ای است و کجا قرار دارد؟' },
  { id: 2, type: 'map-boundary', question: 'محدوده یا ابعاد پروژه را مشخص کنید.' },
  { id: 3, type: 'technical-specs', question: 'نیازمندی‌های فنی، خروجی و دقت مورد نیاز چیست؟' },
  { id: 4, type: 'timing-budget', question: 'زمان تحویل و بودجه پیشنهادی خود را تعیین کنید.' },
  { id: 5, type: 'preview-invoice', question: 'پیش‌نمایش و ثبت نهایی پروژه نقشه‌برداری' },
]

const activeSteps = ref([allSteps[0]])

const isStepValid = (type: string) => {
  if (type === 'search') return !!store.formData.category
  if (type === 'title-input') return !!store.formData.title
  if (type === 'description-input') return !!store.formData.description
  if (type === 'skills-input') return store.formData.skills.length > 0
  if (type === 'budget-input')
    return (
      store.formData.budgetType !== 'custom' ||
      (!!store.formData.minBudget && !!store.formData.maxBudget)
    )
  return true
}

const nextStep = () => {
  if (activeSteps.value.length < allSteps.length) {
    activeSteps.value.push(allSteps[activeSteps.value.length])
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  } else {
    console.log('ثبت نهایی از استور:', store.formData, store.uploadedFiles)
  }
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-10 px-4 select-none">
    <div class="max-w-4xl mx-auto space-y-8">
      <div
        v-for="(step, index) in activeSteps"
        :key="step.id"
        class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm transition-all"
        :class="{ 'opacity-50 pointer-events-none scale-[0.99]': index < activeSteps.length - 1 }"
      >
        <h2 class="text-lg font-bold text-gray-800 mb-6 text-right" style="direction: rtl">
          {{ step.question }}
        </h2>

        <StepCategory v-if="step.type === 'search'" />
        <StepTitle v-if="step.type === 'title-input'" />
        <StepDescription v-if="step.type === 'description-input'" />
        <StepSkills v-if="step.type === 'skills-input'" />
        <StepBudget v-if="step.type === 'budget-input'" />
        <StepInvoice v-if="step.type === 'preview-invoice'" />

        <div v-if="index === activeSteps.length - 1" class="mt-8 flex justify-center">
          <button
            @click="nextStep"
            :disabled="!isStepValid(step.type)"
            :class="[
              'w-full py-3 rounded-xl text-sm font-bold shadow-sm',
              isStepValid(step.type)
                ? 'bg-[#008f55] text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            {{ activeSteps.length === allSteps.length ? 'تایید و ادامه' : 'مرحله بعد' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
