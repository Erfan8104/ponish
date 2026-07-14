// فایل: src/services/contract.service.ts
import { api } from './api' // مطمئن شویدل api.ts شما درست مپ شده است

export const contractService = {
  // ۱. ارسال پیشنهاد الحاقیه توسط کارفرما (ثبت اولیه با وضعیت pending)
  async createAmendment(
    contractId: number | string,
    data: { area: number; amount: number; description: string },
  ) {
    const response = await api.post(`/contracts/${contractId}/amendments`, {
      proposed_area: data.area,
      proposed_amount: data.amount,
      notes: data.description,
    })
    return response.data
  },

  async getAmendments(contractId: number | string) {
    const response = await api.get(`/contracts/${contractId}/amendments`)
    return response.data
  },

  //

  // ۲. ثبت پاسخ (تایید یا رد) فریلنسر به الحاقیه پیشنهاد شده
  async respondToAmendment(amendmentId: number | string, status: 'accepted' | 'rejected') {
    const response = await api.patch(`/contracts/amendments/${amendmentId}`, {
      status: status,
    })
    return response.data
  },
}
