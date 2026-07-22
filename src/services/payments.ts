import pb from '@/lib/pocketbase/client'

export interface Payment {
  id: string
  purchase: string
  method: string
  amount: number
  created: string
  updated: string
}

export const getPaymentsByPurchase = (purchaseId: string): Promise<Payment[]> =>
  pb.collection('payments').getFullList({
    filter: `purchase = "${purchaseId}"`,
    sort: 'created',
  })

export const getPaymentsBatch = async (
  purchaseIds: string[],
): Promise<Record<string, Payment[]>> => {
  if (purchaseIds.length === 0) return {}
  const filter = purchaseIds.map((id) => `purchase = "${id}"`).join(' || ')
  const items = await pb.collection('payments').getFullList({ filter, sort: 'created' })
  return items.reduce(
    (acc, item) => {
      const pid = item.purchase
      if (!acc[pid]) acc[pid] = []
      acc[pid].push(item as Payment)
      return acc
    },
    {} as Record<string, Payment[]>,
  )
}
