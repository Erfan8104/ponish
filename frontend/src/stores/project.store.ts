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
      const res = await projectService.createProject(formData, uploadedFiles.value)

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

  /**
   * 🌟 اکشن پذیرش پروپوزال و شروع قرارداد (هماهنگ با تغییر قیمت چت در بک‌اند)
   */
  const acceptProposal = async (proposalId: number, projectId: number, finalAmount?: number) => {
    isLoading.value = true
    error.value = null

    try {
      // صدا زدن سرویس با پارامتر قیمت اختیاری
      const res = await projectService.acceptProposal(proposalId, finalAmount)

      // آپدیت محلی وضعیت پروژه در استیت‌های مختلف کامپوننت بدون ریلود صفحه
      updateProjectStatusLocally(projectId, 'in_progress')

      return res
    } catch (err: any) {
      error.value = err.response?.data?.message || 'خطا در تایید پیشنهاد پروژه'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * آپدیت محلی وضعیت پروژه پس از قبول پیشنهاد
   */
  const updateProjectStatusLocally = (projectId: number, newStatus: string) => {
    // این خط خطا را برطرف می‌کند:
    const status = newStatus as ProjectStatus

    // ۱. آپدیت جزئیات مودال
    if (projectDetails.value && projectDetails.value.id === projectId) {
      projectDetails.value.status = status
    }

    // ۱. آپدیت لیست پروژه‌های ایجاد شده توسط کاربر
    const myProjIndex = myProjects.value.findIndex((p) => p.id === projectId)
    if (myProjIndex !== -1) {
      // استفاده از ! به جای ?.
      myProjects.value[myProjIndex]!.status = status
    }

    // ۲. آپدیت لیست اصلی
    const projIndex = projects.value.findIndex((p) => p.id === projectId)
    if (projIndex !== -1) {
      // استفاده از ! به جای ?.
      projects.value[projIndex]!.status = status
    }

    // ۳. آپدیت لیست پروژه‌های پذیرفته‌شده
    const acceptedIndex = acceptedProjects.value.findIndex((p) => p.id === projectId)
    if (acceptedIndex !== -1) {
      // استفاده از ! به جای ?.
      acceptedProjects.value[acceptedIndex]!.status = status
    }
  }

  const rejectProposal = async (contractId: number, projectId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await projectService.rejectProposal(contractId, projectId)

      // بازگرداندن وضعیت پروژه به open در کلاینت
      updateProjectStatusLocally(projectId, 'open')

      // پاک کردن قرارداد از جزئیات در صورت باز بودن مودال
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

  // در استور اضافه کنید
  const syncProjects = async () => {
    try {
      // دریافت مجدد لیست‌ها برای اطمینان از تطابق با دیتابیس
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
    // state
    projects,
    myProjects,
    activityLogs,
    acceptedProjects,
    projectDetails,
    isProjectDetailsModalOpen,
    isProjectDetailsLoading,
    formData,
    uploadedFiles,
    isLoading,
    error,

    // getters
    dashboardStats,
    openProjects,

    // actions
    fetchProjects,
    rejectProposal,
    syncProjects,
    fetchMyProjects,
    fetchActivityLogs,
    submitProject,
    updateProject,
    deleteProject,
    acceptProposal, // 👈 اضافه شدن اکشن اصلی به ریترن
    updateProjectStatusLocally,
    fetchAcceptedProjects,
    openProjectDetails,
    closeProjectDetails,

    // helpers
    addFiles,
    removeFile,
    resetForm,
    clearPolygon,
  }
})
