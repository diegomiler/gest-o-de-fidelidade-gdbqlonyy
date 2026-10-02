import { apiService } from './api'

export interface PurchaseItem {
  id: string
  purchase: string
  product_code: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
  created: string
  updated: string
}

export const getPurchaseItems = (purchaseId: string): Promise<PurchaseItem[]> =>
  apiService.getPurchaseItems(purchaseId)

export const getPurchaseItemsBatch = async (
  purchaseIds: string[],
): Promise<Record<string, PurchaseItem[]>> => {
  return apiService.getPurchaseItemsBatch(purchaseIds)
}
