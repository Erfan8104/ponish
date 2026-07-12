import { api } from './api' // همان فایلی که در سایر سرویس‌ها استفاده کردید

export const messageService = {
  /**
   * دریافت تاریخچه پیام‌های یک قرارداد
   */
  async getMessages(contractId: number) {
    const response = await api.get(`/messages/contracts/${contractId}/messages`)
    return response.data.messages || []
  },

  /**
   * (اختیاری) اگر بخواهید ارسال پیام را به جای سوکت از طریق API انجام دهید
   */
  async sendMessage(contractId: number, data: { content: string; type: string }) {
    const response = await api.post(`/messages/contracts/${contractId}/messages`, data)
    return response.data.message
  },
}
