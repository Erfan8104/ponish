// فایل: src/services/contract.service.ts
import { api } from './api' // مطمئن شوید api.ts شما درست مپ شده است

export const contractService = {
  // ۱. ارسال پیشنهاد الحاقیه توسط کارفرما (پشتیبانی از مساحت یا طول کریدور)
  async createAmendment(
    contractId: number | string,
    data: {
      area?: number | null
      length?: number | null // 🌟 اضافه شدن طول برای پروژه‌های کریدوری
      amount: number
      deliveryTime: number
      description: string
    },
  ) {
    const response = await api.post(`/contracts/${contractId}/amendments`, {
      proposed_area: data.area ?? null,
      proposed_length: data.length ?? null, // 🌟 ارسال طول به بک‌اند
      proposed_amount: data.amount,
      proposed_delivery_time: data.deliveryTime,
      notes: data.description,
    })
    return response.data
  },

  async getAmendments(contractId: number | string) {
    const response = await api.get(`/contracts/${contractId}/amendments`)
    return response.data
  },

  // ۲. ثبت پاسخ (تایید یا رد) فریلنسر به الحاقیه پیشنهاد شده
  async respondToAmendment(amendmentId: number | string, status: 'accepted' | 'rejected') {
    const response = await api.patch(`/contracts/amendments/${amendmentId}`, {
      status: status,
    })
    return response.data
  },
}
