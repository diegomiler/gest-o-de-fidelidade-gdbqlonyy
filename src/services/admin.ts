import { apiService } from './api'

export interface AdminStats {
  totalSales: number
  totalCashback: number
  redemptionCount: number
  userCount: number
  chartData: Array<{ date: string; sales: number; cashback: number }>
  topClients: Array<{ id: string; name: string; avatar: string; total: number; purchases: number }>
}

export interface CashbackRecordInfo {
  id: string
  type: string
  status: string
  amount_generated: number
}

export interface AdminSaleItem {
  id: string
  product_code: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface AdminSale {
  id: string
  api_sale_id: string
  date: string
  client_name: string
  client_cpf: string
  total_amount: number
  cb_store: number
  cb_fuel: number
  status: string
  cashback_records: CashbackRecordInfo[]
  items?: AdminSaleItem[]
}

export interface ReleaseResult {
  success: boolean
  id: string
  status: string
  released_at: string
}

export interface BatchReleaseResult {
  success: boolean
  released: string[]
  skipped: Array<{ id: string; reason: string }>
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  avatar: string
  status: boolean
  created: string
  purchaseCount: number
  totalSpent: number
  cashbackTotal: number
  cashbackStore: number
  cashbackFuel: number
}

export interface ImportSalePayload {
  event?: string
  timestamp?: string
  data: {
    transactionId?: string
    customerName?: string
    customerCpf: string
    totalAmount: number
    status?: string
    payments?: Array<{ method: string; amount: number }>
    items?: Array<{
      codigo?: string
      descricao?: string
      quantidade?: number
      'preço unitario'?: number
      'preço total'?: number
      name?: string
      unit_price?: number
      total_price?: number
    }>
  }
}

export const getAdminStats = (): Promise<AdminStats> => apiService.getAdminStats()

export const getAdminSales = (): Promise<{ sales: AdminSale[] }> => apiService.getAdminSales()

export const getAdminCustomers = (): Promise<{ customers: AdminCustomer[] }> =>
  apiService.getAdminCustomers()

export const releaseCashback = (cashbackId: string): Promise<ReleaseResult> =>
  apiService.releaseCashback(cashbackId)

export const releaseCashbackBatch = (cashbackIds: string[]): Promise<BatchReleaseResult> =>
  apiService.releaseCashbackBatch(cashbackIds)

export const importSale = (
  payload: ImportSalePayload,
): Promise<{ success: boolean; id: string; message: string }> => apiService.importSale(payload)
