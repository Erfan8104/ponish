import { api } from './api'

export const messageService = {
  async getChatHistory(contractId: number) {
    const response = await api.get(`/messages/history/${contractId}`)
    return response.data
  },

  async uploadChatFile(contractId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('contractId', String(contractId))

    const response = await api.post(`/messages/upload/${contractId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },
}
