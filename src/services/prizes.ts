import pb from '@/lib/pocketbase/client'

export const getPrizes = () =>
  pb.collection('prizes').getFullList({
    filter: 'active = true',
    sort: 'required_amount',
  })

export const getAllPrizes = () => pb.collection('prizes').getFullList({ sort: '-created' })

export const getPrize = (id: string) => pb.collection('prizes').getOne(id)
