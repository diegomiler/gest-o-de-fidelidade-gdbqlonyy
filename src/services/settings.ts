import pb from '@/lib/pocketbase/client'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
  min_redemption_amount: number
  min_purchase_usage: number
}

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 0,
  store_percent: 10,
  fuel_percent: 2,
  min_redemption_amount: 10,
  min_purchase_usage: 0,
}

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
      min_purchase_usage: parsed.min_purchase_usage ?? DEFAULT_RULES.min_purchase_usage,
    }
  } catch {
    return DEFAULT_RULES
  }
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<void> => {
  try {
    const record = await pb.collection('settings').getFirstListItem('key = "cashback_rules"')
    await pb.collection('settings').update(record.id, { value: rules })
  } catch {
    await pb.collection('settings').create({ key: 'cashback_rules', value: rules })
  }
}
