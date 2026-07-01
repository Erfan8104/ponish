import { api } from './api'
import type { Project, ActivityLog } from '@/types/project'

export interface ProposalPayload {
  projectId: number
  amount: number
  deliveryDays: number
  coverLetter: string
}

export const projectService = {
  // ۱. دریافت پروژه‌ها با آدرس جدید بک‌اَند
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get('/projects/list')
    return response.data.projects || response.data
  },

  // ۲. دریافت جزئیات یک پروژه با آدرس جدید بک‌اَند
  async getProjectById(id: number): Promise<Project> {
    const response = await api.get(`/projects/detail/${id}`)
    return response.data.project || response.data
  },

  // ۳. ارسال اطلاعات فرم چند مرحله‌ای به صورت Multipart
  async createProject(formDataRaw: any, uploadedFiles: File[]): Promise<any> {
    const data = new FormData()

    data.append('title', formDataRaw.title || '')
    data.append('category', formDataRaw.category || '')
    data.append('description', formDataRaw.description || '')
    if (formDataRaw.province) data.append('province', formDataRaw.province)
    if (formDataRaw.city) data.append('city', formDataRaw.city)
    if (formDataRaw.address) data.append('address', formDataRaw.address)

    if (formDataRaw.areaSelectionMethod)
      data.append('areaSelectionMethod', formDataRaw.areaSelectionMethod)
    if (formDataRaw.calculatedArea)
      data.append('calculatedArea', formDataRaw.calculatedArea.toString())
    if (formDataRaw.coordinateSystem) data.append('coordinateSystem', formDataRaw.coordinateSystem)
    if (formDataRaw.utmZone) data.append('utmZone', formDataRaw.utmZone)

    if (formDataRaw.polygonCoordinates && formDataRaw.polygonCoordinates.length > 0) {
      data.append('polygonCoordinates', JSON.stringify(formDataRaw.polygonCoordinates))
    }
    if (formDataRaw.geoJson) {
      data.append('geoJson', JSON.stringify(formDataRaw.geoJson))
    }

    data.append('techType', JSON.stringify(formDataRaw.techType || []))
    data.append('outputFormats', JSON.stringify(formDataRaw.outputFormats || []))
    if (formDataRaw.requiredAccuracy) data.append('requiredAccuracy', formDataRaw.requiredAccuracy)

    if (formDataRaw.deliveryTime) data.append('deliveryTime', formDataRaw.deliveryTime)
    data.append('budgetType', formDataRaw.budgetType || 'fixed')
    if (formDataRaw.minBudget) data.append('minBudget', formDataRaw.minBudget.toString())
    if (formDataRaw.maxBudget) data.append('maxBudget', formDataRaw.maxBudget.toString())

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        data.append('attachments', file)
      })
    }

    const response = await api.post('/projects/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // ۴. ارسال پیشنهاد قیمت توسط فریلنسر (👈 متد جدید اضافه شده)
  async sendProposal(payload: ProposalPayload): Promise<any> {
    // از آنجا که روت بک‌آند شما /api/projects/proposals/submit است
    // و نمونه api خودش پیش‌فرض /api را دارد، آدرس زیر دقیقاً درست است:
    const response = await api.post('/projects/proposals/submit', payload)
    return response.data
  },

  // ۵. دریافت لاگ‌های فعالیت
  async getActivityLogs(): Promise<ActivityLog[]> {
    const response = await api.get('/activity-logs')
    return response.data.logs || response.data
  },
  // ================== دریافت پروژه‌های خود کارفرما ==================
  async getMyProjects(): Promise<Project[]> {
    const response = await api.get('/projects/my-projects')
    return response.data.projects || response.data
  },
}
