import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { projectService } from '@/services/project.service'
import type { Project } from '@/types/project'

export const useProposalStore = defineStore('proposal', () => {
  const isModalOpen = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const selectedProject = ref<Project | null>(null)

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

  return {
    isModalOpen,
    isSubmitting,
    error,
    selectedProject,
    form,

    openModal,
    closeModal,
    submit,
    reset,
  }
})
