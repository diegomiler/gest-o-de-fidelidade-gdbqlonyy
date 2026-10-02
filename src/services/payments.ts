import { apiService } from './api'

export interface Payment {
  id: string
  purchase: string
  method: string
  amount: number
  created: string
  updated: string
}

export const getPaymentsByPurchase = (purchaseId: string): Promise<Payment[]> =>
  apiService.getPaymentsByPurchase(purchaseId)

export const getPaymentsBatch = async (
  purchaseIds: string[],
): Promise<Record<string, Payment[]>> => {
  return apiService.getPaymentsBatch(purchaseIds)
}
