import { apiService } from './api'

export const getPurchases = (userId: string) => apiService.getPurchases(userId)

export const getPurchase = (id: string) => apiService.getPurchase(id)
