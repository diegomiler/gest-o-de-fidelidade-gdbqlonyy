import { apiService } from './api'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
  min_redemption_amount: number
  min_purchase_usage: number
}

export const getCashbackRules = async (): Promise<CashbackRules> => {
  return apiService.getCashbackRules()
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<CashbackRules> => {
  return apiService.updateCashbackRules(rules)
}
