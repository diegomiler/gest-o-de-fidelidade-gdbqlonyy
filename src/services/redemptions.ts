import pb from '@/lib/pocketbase/client'

export const getRedemptions = (userId: string) =>
  pb.collection('redemptions').getFullList({
    filter: `client = "${userId}"`,
    sort: '-created',
  })

export const createRedemption = (data: {
  client: string
  prize: string
  quantity: number
  total_cost: number
}) => pb.collection('redemptions').create(data)
