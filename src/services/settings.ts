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

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 100,
  store_percent: 8,
  fuel_percent: 2,
  min_redemption_amount: 50,
  min_purchase_usage: 500,
}

function extractRulesFromRecord(record: any): CashbackRules {
  const getNum = (field: string): number => {
    const val = record[field]
    if (typeof val === 'number' && !isNaN(val)) return val
    return DEFAULT_RULES[field as keyof CashbackRules]
  }
  return {
    store_percent: getNum('store_percent'),
    fuel_percent: getNum('fuel_percent'),
    min_purchase_amount: getNum('min_purchase_amount'),
    min_redemption_amount: getNum('min_redemption_amount'),
    min_purchase_usage: getNum('min_purchase_usage'),
  }
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
  return extractRulesFromRecord(record)
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<CashbackRules> => {
  const payload = {
    store_percent: rules.store_percent,
    fuel_percent: rules.fuel_percent,
    min_purchase_amount: rules.min_purchase_amount,
    min_redemption_amount: rules.min_redemption_amount,
    min_purchase_usage: rules.min_purchase_usage,
    value: {
      store_percent: rules.store_percent,
      fuel_percent: rules.fuel_percent,
      min_purchase_amount: rules.min_purchase_amount,
      min_redemption_amount: rules.min_redemption_amount,
      min_purchase_usage: rules.min_purchase_usage,
    },
  }
  try {
    const record = await pb.collection('settings').getFirstListItem(`key = "${RULES_KEY}"`)
    await pb.collection('settings').update(record.id, payload)
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      try {
        await pb.collection('settings').create({ key: RULES_KEY, ...payload })
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
