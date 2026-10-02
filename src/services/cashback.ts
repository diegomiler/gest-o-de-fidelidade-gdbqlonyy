import { apiService } from './api'

export const getCashbackByUser = (userId: string) => apiService.getCashbackByUser(userId)

export const getReleasedCashbackByUser = (userId: string) =>
  apiService.getReleasedCashbackByUser(userId)

export const getCashbackByPurchase = (purchaseId: string) =>
  apiService.getCashbackByPurchase(purchaseId)
