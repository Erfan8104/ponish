import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import type { Project, ActivityLog, DashboardStats } from '@/types/project'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
  // ================== Form Data (Create/Edit) ==================
  const formData = reactive({
    // ----------------
    // STEP 1
    // ----------------

    title: '',
    category: '',
    description: '',

    province: '',
    city: '',
    address: '',

    // ----------------
    // STEP 2
    // ----------------

    areaSelectionMethod: 'map',

    polygonCoordinates: [] as Coordinate[],

    geoJson: null as GeoJSON.Feature | null,

    calculatedArea: 0,

    coordinateSystem: 'WGS84',

    utmZone: '',

    // ----------------
    // STEP 3
    // ----------------

    techType: [] as string[],

    outputFormats: [] as string[],

    requiredAccuracy: '1-5cm',

    // ----------------
    // STEP 4
    // ----------------

    deliveryTime: '1-week',

    budgetType: 'custom',

    minBudget: '',

    maxBudget: '',
  })

  const uploadedFiles = ref<File[]>([])

  // ================== Dashboard Data ==================
  const projects = ref<Project[]>([])
  const activityLogs = ref<ActivityLog[]>([])
  const dashboardStats = computed<DashboardStats>(() => ({
    totalProjects: projects.value.length,
    activeProjects: projects.value.filter((p) => p.status === 'active').length,
    completedProjects: projects.value.filter((p) => p.status === 'completed').length,
    totalArea: projects.value.reduce((sum, p) => sum + p.calculatedArea, 0),
  }))

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

  const setPolygon = (coordinates: Coordinate[], area: number, geoJson?: GeoJSON.Feature) => {
    formData.polygonCoordinates = coordinates
    formData.calculatedArea = area

    if (geoJson) {
      formData.geoJson = geoJson
    }
  }

  const clearPolygon = () => {
    formData.polygonCoordinates = []
    formData.calculatedArea = 0
    formData.geoJson = null
  }

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

    formData.budgetType = 'custom'
    formData.minBudget = ''
    formData.maxBudget = ''

    uploadedFiles.value = []
  }

  // ================== Dashboard Methods ==================
  const setProjects = (newProjects: Project[]) => {
    projects.value = newProjects
  }

  const addProject = (project: Project) => {
    projects.value.push(project)
  }

  const updateProject = (updatedProject: Project) => {
    const index = projects.value.findIndex((p) => p.id === updatedProject.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
    }
  }

  const deleteProject = (projectId: number) => {
    projects.value = projects.value.filter((p) => p.id !== projectId)
  }

  const setActivityLogs = (logs: ActivityLog[]) => {
    activityLogs.value = logs
  }

  const addActivityLog = (log: ActivityLog) => {
    activityLogs.value.unshift(log)
    // نگه‌داشتن تنها 50 آخرین لاگ برای بهبود عملکرد
    if (activityLogs.value.length > 50) {
      activityLogs.value.pop()
    }
  }

  const getRecentProjects = (limit: number = 5): Project[] => {
    return projects.value.slice(0, limit)
  }

  const getProjectsByStatus = (status: Project['status']): Project[] => {
    return projects.value.filter((p) => p.status === status)
  }

  // ================== Initialize Mock Data ==================
  const initializeMockData = () => {
    // داده‌های نمونه برای تست
    const mockProjects: Project[] = [
      {
        id: 1,
        title: 'پروژه نقشه‌برداری شهر مشهد',
        description: 'نقشه‌برداری دقیق شهر مشهد با استفاده از دوربین هوایی',
        category: 'uav',
        province: 'خراسان رضوی',
        city: 'مشهد',
        address: 'محدوده شهری شمالی',
        calculatedArea: 150,
        coordinateSystem: 'WGS84',
        utmZone: '40N',
        techType: ['aerial_survey', 'photogrammetry'],
        outputFormats: ['GEOTIFF', 'ORTHOPHOTO'],
        requiredAccuracy: '2-5cm',
        deliveryTime: '2-weeks',
        budget: 50000000,
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 2,
        title: 'تهیه نقشه GIS پایگاه‌های داده‌ای',
        description: 'تهیه و تنظیم نقشه GIS برای پایگاه‌های داده‌ای شهری',
        category: 'gis',
        province: 'تهران',
        city: 'تهران',
        address: 'منطقه 1 تا 22',
        calculatedArea: 700,
        coordinateSystem: 'UTM',
        utmZone: '40N',
        techType: ['data_processing', 'gis_analysis'],
        outputFormats: ['SHAPEFILE', 'GEOJSON'],
        requiredAccuracy: '5-10cm',
        deliveryTime: '3-weeks',
        budget: 30000000,
        status: 'active',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 3,
        title: 'تعیین مرزهای قطعات زمین',
        description: 'تعیین و تصدیق مرزهای قطعات زمین برای دفاتر ثبت',
        category: 'cadastral',
        province: 'اصفهان',
        city: 'اصفهان',
        address: 'بخش‌های مختلف شهر',
        calculatedArea: 250,
        coordinateSystem: 'WGS84',
        techType: ['boundary_survey'],
        outputFormats: ['DWG', 'PDF'],
        requiredAccuracy: '1-2cm',
        deliveryTime: '1-week',
        budget: 75000000,
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 4,
        title: 'بررسی استحکام ساختمان‌های تاریخی',
        description: 'بررسی و ثبت استحکام ساختمان‌های تاریخی شهر',
        category: 'uav',
        province: 'فارس',
        city: 'شیراز',
        address: 'بافت تاریخی',
        calculatedArea: 50,
        coordinateSystem: 'WGS84',
        techType: ['3d_model'],
        outputFormats: ['LAS', 'PLY'],
        requiredAccuracy: '1-2cm',
        deliveryTime: '1-week',
        budget: 40000000,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
    ]

    const mockActivities: ActivityLog[] = [
      {
        id: 1,
        projectId: 1,
        type: 'project_created',
        title: 'پروژه نقشه‌برداری شهر مشهد',
        description: 'پروژه جدید ایجاد شد',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 2,
        projectId: 2,
        type: 'project_created',
        title: 'تهیه نقشه GIS پایگاه‌های داده‌ای',
        description: 'پروژه جدید ایجاد شد',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 3,
        projectId: 3,
        type: 'status_changed',
        title: 'تعیین مرزهای قطعات زمین',
        description: 'وضعیت به تکمیل شده تغییر یافت',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 4,
        projectId: 1,
        type: 'file_uploaded',
        title: 'پروژه نقشه‌برداری شهر مشهد',
        description: '5 فایل بارگذاری شد',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
      {
        id: 5,
        projectId: 4,
        type: 'project_created',
        title: 'بررسی استحکام ساختمان‌های تاریخی',
        description: 'پروژه جدید ایجاد شد',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userId: 1,
      },
    ]

    projects.value = mockProjects
    activityLogs.value = mockActivities.reverse()
  }

  return {
    // Form Data
    formData,
    uploadedFiles,

    // File Management
    addFiles,
    removeFile,
    clearFiles,

    // Polygon Management
    setPolygon,
    clearPolygon,

    // Form Reset
    resetProject,

    // Dashboard Data
    projects,
    activityLogs,
    dashboardStats,

    // Dashboard Methods
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    setActivityLogs,
    addActivityLog,
    getRecentProjects,
    getProjectsByStatus,

    // Initialize
    initializeMockData,
  }
})
