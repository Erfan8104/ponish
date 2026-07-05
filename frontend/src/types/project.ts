// src/types/project.ts

/**
 * =========================
 * Enums (aligned with Prisma)
 * =========================
 */

export type ProjectStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type BudgetType = 'fixed' | 'hourly' | 'negotiable'

/**
 * =========================
 * Base Project (DB Shape)
 * =========================
 */

export interface Project {
  id: number

  employerId: number

  category?: {
    id: number
    name: string
    slug: string
  }

  title: string
  description?: string

  status: ProjectStatus

  province?: string
  city?: string
  address?: string

  calculatedArea?: number
  coordinateSystem?: string
  utmZone?: string

  requiredAccuracy?: string
  deliveryTime?: string

  budgetType: BudgetType
  minBudget?: number | string
  maxBudget?: number | string

  polygonCoordinates?: any
  geoJson?: any

  techType?: string[]
  outputFormats?: string[]

  areaSelectionMethod?: string

  viewCount?: number

  createdAt: string
  updatedAt: string
}

/**
 * =========================
 * Attachment
 * =========================
 */

export interface ProjectAttachment {
  id: number
  projectId: number
  fileName: string
  fileUrl: string
  fileType?: string
  fileSize?: number
  createdAt: string
}

/**
 * =========================
 * Contract (light version)
 * =========================
 */

export interface ProjectContract {
  id: number
  status: 'active' | 'completed' | 'cancelled' | 'disputed'
}

/**
 * =========================
 * Proposal (minimal)
 * =========================
 */

export interface Proposal {
  id: number
  amount: number
  deliveryDays: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

/**
 * =========================
 * Extended Project (API Detail Response)
 * =========================
 * این همون چیزی هست که برای مودال لازم داری
 */

export interface ProjectDetail extends Project {
  employer: {
    id: number
    name?: string
    avatar?: string
  }

  attachments: ProjectAttachment[]
  proposals: Proposal[]

  contract?: ProjectContract | null

  // computed fields from backend
  canEdit: boolean
  canDelete: boolean
  proposalCount: number
  attachmentCount: number
}

/**
 * =========================
 * Activity Log
 * =========================
 */

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

/**
 * =========================
 * Dashboard Stats
 * =========================
 */

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalArea: number
}
