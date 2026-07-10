import pb from '@/lib/pocketbase/client'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
  min_redemption_amount: number
}

export interface MinPurchaseUsage {
  amount: number
}

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 0,
  store_percent: 10,
  fuel_percent: 2,
  min_redemption_amount: 10,
}

const DEFAULT_MIN_PURCHASE_USAGE: MinPurchaseUsage = { amount: 0 }

export const getCashbackRules = async (): Promise<CashbackRules> => {
  try {
    const record = await pb.collection('settings').getFirstListItem('key = "cashback_rules"')
    const value = record.get('value')
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return {
      min_purchase_amount: parsed.min_purchase_amount ?? DEFAULT_RULES.min_purchase_amount,
      store_percent: parsed.store_percent ?? DEFAULT_RULES.store_percent,
      fuel_percent: parsed.fuel_percent ?? DEFAULT_RULES.fuel_percent,
      min_redemption_amount: parsed.min_redemption_amount ?? DEFAULT_RULES.min_redemption_amount,
    }
  } catch {
    return DEFAULT_RULES
  }
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<void> => {
  const data = { key: 'cashback_rules', value: JSON.stringify(rules) }
  try {
    const record = await pb.collection('settings').getFirstListItem('key = "cashback_rules"')
    await pb.collection('settings').update(record.id, { value: data.value })
  } catch {
    await pb.collection('settings').create(data)
  }
}

export const getMinPurchaseUsage = async (): Promise<MinPurchaseUsage> => {
  try {
    const record = await pb
      .collection('settings')
      .getFirstListItem('key = "cashback_min_purchase_usage"')
    const value = record.get('value')
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return { amount: parsed.amount ?? DEFAULT_MIN_PURCHASE_USAGE.amount }
  } catch {
    return DEFAULT_MIN_PURCHASE_USAGE
  }
}

export const updateMinPurchaseUsage = async (amount: number): Promise<void> => {
  const data = { key: 'cashback_min_purchase_usage', value: JSON.stringify({ amount }) }
  try {
    const record = await pb
      .collection('settings')
      .getFirstListItem('key = "cashback_min_purchase_usage"')
    await pb.collection('settings').update(record.id, { value: data.value })
  } catch {
    await pb.collection('settings').create(data)
  }
}
