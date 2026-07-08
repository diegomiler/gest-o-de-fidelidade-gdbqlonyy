import pb from '@/lib/pocketbase/client'

export const getCashbackByUser = (userId: string) =>
  pb.collection('cashback').getFullList({
    filter: `client = "${userId}"`,
    sort: '-created',
  })

export const getCashbackByPurchase = (purchaseId: string) =>
  pb.collection('cashback').getFullList({
    filter: `purchase = "${purchaseId}"`,
  })
