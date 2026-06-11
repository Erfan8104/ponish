// stores/projectStore.ts
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useProjectStore = defineStore('project', () => {
  // کل داده‌های فرم پروژه
  const formData = reactive({
    category: '',
    title: '',
    description: '',
    skills: [] as string[],
    priority: 'balanced',
    budgetType: 'custom',
    minBudget: '',
    maxBudget: '',
  })

  // مدیریت فایل‌های آپلود شده
  const uploadedFiles = ref<File[]>([])

  // مقادیر ثابت مالی
  const baseProjectPrice = 199000
  const vatTaxAmount = computed(() => Math.round(baseProjectPrice * 0.1))
  const totalInvoiceAmount = computed(() => baseProjectPrice + vatTaxAmount.value)

  // متدهای کمکی برای مدیریت فایل‌ها
  const addFiles = (files: File[]) => {
    uploadedFiles.value = [...uploadedFiles.value, ...files]
  }

  const removeFile = (index: number) => {
    uploadedFiles.value = uploadedFiles.value.filter((_, idx) => idx !== index)
  }

  return {
    formData,
    uploadedFiles,
    baseProjectPrice,
    vatTaxAmount,
    totalInvoiceAmount,
    addFiles,
    removeFile,
  }
})
