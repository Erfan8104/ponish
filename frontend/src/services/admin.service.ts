import { api } from './api'

// درخواست لاگین ادمین
export const adminLoginApi = async (phone: string, password: string) => {
  const response = await api.post('/admin/login', { phone, password })
  return response.data
}

// 🌟 تغییر وضعیت (فعال/غیرفعال) کاربر توسط ادمین
export const toggleUserStatusApi = async (userId: number) => {
  const response = await api.patch(`/admin/users/${userId}/toggle-status`)
  return response.data
}

export const getDashboardStatsApi = async () => {
  const response = await api.get('/admin/dashboard/stats')
  return response.data
}
export const getAllUsersApi = async (
  params: {
    search?: string
    role?: string
    status?: string
    verified?: string
    sortBy?: string
    page?: number
    limit?: number
  } = {},
) => {
  const response = await api.get('/admin/users', { params })
  return response.data
}

export const getUserDetailApi = async (id: number) => {
  const response = await api.get(`/admin/users/${id}`)
  return response.data
}

export const verifyUserApi = async (id: number) => {
  const response = await api.patch(`/admin/users/${id}/verify`)
  return response.data
}

export const deleteUserApi = async (id: number) => {
  const response = await api.delete(`/admin/users/${id}`)
  return response.data
}

export const resetUserPasswordApi = async (id: number) => {
  const response = await api.post(`/admin/users/${id}/reset-password`)
  return response.data
}

export const changeUserRoleApi = async (id: number, role: string) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role })
  return response.data
}

export const getAllProjectsApi = async (
  params: {
    search?: string
    status?: string
    sortBy?: string
    page?: number
    limit?: number
  } = {},
) => {
  const response = await api.get('/admin/projects', { params })
  return response.data
}

export const publishProjectApi = async (id: number) => {
  const response = await api.patch(`/admin/projects/${id}/publish`)
  return response.data
}

export const closeProjectApi = async (id: number) => {
  const response = await api.patch(`/admin/projects/${id}/close`)
  return response.data
}

export const toggleFeatureProjectApi = async (id: number) => {
  const response = await api.patch(`/admin/projects/${id}/feature`)
  return response.data
}

export const deleteProjectApi = async (id: number) => {
  const response = await api.delete(`/admin/projects/${id}`)
  return response.data
}

export const getProjectDetailApi = async (id: number) => {
  const response = await api.get(`/admin/projects/${id}`)
  return response.data
}

export const getAllProposalsApi = async () => {
  const response = await api.get('/admin/proposals')
  return response.data
}
export const acceptProposalApi = async (id: number) => {
  const response = await api.patch(`/admin/proposals/${id}/accept`)
  return response.data
}

export const rejectProposalApi = async (id: number) => {
  const response = await api.patch(`/admin/proposals/${id}/reject`)
  return response.data
}

export const deleteProposalApi = async (id: number) => {
  const response = await api.delete(`/admin/proposals/${id}`)
  return response.data
}

export const getAllContractsApi = async (params: Record<string, any> = {}) => {
  const response = await api.get('/admin/contracts', { params })
  return response.data
}

export const getContractDetailApi = async (id: number) => {
  const response = await api.get(`/admin/contracts/${id}`)
  return response.data
}

export const cancelContractApi = async (id: number) => {
  const response = await api.patch(`/admin/contracts/${id}/cancel`)
  return response.data
}

export const completeContractApi = async (id: number) => {
  const response = await api.patch(`/admin/contracts/${id}/complete`)
  return response.data
}

export const resolveContractDisputeApi = async (
  id: number,
  resolution: 'active' | 'completed' | 'cancelled',
) => {
  const response = await api.patch(`/admin/contracts/${id}/resolve-dispute`, { resolution })
  return response.data
}

export const getAllPaymentsApi = async (params: Record<string, any> = {}) => {
  const response = await api.get('/admin/payments', { params })
  return response.data
}

export const getAllCategoriesApi = async () => {
  const response = await api.get('/admin/categories')
  return response.data
}

export const createCategoryApi = async (payload: {
  name: string
  slug: string
  description?: string
  parentId?: number | null
}) => {
  const response = await api.post('/admin/categories', payload)
  return response.data
}

export const updateCategoryApi = async (
  id: number,
  payload: {
    name?: string
    slug?: string
    description?: string
    parentId?: number | null
  },
) => {
  const response = await api.patch(`/admin/categories/${id}`, payload)
  return response.data
}

export const deleteCategoryApi = async (id: number) => {
  const response = await api.delete(`/admin/categories/${id}`)
  return response.data
}

export const getAllSkillsApi = async (params: Record<string, any> = {}) => {
  const response = await api.get('/admin/skills', { params })
  return response.data
}

export const createSkillApi = async (payload: { name: string; slug: string }) => {
  const response = await api.post('/admin/skills', payload)
  return response.data
}

export const updateSkillApi = async (id: number, payload: { name?: string; slug?: string }) => {
  const response = await api.patch(`/admin/skills/${id}`, payload)
  return response.data
}

export const deleteSkillApi = async (id: number) => {
  const response = await api.delete(`/admin/skills/${id}`)
  return response.data
}

export const mergeSkillsApi = async (payload: {
  sourceSkillIds: number[]
  targetSkillId: number
}) => {
  const response = await api.post('/admin/skills/merge', payload)
  return response.data
}

export const getAllConversationsApi = async () => {
  const response = await api.get('/admin/messages')
  return response.data
}

export const getConversationThreadApi = async (params: {
  contractId?: number
  userAId?: number
  userBId?: number
}) => {
  const response = await api.get('/admin/messages/thread', { params })
  return response.data
}
export const getAllReviewsApi = async (
  params: {
    search?: string
    rating?: number
    page?: number
    limit?: number
  } = {},
) => {
  const response = await api.get('/admin/reviews', { params })
  return response.data
}

export const deleteReviewApi = async (id: number) => {
  const response = await api.delete(`/admin/reviews/${id}`)
  return response.data
}

export const getAllFilesApi = async (
  params: {
    search?: string
    type?: 'avatar' | 'attachment'
    page?: number
    limit?: number
  } = {},
) => {
  const response = await api.get('/admin/files', { params })
  return response.data
}

export const deleteFileApi = async (type: 'avatar' | 'attachment', id: number) => {
  const response = await api.delete(`/admin/files/${type}/${id}`)
  return response.data
}

export const getAllReportsApi = async (
  params: {
    search?: string
    status?: string
    targetType?: string
    page?: number
    limit?: number
  } = {},
) => {
  const response = await api.get('/admin/reports', { params })
  return response.data
}

export const getReportDetailApi = async (id: number) => {
  const response = await api.get(`/admin/reports/${id}`)
  return response.data
}

export const updateReportStatusApi = async (
  id: number,
  data: { status?: string; adminNote?: string },
) => {
  const response = await api.patch(`/admin/reports/${id}`, data)
  return response.data
}

export const deleteReportApi = async (id: number) => {
  const response = await api.delete(`/admin/reports/${id}`)
  return response.data
}
