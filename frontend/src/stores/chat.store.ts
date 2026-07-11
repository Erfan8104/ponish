import { defineStore } from 'pinia'
import { ref } from 'vue'
import { messageService } from '@/services/message.service'

export interface ChatMessage {
  id: number | string
  contractId?: number
  senderId: number | string
  receiverId?: number | string
  content: string
  messageType?: 'text' | 'file' | 'system'
  fileUrl?: string | null
  createdAt?: string
  sender?: {
    id: number | string
    name?: string
    avatar?: string | null
  }
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const currentContractId = ref<number | null>(null)

  const fetchChatHistory = async (contractId: number) => {
    isLoading.value = true

    try {
      const response = await messageService.getChatHistory(contractId)
      messages.value = Array.isArray(response?.messages) ? response.messages : []
      currentContractId.value = contractId
    } catch (error) {
      console.error('Failed to load chat history:', error)
      messages.value = []
    } finally {
      isLoading.value = false
    }
  }

  const initializeChat = (contractId: number) => {
    currentContractId.value = contractId
  }

  const sendMessage = (
    contractId: number,
    senderId: number,
    receiverId: number,
    content: string,
    type: 'text' | 'file' | 'system' = 'text',
    fileUrl?: string,
  ) => {
    messages.value.push({
      id: Date.now(),
      contractId,
      senderId,
      receiverId,
      content,
      messageType: type,
      fileUrl,
      createdAt: new Date().toISOString(),
      sender: {
        id: senderId,
        name: 'شما',
      },
    })
  }

  const disconnectChat = () => {
    currentContractId.value = null
  }

  return {
    messages,
    isLoading,
    currentContractId,
    fetchChatHistory,
    initializeChat,
    sendMessage,
    disconnectChat,
  }
})
