import { apiService } from './api'

export const getPartnerStations = () => apiService.getPartnerStations()

export const getAllPartnerStations = () => apiService.getAllPartnerStations()

export const createPartnerStation = (data: {
  name: string
  address?: string
  city?: string
  state?: string
  phone?: string
  active?: boolean
}) => apiService.createPartnerStation(data)

export const updatePartnerStation = (
  id: string,
  data: Partial<{
    name: string
    address: string
    city: string
    state: string
    phone: string
    active: boolean
  }>,
) => apiService.updatePartnerStation(id, data)

export const deletePartnerStation = (id: string) => apiService.deletePartnerStation(id)
