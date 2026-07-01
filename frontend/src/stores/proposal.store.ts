// src/stores/proposal.store.ts

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { projectService } from '@/services/project.service'
import type { Project, ProposalPayload } from '@/types/project'

export const useProposalStore = defineStore('proposal', () => {
  // ==========================
  // State
  // ==========================

  const isModalOpen = ref(false)
  const isSubmitting = ref(false)

  const submitError = ref<string | null>(null)

  const selectedProject = ref<Project | null>(null)

  // ==========================
  // Form
  // ==========================

  const form = reactive({
    amount: null as number | null,
    deliveryDays: null as number | null,
    coverLetter: '',
  })

  // ==========================
  // Open Modal
  // ==========================

  const openProposalModal = (project: Project) => {
    resetForm()

    selectedProject.value = project
    isModalOpen.value = true
  }

  // ==========================
  // Close Modal
  // ==========================

  const closeModal = () => {
    isModalOpen.value = false
    selectedProject.value = null

    resetForm()
  }

  // ==========================
  // Reset Form
  // ==========================

  const resetForm = () => {
    form.amount = null
    form.deliveryDays = null
    form.coverLetter = ''

    submitError.value = null
  }

  // ==========================
  // Validation
  // ==========================

  const validateForm = () => {
    if (!form.amount || form.amount <= 0) {
      submitError.value = 'لطفا مبلغ پیشنهادی را وارد کنید.'
      return false
    }

    if (!form.deliveryDays || form.deliveryDays <= 0) {
      submitError.value = 'لطفا زمان تحویل پروژه را وارد کنید.'
      return false
    }

    if (!form.coverLetter.trim()) {
      submitError.value = 'لطفا متن پیشنهاد را وارد کنید.'
      return false
    }

    submitError.value = null

    return true
  }

  // ==========================
  // Submit Proposal
  // ==========================

  const submitProposal = async () => {
    if (!selectedProject.value) return

    if (!validateForm()) return

    isSubmitting.value = true

    try {
      const payload: ProposalPayload = {
        projectId: selectedProject.value.id,
        amount: form.amount!,
        deliveryDays: form.deliveryDays!,
        coverLetter: form.coverLetter,
      }

      const response = await projectService.sendProposal(payload)

      closeModal()

      alert('پیشنهاد شما با موفقیت ثبت شد.')

      return response
    } catch (error: any) {
      console.error(error)

      submitError.value =
        error.response?.data?.message ?? 'خطا در ارسال پیشنهاد. لطفا دوباره تلاش کنید.'

      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    // state
    isModalOpen,
    isSubmitting,
    submitError,
    selectedProject,

    // form
    form,

    // actions
    openProposalModal,
    closeModal,
    submitProposal,
    resetForm,
  }
})
