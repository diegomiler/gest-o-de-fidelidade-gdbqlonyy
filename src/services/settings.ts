import pb from '@/lib/pocketbase/client'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
  min_redemption_amount: number
  min_purchase_usage: number
}

const RULES_KEY = 'cashback_rules'

const RULE_FIELDS: (keyof CashbackRules)[] = [
  'min_purchase_amount',
  'store_percent',
  'fuel_percent',
  'min_redemption_amount',
  'min_purchase_usage',
]

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 0,
  store_percent: 10,
  fuel_percent: 2,
  min_redemption_amount: 10,
  min_purchase_usage: 0,
}

function normalizeRules(raw: unknown): CashbackRules {
  let parsed = raw
  if (typeof raw === 'string') {
    parsed = JSON.parse(raw)
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de dados inválido para cashback_rules.')
  }
  const obj = parsed as Record<string, unknown>
  const result = { ...DEFAULT_RULES }
  for (const field of RULE_FIELDS) {
    const val = obj[field]
    if (typeof val === 'number' && !isNaN(val)) {
      result[field] = val
    }
  }
  return result
}

export const getCashbackRules = async (): Promise<CashbackRules> => {
  const record = await pb.collection('settings').getFirstListItem(`key = "${RULES_KEY}"`)
  return normalizeRules(record.get('value'))
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<CashbackRules> => {
  const payload: CashbackRules = { ...rules }
  try {
    const record = await pb.collection('settings').getFirstListItem(`key = "${RULES_KEY}"`)
    await pb.collection('settings').update(record.id, { value: payload })
  } catch {
    await pb.collection('settings').create({ key: RULES_KEY, value: payload })
  }
  return getCashbackRules()
}
