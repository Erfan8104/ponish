import { api } from './api'

export interface ConsultationPayload {
  name: string
  phone: string
  email?: string
  projectType: 'ground' | 'aerial' | 'gis' | 'unknown'
  description: string
  contactTime?: 'morning' | 'noon' | 'evening' | ''
}

export interface ConsultationResponse {
  success: boolean
  message: string
  data: {
    id: number
  }
}

/**
 * =========================
 * Consultation Service (Public)
 * =========================
 */
export const consultationService = {
  async createConsultation(payload: ConsultationPayload): Promise<ConsultationResponse> {
    const response = await api.post('/consultations', payload)
    return response.data
  },
}
