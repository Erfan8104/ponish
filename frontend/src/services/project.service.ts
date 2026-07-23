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
  // اطلاعات پایه
  title: string
  category?: string
  description?: string

  // اطلاعات موقعیت
  province?: string
  city?: string
  address?: string

  // اطلاعات نقشه‌برداری و کریدور
  mappingType?: 'area' | 'corridor' | null
  corridorLength?: number
  areaSelectionMethod?: string
  calculatedArea?: number
  coordinateSystem?: string
  utmZone?: string
  terrainTypes?: string[]

  // روش‌ها، تجهیزات و مشخصات فنی جدید
  surveyMethod?: 'ground' | 'aerial' | 'gis' | ''
  specificSurveys?: string[]
  requiredEquipment?: string[]

  // 🌟 مشخصات فنی مجزا و توضیحات هر روش
  groundTechnicalSpecs?: string[]
  aerialTechnicalSpecs?: string[]
  aerialScaleOption?: string
  gisTechnicalSpecs?: string[]
  groundDescription?: string
  aerialDescription?: string
  gisDescription?: string

  // داده‌های جغرافیایی
  polygonCoordinates?: any[]
  geoJson?: any

  // جزئیات فنی و خروجی
  techType?: any[]
  outputFormats?: any[]
  requiredAccuracy?: string
  mapScale: string

  // زمان‌بندی و مالی
  deliveryTime?: string
  budgetType?: 'fixed' | 'hourly' | 'negotiable' | string
  minBudget?: number | string
  maxBudget?: number | string
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
    return response.data.project
  },

  /**
   * 3. ایجاد پروژه (با فایل)
   */
  async createProject(formDataRaw: ProjectFormPayload, uploadedFiles: File[]): Promise<Project> {
    const data = new FormData()

    if (formDataRaw.surveyMethod) {
      data.append('surveyMethod', formDataRaw.surveyMethod)
    }
    if (formDataRaw.specificSurveys && formDataRaw.specificSurveys.length > 0) {
      data.append('specificSurveys', JSON.stringify(formDataRaw.specificSurveys))
    }
    if (formDataRaw.requiredEquipment && formDataRaw.requiredEquipment.length > 0) {
      data.append('requiredEquipment', JSON.stringify(formDataRaw.requiredEquipment))
    }

    // 🌟 ارسال مشخصات فنی و توضیحات اختصاصی هر بخش به فرم‌دیتا
    if (formDataRaw.groundTechnicalSpecs && formDataRaw.groundTechnicalSpecs.length > 0) {
      data.append('groundTechnicalSpecs', JSON.stringify(formDataRaw.groundTechnicalSpecs))
    }
    if (formDataRaw.aerialTechnicalSpecs && formDataRaw.aerialTechnicalSpecs.length > 0) {
      data.append('aerialTechnicalSpecs', JSON.stringify(formDataRaw.aerialTechnicalSpecs))
    }
    if (formDataRaw.aerialScaleOption) {
      data.append('aerialScaleOption', formDataRaw.aerialScaleOption)
    }
    if (formDataRaw.gisTechnicalSpecs && formDataRaw.gisTechnicalSpecs.length > 0) {
      data.append('gisTechnicalSpecs', JSON.stringify(formDataRaw.gisTechnicalSpecs))
    }
    if (formDataRaw.groundDescription) {
      data.append('groundDescription', formDataRaw.groundDescription)
    }
    if (formDataRaw.aerialDescription) {
      data.append('aerialDescription', formDataRaw.aerialDescription)
    }
    if (formDataRaw.gisDescription) {
      data.append('gisDescription', formDataRaw.gisDescription)
    }

    data.append('title', formDataRaw.title || '')
    if (formDataRaw.description) data.append('description', formDataRaw.description)

    if (formDataRaw.category && formDataRaw.category !== 'unknown') {
      data.append('category', formDataRaw.category)
    }

    if (formDataRaw.province) data.append('province', formDataRaw.province)
    if (formDataRaw.city) data.append('city', formDataRaw.city)
    if (formDataRaw.address) data.append('address', formDataRaw.address)
    if (formDataRaw.areaSelectionMethod)
      data.append('areaSelectionMethod', formDataRaw.areaSelectionMethod)

    if (formDataRaw.mappingType) {
      data.append('mappingType', formDataRaw.mappingType)
    }
    if (formDataRaw.calculatedArea !== undefined && formDataRaw.calculatedArea !== null) {
      data.append('calculatedArea', String(formDataRaw.calculatedArea))
    }
    if (formDataRaw.corridorLength !== undefined && formDataRaw.corridorLength !== null) {
      data.append('corridorLength', String(formDataRaw.corridorLength))
    }

    if (formDataRaw.utmZone && formDataRaw.utmZone !== 'auto')
      data.append('utmZone', formDataRaw.utmZone)

    if (formDataRaw.terrainTypes && formDataRaw.terrainTypes.length > 0) {
      data.append('terrainTypes', JSON.stringify(formDataRaw.terrainTypes))
    }

    if (formDataRaw.polygonCoordinates && formDataRaw.polygonCoordinates.length > 0) {
      data.append('polygonCoordinates', JSON.stringify(formDataRaw.polygonCoordinates))
    }
    if (formDataRaw.geoJson) {
      data.append('geoJson', JSON.stringify(formDataRaw.geoJson))
    }

    data.append('techType', JSON.stringify(formDataRaw.techType || []))
    data.append('outputFormats', JSON.stringify(formDataRaw.outputFormats || []))
    if (formDataRaw.requiredAccuracy) data.append('requiredAccuracy', formDataRaw.requiredAccuracy)
    if (formDataRaw.mapScale) {
      data.append('mapScale', formDataRaw.mapScale)
    }
    if (formDataRaw.deliveryTime) data.append('deliveryTime', formDataRaw.deliveryTime)

    data.append('budgetType', formDataRaw.budgetType || 'fixed')

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
   * 8. فعالیت‌ها
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

  /**
   * قبول یک پیشنهاد توسط کارفرما و ایجاد قرارداد
   */
  async acceptProposal(proposalId: number, finalAmount?: number): Promise<any> {
    const payload = finalAmount ? { finalAmount } : {}
    const response = await api.patch(`/projects/proposals/${proposalId}/accept`, payload)
    return response.data
  },

  async getAcceptedProjects(status: 'all' | 'active' | 'completed' = 'all') {
    const response = await api.get('/projects/accepted-projects', {
      params: {
        status,
      },
    })
    return response.data.projects || []
  },

  rejectProposal: async (contractId: number, projectId: number) => {
    const response = await api.patch(`/projects/proposals/${contractId}/reject`, {
      projectId,
    })
    return response.data
  },
}
