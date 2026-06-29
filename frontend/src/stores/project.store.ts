import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { projectService } from '@/services/project.service'
import type { Project, ActivityLog, DashboardStats } from '@/types/project'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
  // ================== Form Data ==================
  const formData = reactive({
    title: '',
    category: '',
    description: '',
    province: '',
    city: '',
    address: '',

    areaSelectionMethod: 'map',
    polygonCoordinates: [] as Coordinate[],
    geoJson: null as GeoJSON.Feature | null,
    calculatedArea: 0,
    coordinateSystem: 'WGS84',
    utmZone: '',

    techType: [] as string[],
    outputFormats: [] as string[],
    requiredAccuracy: '1-5cm',

    deliveryTime: '1-week',
    budgetType: 'fixed',
    minBudget: '',
    maxBudget: '',
  })

  const uploadedFiles = ref<File[]>([])
  const isLoading = ref(false)
  const errorMessages = ref<string[]>([])

  // ================== Real Database State ==================
  const projects = ref<Project[]>([])
  const activityLogs = ref<ActivityLog[]>([])

  const dashboardStats = computed<DashboardStats>(() => ({
    totalProjects: projects.value.length,
    activeProjects: projects.value.filter((p) => p.status === 'open' || p.status === 'in_progress')
      .length,
    completedProjects: projects.value.filter((p) => p.status === 'completed').length,
    totalArea: projects.value.reduce((sum, p) => sum + (p.calculatedArea || 0), 0),
  }))

  // ================== Actions ==================

  const fetchProjects = async () => {
    isLoading.value = true
    errorMessages.value = []
    try {
      projects.value = await projectService.getAllProjects()
    } catch (err: any) {
      console.error('خطا در دریافت پروژه‌ها:', err)
      if (err.response && err.response.data && err.response.data.message) {
        errorMessages.value = [err.response.data.message]
      } else {
        errorMessages.value = ['خطا در دریافت اطلاعات پروژه‌ها از سرور.']
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchActivityLogs = async () => {
    try {
      activityLogs.value = await projectService.getActivityLogs()
    } catch (err) {
      console.error('خطا در دریافت لاگ‌های فعالیت:', err)
    }
  }

  const submitProject = async () => {
    isLoading.value = true
    errorMessages.value = []

    try {
      const responseData = await projectService.createProject(formData, uploadedFiles.value)

      if (responseData && responseData.project) {
        projects.value.unshift(responseData.project)
      }

      resetProject()
      return responseData
    } catch (err: any) {
      if (err.response && err.response.data) {
        const backendError = err.response.data
        if (backendError.errors && Array.isArray(backendError.errors)) {
          errorMessages.value = backendError.errors.map((e: any) => e.message || e)
        } else if (backendError.message) {
          errorMessages.value = [backendError.message]
        } else {
          errorMessages.value = ['خطایی در اعتبارسنجی داده‌ها رخ داد.']
        }
      } else {
        errorMessages.value = ['خطای ارتباط با سرور! وضعیت اتصال اینترنت خود را بررسی کنید.']
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ================== File Management ==================
  const addFiles = (files: File[]) => {
    uploadedFiles.value.push(...files)
  }

  const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }

  const clearFiles = () => {
    uploadedFiles.value = []
  }

  // ================== Polygon Management ==================
  const setPolygon = (coordinates: Coordinate[], area: number, geoJson?: GeoJSON.Feature) => {
    formData.polygonCoordinates = coordinates
    formData.calculatedArea = area
    if (geoJson) formData.geoJson = geoJson
  }

  const clearPolygon = () => {
    formData.polygonCoordinates = []
    formData.calculatedArea = 0
    formData.geoJson = null
  }

  // ================== Form Reset ==================
  const resetProject = () => {
    formData.title = ''
    formData.category = ''
    formData.description = ''
    formData.province = ''
    formData.city = ''
    formData.address = ''
    formData.areaSelectionMethod = 'map'
    formData.polygonCoordinates = []
    formData.geoJson = null
    formData.calculatedArea = 0
    formData.coordinateSystem = 'WGS84'
    formData.utmZone = ''
    formData.techType = []
    formData.outputFormats = []
    formData.requiredAccuracy = '1-5cm'
    formData.deliveryTime = '1-week'
    formData.budgetType = 'fixed'
    formData.minBudget = ''
    formData.maxBudget = ''

    uploadedFiles.value = []
    errorMessages.value = []
  }

  const getRecentProjects = (limit: number = 5): Project[] => {
    return projects.value.slice(0, limit)
  }

  const getProjectsByStatus = (status: Project['status']): Project[] => {
    return projects.value.filter((p) => p.status === status)
  }

  return {
    formData,
    uploadedFiles,
    isLoading,
    errorMessages,
    projects,
    activityLogs,
    dashboardStats,

    fetchProjects,
    fetchActivityLogs,
    submitProject,
    addFiles,
    removeFile,
    clearFiles,
    setPolygon,
    clearPolygon,
    resetProject,
    getRecentProjects,
    getProjectsByStatus,
  }
})
