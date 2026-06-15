// src/types/project.ts

export interface Project {
  id: number
  title: string
  description?: string
  category: string
  province: string
  city: string
  address?: string
  calculatedArea: number
  coordinateSystem: string
  utmZone?: string
  techType: string[]
  outputFormats: string[]
  requiredAccuracy: string
  deliveryTime: string
  budget?: number
  minBudget?: number
  maxBudget?: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  userId: number
}

export interface ActivityLog {
  id: number
  projectId?: number
  type:
    | 'project_created'
    | 'project_updated'
    | 'project_deleted'
    | 'file_uploaded'
    | 'status_changed'
  title: string
  description?: string
  timestamp: string
  userId: number
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalArea: number
}
