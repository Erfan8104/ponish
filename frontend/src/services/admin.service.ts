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
