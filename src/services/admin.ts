import pb from '@/lib/pocketbase/client'

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

export const getAdminStats = (): Promise<AdminStats> =>
  pb.send('/backend/v1/admin/stats', { method: 'GET' })

export const getAdminSales = (): Promise<{ sales: AdminSale[] }> =>
  pb.send('/backend/v1/admin/sales', { method: 'GET' })

export const getAdminCustomers = (): Promise<{ customers: AdminCustomer[] }> =>
  pb.send('/backend/v1/admin/customers', { method: 'GET' })

export const releaseCashback = (cashbackId: string): Promise<ReleaseResult> =>
  pb.send('/backend/v1/cashback/release', {
    method: 'POST',
    body: JSON.stringify({ cashback_id: cashbackId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const releaseCashbackBatch = (cashbackIds: string[]): Promise<BatchReleaseResult> =>
  pb.send('/backend/v1/cashback/release-batch', {
    method: 'POST',
    body: JSON.stringify({ cashback_ids: cashbackIds }),
    headers: { 'Content-Type': 'application/json' },
  })

export interface ImportSalePayload {
  event?: string
  timestamp?: string
  data: {
    transactionId?: string
    customerName?: string
    customerCpf: string
    totalAmount: number
    status?: string
  }
}

export const importSale = (
  payload: ImportSalePayload,
): Promise<{ success: boolean; id: string; message: string }> =>
  pb.send('/backend/v1/import/sale', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })
