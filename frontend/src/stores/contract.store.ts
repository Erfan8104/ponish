import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { contractService } from '@/services/contract.service'
import { useProjectStore } from './project.store'

export const useContractStore = defineStore('contract', () => {
  const projectStore = useProjectStore()
  const isProcessing = ref(false)
  const errorMessage = ref<string | null>(null)
  const amendments = ref<any[]>([])

  // ⚡ کنترل باز و بسته شدن مودال الحاقیه کارفرما
  const isOpenAmendmentModal = ref(false)

  // ⚡ مودال اختصاصی جزئیات برای فریلنسر (ویژگی جدید)
  const isDetailModalOpen = ref(false)

  // ⚡ دسترسی مستقیم به قرارداد فعلی پروژه از استور پروژه
  const currentContract = computed(() => {
    return projectStore.projectDetails?.contract || null
  })

  // ⚡ دسترسی مستقیم به اطلاعات کلی پروژه
  const currentProject = computed(() => {
    return projectStore.projectDetails || null
  })

  // ⚡ گرفتن جدیدترین اصلاحیه
  const activeAmendment = computed(() => {
    return amendments.value.length > 0 ? amendments.value[0] : null
  })

  // ⚡ اکشن دریافت لیست الحاقیه‌ها از سرور
  async function fetchAmendments(contractId: number | string) {
    isProcessing.value = true
    errorMessage.value = null
    try {
      const data = await contractService.getAmendments(contractId)
      if (data.success) {
        amendments.value = data.amendments
      }
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || 'خطا در دریافت اطلاعات اصلاحیه‌ها'
      console.error(error)
    } finally {
      isProcessing.value = false
    }
  }

  // ⚡ اکشن ثبت الحاقیه توسط کارفرما
  async function createContractAmendment(
    contractId: number | string,
    data: { area: number; amount: number; description: string },
  ) {
    isProcessing.value = true
    try {
      await contractService.createAmendment(contractId, data)
      if (projectStore.projectDetails?.id && projectStore.projectDetails.contract) {
        await projectStore.openProjectDetails(projectStore.projectDetails.id)
        await fetchAmendments(projectStore.projectDetails.contract.id)
      }
      isOpenAmendmentModal.value = false
    } catch (error: any) {
      console.error('Error in contractStore (create):', error)
      throw error.response?.data?.message || 'خطا در ثبت الحاقیه'
    } finally {
      isProcessing.value = false
    }
  }

  // ⚡ اکشن ثبت پاسخ فریلنسر (تایید/رد)
  async function handleAmendmentResponse(
    amendmentId: number | string,
    status: 'accepted' | 'rejected',
  ) {
    isProcessing.value = true
    try {
      await contractService.respondToAmendment(amendmentId, status)

      // بستن مودال جزئیات پس از پاسخ
      isDetailModalOpen.value = false

      if (projectStore.projectDetails?.id) {
        await projectStore.openProjectDetails(projectStore.projectDetails.id)
        if (projectStore.projectDetails.contract?.id) {
          await fetchAmendments(projectStore.projectDetails.contract.id)
        }
      }
    } catch (error: any) {
      console.error('Error in contractStore (respond):', error)
      throw error.response?.data?.message || 'خطا در ثبت پاسخ الحاقیه'
    } finally {
      isProcessing.value = false
    }
  }

  return {
    amendments,
    activeAmendment,
    currentContract,
    currentProject,
    isProcessing,
    errorMessage,
    isOpenAmendmentModal, // برای مودال کارفرما
    isDetailModalOpen, // برای مودال فریلنسر (ویژگی جدید)
    fetchAmendments,
    createContractAmendment,
    handleAmendmentResponse,
  }
})
