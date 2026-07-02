import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { projectService } from '@/services/project.service'
import type { Project, ActivityLog } from '@/types/project'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
  // ==========================
  // State
  // ==========================

  const projects = ref<Project[]>([])
  const myProjects = ref<Project[]>([])
  const activityLogs = ref<ActivityLog[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==========================
  // Form (create project)
  // ==========================

  const formData = reactive({
    title: '',
    category: '',
    description: '',
    province: '',
    city: '',
    address: '',

    areaSelectionMethod: 'map',
    polygonCoordinates: [] as Coordinate[],
    geoJson: null as any,
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

  // ==========================
  // Getters
  // ==========================

  const dashboardStats = computed(() => ({
    totalProjects: projects.value.length,
    activeProjects: projects.value.filter((p) => p.status === 'open' || p.status === 'in_progress')
      .length,
    completedProjects: projects.value.filter((p) => p.status === 'completed').length,
  }))

  const openProjects = computed(() => projects.value.filter((p) => p.status === 'open'))

  // ==========================
  // API Actions
  // ==========================

  const fetchProjects = async () => {
    isLoading.value = true
    error.value = null

    try {
      projects.value = await projectService.getAllProjects()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌ها'
    } finally {
      isLoading.value = false
    }
  }

  const fetchMyProjects = async () => {
    isLoading.value = true
    error.value = null

    try {
      myProjects.value = await projectService.getMyProjects()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌های من'
    } finally {
      isLoading.value = false
    }
  }

  const fetchActivityLogs = async () => {
    try {
      activityLogs.value = await projectService.getActivityLogs()
    } catch (err) {
      console.error(err)
    }
  }

  const submitProject = async () => {
    isLoading.value = true
    error.value = null

    try {
      const res = await projectService.createProject(formData, uploadedFiles.value)

      if (res?.project) {
        projects.value.unshift(res.project)
        myProjects.value.unshift(res.project) // 👈 مهم
      }

      resetForm()

      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ثبت پروژه'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProject = async (id: number, data: any, files: File[] = []) => {
    const res = await projectService.updateProject(id, data, files)

    const index = myProjects.value.findIndex((p) => p.id === id)
    if (index !== -1) myProjects.value[index] = res

    return res
  }

  const deleteProject = async (id: number) => {
    await projectService.deleteProject(id)

    myProjects.value = myProjects.value.filter((p) => p.id !== id)
  }

  // ==========================
  // Helpers
  // ==========================

  const addFiles = (files: File[]) => {
    uploadedFiles.value.push(...files)
  }

  const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }

  const resetForm = () => {
    formData.title = ''
    formData.category = ''
    formData.description = ''
    formData.province = ''
    formData.city = ''
    formData.address = ''
    formData.calculatedArea = 0
    formData.polygonCoordinates = []
    formData.geoJson = null
    formData.techType = []
    formData.outputFormats = []
    formData.minBudget = ''
    formData.maxBudget = ''

    uploadedFiles.value = []
    error.value = null
  }

  return {
    // state
    projects,
    myProjects,
    activityLogs,
    formData,
    uploadedFiles,
    isLoading,
    error,

    // getters
    dashboardStats,
    openProjects,

    // actions
    fetchProjects,
    fetchMyProjects,
    fetchActivityLogs,
    submitProject,
    updateProject,
    deleteProject,

    // helpers
    addFiles,
    removeFile,
    resetForm,
  }
})
