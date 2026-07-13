import pb from '@/lib/pocketbase/client'

export const getPurchases = (userId: string) =>
  pb.collection('purchases').getFullList({
    filter: `client = "${userId}"`,
    sort: '-purchase_date',
    expand: 'client',
  })

export const getPurchase = (id: string) =>
  pb.collection('purchases').getOne(id, { expand: 'client' })
