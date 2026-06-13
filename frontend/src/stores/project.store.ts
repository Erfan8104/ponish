import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export type Coordinate = [number, number]

export const useProjectStore = defineStore('project', () => {
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

  return {
    formData,
    uploadedFiles,

    addFiles,
    removeFile,
    clearFiles,

    setPolygon,
    clearPolygon,

    resetProject,
  }
})
