import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQuickProjectModalStore = defineStore('quick-project-modal', () => {
  // وضعیت باز یا بسته بودن مودال
  const isOpen = ref(false)

  // تابع باز کردن مودال
  const openModal = () => {
    isOpen.value = true
  }

  // تابع بستن مودال
  const closeModal = () => {
    isOpen.value = false
  }

  // سوئیچ کردن وضعیت (اختیاری)
  const toggleModal = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  }
})
