// src/stores/buttoncreateproject.store.ts
import { defineStore } from 'pinia'

export const useButtonCreateProjectStore = defineStore('buttonCreateProject', {
  state: () => ({
    isModalOpen: false, // این متغیر تعیین می‌کند مودال باز باشد یا نه
  }),
  actions: {
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
  },
})
