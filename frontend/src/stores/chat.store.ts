import { defineStore } from 'pinia'
import { ref } from 'vue'
import { messageService } from '@/services/message.service'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions

  // ۱. دریافت تاریخچه پیام‌ها
  const fetchMessages = async (contractId: number) => {
    isLoading.value = true
    error.value = null
    try {
      messages.value = await messageService.getMessages(contractId)
    } catch (err: any) {
      error.value = err.message || 'خطا در دریافت پیام‌ها'
    } finally {
      isLoading.value = false
    }
  }

  // ۲. افزودن پیام جدید به لیست (هنگام دریافت از سوکت)
  const addMessage = (message: any) => {
    messages.value.push(message)
  }

  // ۳. پاک کردن پیام‌ها (مثلاً هنگام خروج از مودال)
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    clearMessages,
  }
})
