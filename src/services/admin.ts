import pb from '@/lib/pocketbase/client'

export interface AdminStats {
  totalSales: number
  totalCashback: number
  redemptionCount: number
  userCount: number
  chartData: Array<{ date: string; sales: number; cashback: number }>
  topClients: Array<{ name: string; total: number; purchases: number }>
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
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  status: boolean
  created: string
  purchaseCount: number
  totalSpent: number
  cashbackTotal: number
}

export const getAdminStats = (): Promise<AdminStats> =>
  pb.send('/backend/v1/admin/stats', { method: 'GET' })

export const getAdminSales = (): Promise<{ sales: AdminSale[] }> =>
  pb.send('/backend/v1/admin/sales', { method: 'GET' })

export const getAdminCustomers = (): Promise<{ customers: AdminCustomer[] }> =>
  pb.send('/backend/v1/admin/customers', { method: 'GET' })
