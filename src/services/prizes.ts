import { apiService } from './api'

export const getPrizes = () => apiService.getPrizes()

export const getAllPrizes = () => apiService.getAllPrizes()

export const getPrize = (id: string) => apiService.getPrize(id)

export const createPrize = (data: FormData | Record<string, unknown>) =>
  apiService.createPrize(data)

export const updatePrize = (id: string, data: FormData | Record<string, unknown>) =>
  apiService.updatePrize(id, data)

export const updatePrizeFields = (id: string, data: Record<string, unknown>) =>
  apiService.updatePrize(id, data)

export const deletePrize = (id: string) => apiService.deletePrize(id)
