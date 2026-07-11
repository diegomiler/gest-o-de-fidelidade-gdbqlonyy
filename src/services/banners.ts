import pb from '@/lib/pocketbase/client'

export const getBanners = () =>
  pb.collection('banners').getFullList({
    filter: 'active = true',
    sort: 'sort_order',
  })

export const getAllBanners = () => pb.collection('banners').getFullList({ sort: 'sort_order' })

export const createBanner = (data: FormData) => pb.collection('banners').create(data)

export const updateBanner = (id: string, data: FormData) =>
  pb.collection('banners').update(id, data)

export const updateBannerFields = (id: string, data: Record<string, unknown>) =>
  pb.collection('banners').update(id, data)

export const deleteBanner = (id: string) => pb.collection('banners').delete(id)
