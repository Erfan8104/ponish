import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { projectService } from '@/services/project.service'
import { useProjectStore } from './project.store' // 👈 ۱. ایمپورت استور پروژه
import type { Project } from '@/types/project'

export const useProposalStore = defineStore('proposal', () => {
  const projectStore = useProjectStore() // 👈 ۲. نمونه‌سازی از استور پروژه

  const isModalOpen = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const selectedProject = ref<Project | null>(null)
  const proposals = ref<any[]>([])
  const form = reactive({
    amount: null as number | null,
    deliveryDays: null as number | null,
    coverLetter: '',
  })

  const openModal = (project: Project) => {
    selectedProject.value = project
    isModalOpen.value = true
    reset()
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedProject.value = null
    reset()
  }

  const reset = () => {
    form.amount = null
    form.deliveryDays = null
    form.coverLetter = ''
    error.value = null
  }

  const submit = async () => {
    if (!selectedProject.value) return

    if (!form.amount || !form.deliveryDays || !form.coverLetter.trim()) {
      error.value = 'تمام فیلدها الزامی هستند'
      return
    }

    isSubmitting.value = true

    try {
      await projectService.sendProposal({
        projectId: selectedProject.value.id,
        amount: form.amount,
        deliveryDays: form.deliveryDays,
        coverLetter: form.coverLetter,
      })

      closeModal()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ارسال پیشنهاد'
    } finally {
      isSubmitting.value = false
    }
  }

  const fetchProjectProposals = async (projectId: number) => {
    try {
      proposals.value = await projectService.getProjectProposals(projectId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پیشنهادها'
    }
  }

  /**
   * ۳. اکشن جدید قبول پیشنهاد منطبق بر منطق تراکنش بک‌اَند
   */
  const acceptProposal = async (proposalId: number) => {
    isSubmitting.value = true
    error.value = null

    try {
      const res = await projectService.acceptProposal(proposalId)

      // الف) به‌روزرسانی وضعیت پیشنهادها در استیت محلی همین استور
      proposals.value = proposals.value.map((proposal) => {
        if (proposal.id === proposalId) {
          return { ...proposal, status: 'accepted' }
        } else if (proposal.status === 'pending') {
          return { ...proposal, status: 'rejected' }
        }
        return proposal
      })

      // ب) تغییر وضعیت خود پروژه به در حال انجام در تمام بخش‌های لایه کاربری
      if (projectStore.projectDetails?.id) {
        projectStore.updateProjectStatusLocally(projectStore.projectDetails.id, 'in_progress')
      }

      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در تایید پیشنهاد'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isModalOpen,
    isSubmitting,
    error,
    selectedProject,
    form,
    proposals,

    openModal,
    closeModal,
    submit,
    reset,

    fetchProjectProposals,
    acceptProposal, // 👈 ۴. خروجی دادن متد جدید برای استفاده در کامپوننت‌
  }
})
