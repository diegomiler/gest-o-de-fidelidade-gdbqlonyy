import pb from '@/lib/pocketbase/client'

export const getPurchases = (userId: string) =>
  pb.collection('purchases').getFullList({
    filter: `client = "${userId}"`,
    sort: '-purchase_date',
  })

export const getPurchase = (id: string) => pb.collection('purchases').getOne(id)
