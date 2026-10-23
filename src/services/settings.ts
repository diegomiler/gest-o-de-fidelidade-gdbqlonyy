import { apiService } from './api'

export interface CashbackRules {
  min_purchase_amount: number
  store_percent: number
  fuel_percent: number
  min_redemption_amount: number
  min_purchase_usage: number
}

/** Dados institucionais e canais de atendimento exibidos na página pública. */
export interface ProgramInfo {
  nome_programa: string
  cnpj: string
  whatsapp: string
  telefone_atendimento: string
  email_atendimento: string
}

export const getCashbackRules = async (): Promise<CashbackRules> => {
  return apiService.getCashbackRules()
}

export const updateCashbackRules = async (rules: CashbackRules): Promise<CashbackRules> => {
  return apiService.updateCashbackRules(rules)
}

export const getProgramInfo = async (): Promise<ProgramInfo> => {
  return apiService.getProgramInfo()
}

export const updateProgramInfo = async (info: ProgramInfo): Promise<ProgramInfo> => {
  return apiService.updateProgramInfo(info)
}
