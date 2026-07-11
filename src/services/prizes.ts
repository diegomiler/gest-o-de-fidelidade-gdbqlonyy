import pb from '@/lib/pocketbase/client'

export const getPrizes = () =>
  pb.collection('prizes').getFullList({
    filter: 'active = true',
    sort: 'required_amount',
  })

export const getAllPrizes = () => pb.collection('prizes').getFullList({ sort: '-created' })

export const getPrize = (id: string) => pb.collection('prizes').getOne(id)

export const createPrize = (data: FormData) => pb.collection('prizes').create(data)

export const updatePrize = (id: string, data: FormData) => pb.collection('prizes').update(id, data)

export const updatePrizeFields = (id: string, data: Record<string, unknown>) =>
  pb.collection('prizes').update(id, data)

export const deletePrize = (id: string) => pb.collection('prizes').delete(id)
