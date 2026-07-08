import pb from '@/lib/pocketbase/client'

export const getBanners = () =>
  pb.collection('banners').getFullList({
    filter: 'active = true',
    sort: 'sort_order',
  })

export const getAllBanners = () => pb.collection('banners').getFullList({ sort: 'sort_order' })
