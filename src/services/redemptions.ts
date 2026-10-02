import { apiService } from './api'

export const getRedemptions = (userId: string) => apiService.getRedemptions(userId)

export const createRedemption = (data: {
  client: string
  prize: string
  quantity: number
  total_cost: number
}) => apiService.createRedemption(data)
