import pb from '@/lib/pocketbase/client'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
}

export const getCashbackRules = async (): Promise<CashbackRules> => {
  try {
    const record = await pb.collection('settings').getFirstListItem('key = "cashback_rules"')
    const value = record.get('value')
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return {
      min_purchase_amount: parsed.min_purchase_amount ?? 0,
      store_percent: parsed.store_percent ?? 0,
      fuel_percent: parsed.fuel_percent ?? 0,
    }
  } catch {
    return { min_purchase_amount: 0, store_percent: 0, fuel_percent: 0 }
  }
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<void> => {
  const record = await pb.collection('settings').getFirstListItem('key = "cashback_rules"')
  await pb.collection('settings').update(record.id, {
    value: JSON.stringify(rules),
  })
}
