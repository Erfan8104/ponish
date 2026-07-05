import { api } from './api'
import type { Project, ActivityLog, ProjectDetail } from '@/types/project'

/**
 * =========================
 * Types
 * =========================
 */
export interface ProposalPayload {
  projectId: number
  amount: number
  deliveryDays: number
  coverLetter: string
}

export interface ProjectFormPayload {
  title: string
  category?: string
  description?: string
  province?: string
  city?: string
  address?: string

  areaSelectionMethod?: string
  calculatedArea?: number
  coordinateSystem?: string
  utmZone?: string

  polygonCoordinates?: any[]
  geoJson?: any

  techType?: any[]
  outputFormats?: any[]
  requiredAccuracy?: string

  deliveryTime?: string
  budgetType?: 'fixed' | 'hourly' | 'negotiable'
  minBudget?: number
  maxBudget?: number
}

/**
 * =========================
 * Project Service
 * =========================
 */
export const projectService = {
  /**
   * 1. دریافت لیست پروژه‌های عمومی
   */
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get('/projects/list')
    return response.data.projects || []
  },

  /**
   * 2. دریافت جزئیات یک پروژه
   */
  async getProjectById(id: number): Promise<ProjectDetail> {
    const response = await api.get(`/projects/detail/${id}`)
    console.log(response.data)
    return response.data.project
  },

  /**
   * 3. ایجاد پروژه (با فایل)
   */
  async createProject(formDataRaw: ProjectFormPayload, uploadedFiles: File[]): Promise<Project> {
    const data = new FormData()

    data.append('title', formDataRaw.title || '')
    if (formDataRaw.description) data.append('description', formDataRaw.description)

    // اگر حوزه مشخص نبود، به بک‌میدان ارسال نشود تا دسته بندی اصلی خالی بماند یا پیش فرض ادمین شود
    if (formDataRaw.category && formDataRaw.category !== 'unknown') {
      data.append('category', formDataRaw.category)
    }

    if (formDataRaw.province) data.append('province', formDataRaw.province)
    if (formDataRaw.city) data.append('city', formDataRaw.city)
    if (formDataRaw.address) data.append('address', formDataRaw.address)
    if (formDataRaw.areaSelectionMethod)
      data.append('areaSelectionMethod', formDataRaw.areaSelectionMethod)

    if (formDataRaw.calculatedArea !== undefined)
      data.append('calculatedArea', String(formDataRaw.calculatedArea))
    if (formDataRaw.coordinateSystem) data.append('coordinateSystem', formDataRaw.coordinateSystem)
    if (formDataRaw.utmZone && formDataRaw.utmZone !== 'auto')
      data.append('utmZone', formDataRaw.utmZone)

    // ارسال ایمن مختصات نقشه
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

    // اصلاح فیلد نوع بودجه
    data.append('budgetType', formDataRaw.budgetType || 'fixed')

    // جلوگیری از ارسال رشته های خالی مالی
    if (formDataRaw.minBudget && String(formDataRaw.minBudget).trim() !== '') {
      data.append('minBudget', String(formDataRaw.minBudget))
    }
    if (formDataRaw.maxBudget && String(formDataRaw.maxBudget).trim() !== '') {
      data.append('maxBudget', String(formDataRaw.maxBudget))
    }

    if (uploadedFiles?.length) {
      uploadedFiles.forEach((file) => {
        data.append('attachments', file)
      })
    }

    const response = await api.post('/projects/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data.project
  },
  /**
   * 4. آپدیت پروژه (با فایل جدید)
   */
  async updateProject(
    id: number,
    formDataRaw: Partial<ProjectFormPayload>,
    uploadedFiles: File[] = [],
  ): Promise<Project> {
    const data = new FormData()

    Object.entries(formDataRaw).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && key !== 'polygonCoordinates' && key !== 'geoJson') {
          data.append(key, JSON.stringify(value))
        } else {
          data.append(key, String(value))
        }
      }
    })

    if (uploadedFiles.length) {
      uploadedFiles.forEach((file) => {
        data.append('attachments', file)
      })
    }

    const response = await api.put(`/projects/update/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data.project
  },

  /**
   * 5. حذف پروژه
   */
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/delete/${id}`)
  },

  /**
   * 6. ارسال پیشنهاد
   */
  async sendProposal(payload: ProposalPayload): Promise<any> {
    const response = await api.post('/projects/proposals/submit', payload)
    return response.data
  },

  /**
   * 7. پروژه‌های من (کارفرما)
   */
  async getMyProjects(): Promise<Project[]> {
    const response = await api.get('/projects/my-projects')
    return response.data.projects || []
  },

  /**
   * 8. فعالیت‌ها (اگر استفاده داری)
   */
  async getActivityLogs(): Promise<ActivityLog[]> {
    const response = await api.get('/activity-logs')
    return response.data.logs || []
  },

  /**
   * دریافت پیشنهادهای یک پروژه (مخصوص کارفرما)
   */
  async getProjectProposals(projectId: number) {
    const response = await api.get(`/projects/detail/${projectId}/proposals`)
    return response.data.proposals
  },
}
