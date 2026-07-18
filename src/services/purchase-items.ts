import pb from '@/lib/pocketbase/client'

export interface PurchaseItem {
  id: string
  purchase: string
  product_code: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
  created: string
  updated: string
}

export const getPurchaseItems = (purchaseId: string): Promise<PurchaseItem[]> =>
  pb.collection('purchase_items').getFullList({
    filter: `purchase = "${purchaseId}"`,
    sort: 'created',
  })

export const getPurchaseItemsBatch = async (
  purchaseIds: string[],
): Promise<Record<string, PurchaseItem[]>> => {
  if (purchaseIds.length === 0) return {}
  const filter = purchaseIds.map((id) => `purchase = "${id}"`).join(' || ')
  const items = await pb.collection('purchase_items').getFullList({ filter, sort: 'created' })
  return items.reduce(
    (acc, item) => {
      const pid = item.purchase
      if (!acc[pid]) acc[pid] = []
      acc[pid].push(item as PurchaseItem)
      return acc
    },
    {} as Record<string, PurchaseItem[]>,
  )
}
