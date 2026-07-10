import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'

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
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('Os dados de configuração estão em um formato inválido no banco de dados.')
    }
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
  let record
  try {
    record = await pb.collection('settings').getFirstListItem(`key = "${RULES_KEY}"`)
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      throw new Error(
        'Registro de configuração de cashback não encontrado no banco de dados. Verifique se as migrações foram aplicadas.',
      )
    }
    throw new Error(
      'Não foi possível conectar ao banco de dados para carregar as configurações de cashback.',
    )
  }
  const rawValue = record.value
  if (rawValue === undefined || rawValue === null) {
    throw new Error('O campo de configuração está vazio no banco de dados.')
  }
  return normalizeRules(rawValue)
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<CashbackRules> => {
  const payload: CashbackRules = { ...rules }
  try {
    const record = await pb.collection('settings').getFirstListItem(`key = "${RULES_KEY}"`)
    await pb.collection('settings').update(record.id, { value: payload })
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      try {
        await pb.collection('settings').create({ key: RULES_KEY, value: payload })
      } catch (createErr) {
        throw new Error(
          'Não foi possível criar o registro de configuração no banco de dados. Tente novamente.',
        )
      }
    } else if (err instanceof ClientResponseError) {
      throw new Error(
        `Erro ao salvar configurações: ${err.message || 'falha na comunicação com o banco de dados.'}`,
      )
    } else {
      throw new Error('Não foi possível conectar ao banco de dados para salvar as configurações.')
    }
  }
  return getCashbackRules()
}
