import { apiService } from './api'

export const getBanners = () => apiService.getBanners()

export const getAllBanners = () => apiService.getAllBanners()

export const createBanner = (data: FormData | Record<string, unknown>) =>
  apiService.createBanner(data)

export const updateBanner = (id: string, data: FormData | Record<string, unknown>) =>
  apiService.updateBanner(id, data)

export const updateBannerFields = (id: string, data: Record<string, unknown>) =>
  apiService.updateBanner(id, data)

export const deleteBanner = (id: string) => apiService.deleteBanner(id)
