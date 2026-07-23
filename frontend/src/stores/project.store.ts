import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { projectService } from '@/services/project.service'
import type {
  Project,
  ActivityLog,
  ProjectDetail,
  ProjectStatus,
  AcceptedProject,
} from '@/types/project'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
  /**
   * =========================
   * State
   * =========================
   */
  const projects = ref<Project[]>([])
  const myProjects = ref<Project[]>([])
  const activityLogs = ref<ActivityLog[]>([])
  const acceptedProjects = ref<AcceptedProject[]>([]) // Modal State (Project Details)
  const projectDetails = ref<ProjectDetail | null>(null)
  const isProjectDetailsModalOpen = ref(false)
  const isProjectDetailsLoading = ref(false)
  const isQuickEntry = ref(false)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * =========================
   * Form (Create Project)
   * =========================
   */

  const formData = reactive({
    title: '',
    category: '',
    description: '',
    province: '',
    city: '',
    address: '',
    terrainTypes: [] as string[],

    mappingType: null as 'area' | 'corridor' | null,
    calculatedArea: 0,
    corridorLength: 0,

    // 🌟 روش اصلی اجرا (زمینی، هوایی/فتوگرامتری، کارتوگرافی و GIS)
    surveyMethod: '' as 'ground' | 'aerial' | 'gis' | '',

    // 🌟 مشخصات فنی مجزا و اختصاصی برای هر روش بر اساس تصاویر
    groundTechnicalSpecs: [] as string[], // مشخصات فنی نقشه‌برداری زمینی
    aerialTechnicalSpecs: [] as string[], // مشخصات فنی نقشه فتوگرامتری
    aerialScaleOption: '', // مقادیر 0.5، 1، 1.5، 2 مربوط به فتوگرامتری
    gisTechnicalSpecs: [] as string[], // مشخصات فنی کارتوگرافی و GIS

    // 🌟 فیلدهای توضیحات متنی مجزا برای هر بخش
    groundDescription: '',
    aerialDescription: '',
    gisDescription: '',

    requiredEquipment: [] as string[], // تجهیزات مورد نیاز پیشنهادی

    areaSelectionMethod: 'map',
    polygonCoordinates: [] as Coordinate[],
    geoJson: null as any,
    utmZone: '',
    techType: [] as string[],
    outputFormats: [] as string[],
    requiredAccuracy: '',
    mapScale: '',
    deliveryTime: '',
    budgetType: '',
    minBudget: '',
    maxBudget: '',
  })

  const uploadedFiles = ref<File[]>([])

  /**
   * =========================
   * Getters
   * =========================
   */
  const dashboardStats = computed(() => ({
    totalProjects: projects.value.length,
    activeProjects: projects.value.filter((p) => p.status === 'open' || p.status === 'in_progress')
      .length,
    completedProjects: projects.value.filter((p) => p.status === 'completed').length,
  }))

  /**
   * بررسی معتبر بودن زمان تحویل (مدیریت حالت روزهای دلخواه و گزینه‌های ثابت)
   */
  const isDeliveryTimeValid = computed(() => {
    const time = formData.deliveryTime
    if (!time) return false

    const staticOptions = ['urgent', '3-days', '1-week', '2-weeks']
    if (staticOptions.includes(time)) return true

    const match = time.match(/\d+/)
    return match ? Number(match[0]) > 0 : false
  })

  const openProjects = computed(() => projects.value.filter((p) => p.status === 'open'))

  /**
   * =========================
   * Modal Actions (Project Details)
   * =========================
   */
  const openProjectDetails = async (id: number) => {
    isProjectDetailsModalOpen.value = true
    isProjectDetailsLoading.value = true
    error.value = null

    try {
      const res = await projectService.getProjectById(id)
      projectDetails.value = res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت جزئیات پروژه'
      projectDetails.value = null
    } finally {
      isProjectDetailsLoading.value = false
    }
  }

  const closeProjectDetails = () => {
    isProjectDetailsModalOpen.value = false
    projectDetails.value = null
  }

  /**
   * =========================
   * API Actions
   * =========================
   */
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
      const payload = {
        ...formData,
        isQuick: isQuickEntry.value,
      }

      const res = await projectService.createProject(payload, uploadedFiles.value)

      if (res) {
        projects.value.unshift(res)
        myProjects.value.unshift(res)
      }

      resetForm()
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ثبت پروژه'
      throw err
    } finally {
      isLoading.value = false
      isQuickEntry.value = false
    }
  }

  const updateProject = async (id: number, data: any, files: File[] = []) => {
    isLoading.value = true
    error.value = null

    try {
      const payload = { ...data }
      const res = await projectService.updateProject(id, payload, files)

      const index = myProjects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        myProjects.value[index] = res
      }

      if (projectDetails.value?.id === id) {
        projectDetails.value = {
          ...projectDetails.value,
          ...res,
        } as ProjectDetail
      }

      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در ویرایش پروژه'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProject = async (id: number) => {
    await projectService.deleteProject(id)

    myProjects.value = myProjects.value.filter((p) => p.id !== id)

    if (projectDetails.value?.id === id) {
      closeProjectDetails()
    }
  }

  const fetchAcceptedProjects = async (status: 'all' | 'active' | 'completed' = 'all') => {
    isLoading.value = true
    error.value = null

    try {
      acceptedProjects.value = await projectService.getAcceptedProjects(status)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در دریافت پروژه‌ها'
    } finally {
      isLoading.value = false
    }
  }

  const acceptProposal = async (proposalId: number, projectId: number, finalAmount?: number) => {
    isLoading.value = true
    error.value = null

    try {
      const res = await projectService.acceptProposal(proposalId, finalAmount)
      updateProjectStatusLocally(projectId, 'in_progress')
      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در تایید پیشنهاد پروژه'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProjectStatusLocally = (projectId: number, newStatus: string) => {
    const status = newStatus as ProjectStatus

    if (projectDetails.value && projectDetails.value.id === projectId) {
      projectDetails.value.status = status
    }

    const myProjIndex = myProjects.value.findIndex((p) => p.id === projectId)
    if (myProjIndex !== -1) {
      myProjects.value[myProjIndex]!.status = status
    }

    const projIndex = projects.value.findIndex((p) => p.id === projectId)
    if (projIndex !== -1) {
      projects.value[projIndex]!.status = status
    }

    const acceptedIndex = acceptedProjects.value.findIndex((p) => p.id === projectId)
    if (acceptedIndex !== -1) {
      acceptedProjects.value[acceptedIndex]!.status = status
    }
  }

  const rejectProposal = async (contractId: number, projectId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await projectService.rejectProposal(contractId, projectId)
      updateProjectStatusLocally(projectId, 'open')

      if (projectDetails.value?.id === projectId) {
        projectDetails.value.contract = null
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در لغو توافق'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setMappingType = (type: 'area' | 'corridor') => {
    formData.mappingType = type
    if (type === 'area') {
      formData.corridorLength = 0
    } else {
      formData.calculatedArea = 0
    }
  }

  const syncProjects = async () => {
    try {
      await fetchMyProjects()
      await fetchAcceptedProjects()
    } catch (err) {
      console.error('خطا در همگام‌سازی پروژه‌ها:', err)
    }
  }

  /**
   * =========================
   * Helpers
   * =========================
   */
  const addFiles = (files: File[]) => {
    uploadedFiles.value.push(...files)
  }

  const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }

  const setMapScale = (scale: string) => {
    formData.mapScale = scale

    switch (scale) {
      case '1/100':
        formData.requiredAccuracy = '۲ سانتی‌متر'
        break
      case '1/200':
        formData.requiredAccuracy = '۵ سانتی‌متر'
        break
      case '1/500':
        formData.requiredAccuracy = '۱۰ سانتی‌متر'
        break
      case '1/1000':
        formData.requiredAccuracy = '۲۰ سانتی‌متر'
        break
      case '1/2000':
        formData.requiredAccuracy = '۴۰ سانتی‌متر'
        break
      case '1/5000':
        formData.requiredAccuracy = '۱ متر'
        break
      default:
        formData.requiredAccuracy = ''
    }
  }

  const resetForm = () => {
    formData.title = ''
    formData.category = ''
    formData.description = ''
    formData.province = ''
    formData.city = ''
    formData.address = ''
    formData.terrainTypes = []

    formData.mappingType = null
    formData.calculatedArea = 0
    formData.corridorLength = 0
    formData.requiredAccuracy = ''
    formData.mapScale = ''

    formData.surveyMethod = ''
    formData.groundTechnicalSpecs = []
    formData.aerialTechnicalSpecs = []
    formData.aerialScaleOption = ''
    formData.gisTechnicalSpecs = []
    formData.groundDescription = ''
    formData.aerialDescription = ''
    formData.gisDescription = ''
    formData.requiredEquipment = []

    formData.polygonCoordinates = []
    formData.geoJson = null
    formData.techType = []
    formData.outputFormats = []
    formData.minBudget = ''
    formData.maxBudget = ''

    uploadedFiles.value = []
    error.value = null
  }

  const clearPolygon = () => {
    formData.polygonCoordinates = []
    formData.geoJson = null
    formData.calculatedArea = 0
  }

  /**
   * =========================
   * Return
   * =========================
   */
  return {
    projects,
    myProjects,
    activityLogs,
    acceptedProjects,
    projectDetails,
    isProjectDetailsModalOpen,
    isProjectDetailsLoading,
    isDeliveryTimeValid,
    isQuickEntry,

    formData,
    uploadedFiles,
    isLoading,
    error,

    dashboardStats,
    openProjects,

    setMappingType,
    fetchProjects,
    rejectProposal,
    syncProjects,
    fetchMyProjects,
    fetchActivityLogs,
    submitProject,
    updateProject,
    deleteProject,
    acceptProposal,
    updateProjectStatusLocally,
    fetchAcceptedProjects,
    openProjectDetails,
    closeProjectDetails,

    addFiles,
    removeFile,
    resetForm,
    clearPolygon,
    setMapScale,
  }
})
