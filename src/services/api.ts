/**
 * Camada de abstração de Dados / Repository Pattern.
 * Define o contrato único de comunicação com o backend e provê a implementação mockada.
 *
 * No futuro, para plugar a API REST conectada à base Postgres:
 * 1. Implemente a interface IDataService em 'src/services/rest/restService.ts'
 * 2. Altere a constante ACTIVE_DATA_DRIVER de 'mock' para 'rest' ou use uma variável de ambiente (ex: VITE_DATA_DRIVER).
 */

import {
  MockStore,
  type MockSettings,
  type MockPurchase,
  type MockPayment,
  type MockSaleItem,
  type MockCashback,
  type MockPrize,
  type MockBanner,
  type MockPartnerStation,
  type MockUser,
} from './mock/store'
import type {
  AdminSale,
  AdminStats,
  AdminCustomer,
  ReleaseResult,
  BatchReleaseResult,
  ImportSalePayload,
} from './admin'
import type { CashbackRules } from './settings'

export type DataDriverType = 'mock' | 'rest'

// Ponto único de chaveamento de implementação (Mock vs REST Postgres)
export const ACTIVE_DATA_DRIVER: DataDriverType =
  (import.meta.env.VITE_DATA_DRIVER as DataDriverType) || 'mock'

export interface BatchSaleResult {
  total: number
  createdCount: number
  duplicateCount: number
  errorCount: number
  results: Array<{
    transactionId: string
    status: 'created' | 'duplicate' | 'error'
    id?: string
    message?: string
  }>
}

export interface IDataService {
  // Configurações
  getCashbackRules(): Promise<CashbackRules>
  updateCashbackRules(rules: CashbackRules): Promise<CashbackRules>

  // Vendas e Admin
  getAdminSales(): Promise<{ sales: AdminSale[] }>
  getAdminStats(): Promise<AdminStats>
  getAdminCustomers(): Promise<{ customers: AdminCustomer[] }>
  releaseCashback(cashbackId: string): Promise<ReleaseResult>
  releaseCashbackBatch(cashbackIds: string[]): Promise<BatchReleaseResult>
  importSale(payload: ImportSalePayload): Promise<{ success: boolean; id: string; message: string }>
  importSaleBatch(sales: ImportSalePayload[]): Promise<BatchSaleResult>

  // Itens e Pagamentos
  getPaymentsByPurchase(purchaseId: string): Promise<MockPayment[]>
  getPaymentsBatch(purchaseIds: string[]): Promise<Record<string, MockPayment[]>>
  getPurchaseItems(purchaseId: string): Promise<MockSaleItem[]>
  getPurchaseItemsBatch(purchaseIds: string[]): Promise<Record<string, MockSaleItem[]>>

  // Cashback e Consumidor
  getCashbackByUser(userId: string): Promise<MockCashback[]>
  getReleasedCashbackByUser(userId: string): Promise<MockCashback[]>
  getCashbackByPurchase(purchaseId: string): Promise<MockCashback[]>
  getPurchases(userId: string): Promise<MockPurchase[]>
  getPurchase(id: string): Promise<MockPurchase>

  // Banners, Prêmios, Parceiros e Resgates
  getBanners(): Promise<MockBanner[]>
  getAllBanners(): Promise<MockBanner[]>
  createBanner(data: FormData | Partial<MockBanner>): Promise<MockBanner>
  updateBanner(id: string, data: FormData | Partial<MockBanner>): Promise<MockBanner>
  deleteBanner(id: string): Promise<boolean>

  getPrizes(): Promise<MockPrize[]>
  getAllPrizes(): Promise<MockPrize[]>
  getPrize(id: string): Promise<MockPrize>
  createPrize(data: FormData | Partial<MockPrize>): Promise<MockPrize>
  updatePrize(id: string, data: FormData | Partial<MockPrize>): Promise<MockPrize>
  deletePrize(id: string): Promise<boolean>

  getPartnerStations(): Promise<MockPartnerStation[]>
  getAllPartnerStations(): Promise<MockPartnerStation[]>
  createPartnerStation(data: Partial<MockPartnerStation>): Promise<MockPartnerStation>
  updatePartnerStation(id: string, data: Partial<MockPartnerStation>): Promise<MockPartnerStation>
  deletePartnerStation(id: string): Promise<boolean>

  getRedemptions(userId: string): Promise<any[]>
  createRedemption(data: {
    client: string
    prize: string
    quantity: number
    total_cost: number
  }): Promise<any>
}

// -------------------------------------------------------------------------
// IMPLEMENTAÇÃO MOCKADA (In-memory + localStorage)
// -------------------------------------------------------------------------

class MockDataServiceImpl implements IDataService {
  async getCashbackRules(): Promise<CashbackRules> {
    const s = MockStore.getSettings()
    return {
      store_percent: s.store_percent,
      fuel_percent: s.fuel_percent,
      min_purchase_amount: s.min_purchase_amount,
      min_redemption_amount: s.min_redemption_amount,
      min_purchase_usage: s.min_purchase_usage,
    }
  }

  async updateCashbackRules(rules: CashbackRules): Promise<CashbackRules> {
    const current = MockStore.getSettings()
    const updated: MockSettings = {
      ...current,
      store_percent: Number(rules.store_percent) || 0,
      fuel_percent: Number(rules.fuel_percent) || 0,
      min_purchase_amount: Number(rules.min_purchase_amount) || 0,
      min_redemption_amount: Number(rules.min_redemption_amount) || 0,
      min_purchase_usage: Number(rules.min_purchase_usage) || 0,
    }
    MockStore.saveSettings(updated)
    return this.getCashbackRules()
  }

  async getAdminSales(): Promise<{ sales: AdminSale[] }> {
    const purchases = MockStore.getPurchases()
    const allCashback = MockStore.getCashback()
    const allItems = MockStore.getPurchaseItems()

    const sales: AdminSale[] = purchases.map((p) => {
      const pCashback = allCashback.filter((cb) => cb.purchase === p.id)
      const pItems = allItems.filter((i) => i.purchase === p.id)

      const cbStore = pCashback
        .filter((cb) => cb.type === 'loja')
        .reduce((sum, cb) => sum + (cb.amount_generated || 0), 0)
      const cbFuel = pCashback
        .filter((cb) => cb.type === 'combustivel')
        .reduce((sum, cb) => sum + (cb.amount_generated || 0), 0)

      return {
        id: p.id,
        api_sale_id: p.api_sale_id,
        date: p.purchase_date || p.created,
        client_name: p.client_name || 'Cliente',
        client_cpf: p.cpf || '—',
        total_amount: p.total_amount,
        cb_store: cbStore,
        cb_fuel: cbFuel,
        status: p.status,
        cashback_records: pCashback.map((cb) => ({
          id: cb.id,
          type: cb.type,
          status: cb.status,
          amount_generated: cb.amount_generated,
        })),
        items: pItems.map((item) => ({
          id: item.id,
          product_code: item.product_code,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      }
    })

    return { sales }
  }

  async getAdminStats(): Promise<AdminStats> {
    const purchases = MockStore.getPurchases()
    const cashback = MockStore.getCashback()
    const redemptions = MockStore.getRedemptions()
    const users = MockStore.getUsers()

    const totalSales = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0)
    const totalCashback = cashback.reduce((sum, cb) => sum + (cb.amount_generated || 0), 0)

    // Agrupar dados dos últimos 7 dias para o gráfico
    const chartMap = new Map<string, { sales: number; cashback: number }>()
    purchases.forEach((p) => {
      const day =
        (p.purchase_date || p.created || '').split('T')[0] || new Date().toISOString().split('T')[0]
      const curr = chartMap.get(day) || { sales: 0, cashback: 0 }
      curr.sales += p.total_amount || 0
      chartMap.set(day, curr)
    })
    cashback.forEach((cb) => {
      const day = (cb.created || '').split('T')[0] || new Date().toISOString().split('T')[0]
      const curr = chartMap.get(day) || { sales: 0, cashback: 0 }
      curr.cashback += cb.amount_generated || 0
      chartMap.set(day, curr)
    })

    const chartData = Array.from(chartMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vals]) => ({
        date,
        sales: Number(vals.sales.toFixed(2)),
        cashback: Number(vals.cashback.toFixed(2)),
      }))

    if (chartData.length === 0) {
      chartData.push({
        date: new Date().toISOString().split('T')[0],
        sales: totalSales,
        cashback: totalCashback,
      })
    }

    const topClients = users.slice(0, 5).map((u) => {
      const userPurchases = purchases.filter((p) => p.client === u.id || p.cpf === u.cpf)
      const userSpent = userPurchases.reduce((s, p) => s + (p.total_amount || 0), 0)
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        total: userSpent || 500.0,
        purchases: userPurchases.length || 2,
      }
    })

    return {
      totalSales: Number(totalSales.toFixed(2)),
      totalCashback: Number(totalCashback.toFixed(2)),
      redemptionCount: redemptions.length,
      userCount: users.length,
      chartData,
      topClients,
    }
  }

  async getAdminCustomers(): Promise<{ customers: AdminCustomer[] }> {
    const users = MockStore.getUsers()
    const purchases = MockStore.getPurchases()
    const cashback = MockStore.getCashback()

    const customers: AdminCustomer[] = users.map((u) => {
      const uPurchases = purchases.filter((p) => p.client === u.id || p.cpf === u.cpf)
      const purchaseIds = new Set(uPurchases.map((p) => p.id))
      const uCashback = cashback.filter((cb) => cb.client === u.id || purchaseIds.has(cb.purchase))

      const totalSpent = uPurchases.reduce((s, p) => s + (p.total_amount || 0), 0)
      const cbStore = uCashback
        .filter((c) => c.type === 'loja')
        .reduce((s, c) => s + (c.amount_generated || 0), 0)
      const cbFuel = uCashback
        .filter((c) => c.type === 'combustivel')
        .reduce((s, c) => s + (c.amount_generated || 0), 0)

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        cpf: u.cpf,
        phone: u.phone,
        avatar: u.avatar,
        status: u.status,
        created: u.created,
        purchaseCount: uPurchases.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        cashbackTotal: Number((cbStore + cbFuel).toFixed(2)),
        cashbackStore: Number(cbStore.toFixed(2)),
        cashbackFuel: Number(cbFuel.toFixed(2)),
      }
    })

    return { customers }
  }

  async releaseCashback(cashbackId: string): Promise<ReleaseResult> {
    const list = MockStore.getCashback()
    const target = list.find((cb) => cb.id === cashbackId)
    if (!target) throw new Error('Cashback não encontrado')

    const now = new Date().toISOString()
    target.status = 'released'
    target.amount_available = target.amount_generated
    target.released_at = now
    target.updated = now
    MockStore.saveCashback(list)

    // Atualiza status da purchase para approved se todas estiverem liberadas
    const purchases = MockStore.getPurchases()
    const purchase = purchases.find((p) => p.id === target.purchase)
    if (purchase) {
      purchase.status = 'approved'
      purchase.updated = now
      MockStore.savePurchases(purchases)
    }

    return {
      success: true,
      id: target.id,
      status: 'released',
      released_at: now,
    }
  }

  async releaseCashbackBatch(cashbackIds: string[]): Promise<BatchReleaseResult> {
    const list = MockStore.getCashback()
    const released: string[] = []
    const skipped: Array<{ id: string; reason: string }> = []
    const now = new Date().toISOString()

    const affectedPurchaseIds = new Set<string>()

    cashbackIds.forEach((id) => {
      const item = list.find((cb) => cb.id === id)
      if (!item) {
        skipped.push({ id, reason: 'Não encontrado' })
        return
      }
      if (item.status === 'released') {
        skipped.push({ id, reason: 'Já liberado anteriormente' })
        return
      }
      item.status = 'released'
      item.amount_available = item.amount_generated
      item.released_at = now
      item.updated = now
      released.push(id)
      affectedPurchaseIds.add(item.purchase)
    })

    MockStore.saveCashback(list)

    if (affectedPurchaseIds.size > 0) {
      const purchases = MockStore.getPurchases()
      purchases.forEach((p) => {
        if (affectedPurchaseIds.has(p.id)) {
          p.status = 'approved'
          p.updated = now
        }
      })
      MockStore.savePurchases(purchases)
    }

    return {
      success: true,
      released,
      skipped,
    }
  }

  async importSale(
    payload: ImportSalePayload,
  ): Promise<{ success: boolean; id: string; message: string }> {
    const data = payload.data || (payload as any)
    const transactionId = data.transactionId || `SALE-${Date.now().toString().slice(-4)}`
    const purchases = MockStore.getPurchases()

    // Idempotência por transactionId
    if (purchases.some((p) => p.api_sale_id === transactionId)) {
      return {
        success: false,
        id: transactionId,
        message: `Venda com transactionId "${transactionId}" já foi importada anteriormente.`,
      }
    }

    const settings = MockStore.getSettings()
    const customerCpf = data.customerCpf || ''
    const customerName = data.customerName || 'Cliente'
    const totalAmount = Number(data.totalAmount) || 0
    const now = new Date().toISOString()
    const purchaseId = `pur_${Date.now()}`

    // Identifica ou cria usuário consumidor
    let user = MockStore.getUserByCpf(customerCpf)
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: customerName,
        email: `cliente.${customerCpf.replace(/\D/g, '').slice(-4)}@exemplo.com`,
        cpf: customerCpf,
        phone: '',
        avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=99',
        status: true,
        created: now,
      }
      const users = MockStore.getUsers()
      users.push(user)
      MockStore.saveUsers(users)
    }

    const newPurchase: MockPurchase = {
      id: purchaseId,
      client: user.id,
      cpf: customerCpf,
      api_sale_id: transactionId,
      total_amount: totalAmount,
      purchase_date: payload.timestamp || now,
      origin_channel: 'API REST',
      status: (data.status as any) || 'pending',
      sync_date: now,
      created: now,
      updated: now,
      client_name: customerName,
      client_email: user.email,
    }
    purchases.unshift(newPurchase)
    MockStore.savePurchases(purchases)

    // Cria itens da venda se fornecidos
    if (Array.isArray(data.items) && data.items.length > 0) {
      const allItems = MockStore.getPurchaseItems()
      data.items.forEach((item: any, idx: number) => {
        allItems.push({
          id: `item_${Date.now()}_${idx}`,
          purchase: purchaseId,
          product_code: item.codigo || item.product_code || `PRD-${idx + 1}`,
          name: item.descricao || item.name || 'Item de Venda',
          quantity: Number(item.quantidade ?? item.qty ?? 1),
          unit_price: Number(item['preço unitario'] ?? item.unit_price ?? totalAmount),
          total_price: Number(item['preço total'] ?? item.total_price ?? totalAmount),
          created: now,
          updated: now,
        })
      })
      MockStore.savePurchaseItems(allItems)
    }

    // Cria pagamentos se fornecidos
    if (Array.isArray(data.payments) && data.payments.length > 0) {
      const allPayments = MockStore.getPayments()
      data.payments.forEach((payment: any, idx: number) => {
        allPayments.push({
          id: `pay_${Date.now()}_${idx}`,
          purchase: purchaseId,
          method: payment.method || 'dinheiro',
          amount: Number(payment.amount) || totalAmount,
          created: now,
          updated: now,
        })
      })
      MockStore.savePayments(allPayments)
    }

    // Calcula cashback de acordo com as regras configuradas
    if (totalAmount >= settings.min_purchase_amount) {
      const allCashback = MockStore.getCashback()
      const cbStoreAmount = Number(((totalAmount * settings.store_percent) / 100).toFixed(2))
      const cbFuelAmount = Number(((totalAmount * settings.fuel_percent) / 100).toFixed(2))

      allCashback.push(
        {
          id: `cb_${Date.now()}_store`,
          client: user.id,
          purchase: purchaseId,
          type: 'loja',
          amount_generated: cbStoreAmount,
          amount_available: newPurchase.status === 'approved' ? cbStoreAmount : 0,
          amount_used: 0,
          status: newPurchase.status === 'approved' ? 'released' : 'pending',
          released_at: newPurchase.status === 'approved' ? now : undefined,
          created: now,
          updated: now,
        },
        {
          id: `cb_${Date.now()}_fuel`,
          client: user.id,
          purchase: purchaseId,
          type: 'combustivel',
          amount_generated: cbFuelAmount,
          amount_available: newPurchase.status === 'approved' ? cbFuelAmount : 0,
          amount_used: 0,
          status: newPurchase.status === 'approved' ? 'released' : 'pending',
          released_at: newPurchase.status === 'approved' ? now : undefined,
          created: now,
          updated: now,
        },
      )
      MockStore.saveCashback(allCashback)
    }

    return {
      success: true,
      id: purchaseId,
      message: `Venda ${transactionId} importada com sucesso!`,
    }
  }

  async importSaleBatch(salesList: ImportSalePayload[]): Promise<BatchSaleResult> {
    const results: BatchSaleResult['results'] = []
    let createdCount = 0
    let duplicateCount = 0
    let errorCount = 0

    for (const sale of salesList) {
      const txId = sale.data?.transactionId || (sale as any).transactionId || 'UNKNOWN'
      try {
        const res = await this.importSale(sale)
        if (res.success) {
          createdCount++
          results.push({ transactionId: txId, status: 'created', id: res.id, message: res.message })
        } else {
          duplicateCount++
          results.push({ transactionId: txId, status: 'duplicate', message: res.message })
        }
      } catch (err) {
        errorCount++
        results.push({
          transactionId: txId,
          status: 'error',
          message: err instanceof Error ? err.message : 'Falha desconhecida',
        })
      }
    }

    return {
      total: salesList.length,
      createdCount,
      duplicateCount,
      errorCount,
      results,
    }
  }

  async getPaymentsByPurchase(purchaseId: string): Promise<MockPayment[]> {
    return MockStore.getPayments().filter((p) => p.purchase === purchaseId)
  }

  async getPaymentsBatch(purchaseIds: string[]): Promise<Record<string, MockPayment[]>> {
    const map: Record<string, MockPayment[]> = {}
    purchaseIds.forEach((id) => (map[id] = []))
    const payments = MockStore.getPayments()
    payments.forEach((p) => {
      if (map[p.purchase]) {
        map[p.purchase].push(p)
      }
    })
    return map
  }

  async getPurchaseItems(purchaseId: string): Promise<MockSaleItem[]> {
    return MockStore.getPurchaseItems().filter((item) => item.purchase === purchaseId)
  }

  async getPurchaseItemsBatch(purchaseIds: string[]): Promise<Record<string, MockSaleItem[]>> {
    const map: Record<string, MockSaleItem[]> = {}
    purchaseIds.forEach((id) => (map[id] = []))
    const items = MockStore.getPurchaseItems()
    items.forEach((item) => {
      if (map[item.purchase]) {
        map[item.purchase].push(item)
      }
    })
    return map
  }

  async getCashbackByUser(userId: string): Promise<MockCashback[]> {
    return MockStore.getCashback().filter((cb) => cb.client === userId)
  }

  async getReleasedCashbackByUser(userId: string): Promise<MockCashback[]> {
    return MockStore.getCashback().filter((cb) => cb.client === userId && cb.status === 'released')
  }

  async getCashbackByPurchase(purchaseId: string): Promise<MockCashback[]> {
    return MockStore.getCashback().filter((cb) => cb.purchase === purchaseId)
  }

  async getPurchases(userId: string): Promise<MockPurchase[]> {
    return MockStore.getPurchases().filter((p) => p.client === userId)
  }

  async getPurchase(id: string): Promise<MockPurchase> {
    const p = MockStore.getPurchases().find((item) => item.id === id)
    if (!p) throw new Error('Compra não encontrada')
    return p
  }

  async getBanners(): Promise<MockBanner[]> {
    return MockStore.getBanners().filter((b) => b.active)
  }

  async getAllBanners(): Promise<MockBanner[]> {
    return MockStore.getBanners()
  }

  async createBanner(data: any): Promise<MockBanner> {
    const banners = MockStore.getBanners()
    const newBanner: MockBanner = {
      id: `ban_${Date.now()}`,
      title: data.title || (data.get ? data.get('title') : 'Novo Banner'),
      description: data.description || (data.get ? data.get('description') : ''),
      image: data.image || 'https://img.usecurling.com/p/800/300?q=promo&color=blue',
      position: 'home_carousel',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      active: true,
      sort_order: banners.length + 1,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    banners.push(newBanner)
    MockStore.saveBanners(banners)
    return newBanner
  }

  async updateBanner(id: string, data: any): Promise<MockBanner> {
    const banners = MockStore.getBanners()
    const idx = banners.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Banner não encontrado')
    banners[idx] = {
      ...banners[idx],
      ...(data instanceof FormData
        ? { title: data.get('title')?.toString(), description: data.get('description')?.toString() }
        : data),
      updated: new Date().toISOString(),
    }
    MockStore.saveBanners(banners)
    return banners[idx]
  }

  async deleteBanner(id: string): Promise<boolean> {
    const banners = MockStore.getBanners().filter((b) => b.id !== id)
    MockStore.saveBanners(banners)
    return true
  }

  async getPrizes(): Promise<MockPrize[]> {
    return MockStore.getPrizes().filter((p) => p.active)
  }

  async getAllPrizes(): Promise<MockPrize[]> {
    return MockStore.getPrizes()
  }

  async getPrize(id: string): Promise<MockPrize> {
    const p = MockStore.getPrizes().find((item) => item.id === id)
    if (!p) throw new Error('Prêmio não encontrado')
    return p
  }

  async createPrize(data: any): Promise<MockPrize> {
    const prizes = MockStore.getPrizes()
    const newPrize: MockPrize = {
      id: `prz_${Date.now()}`,
      name: data.name || (data.get ? data.get('name') : 'Novo Prêmio'),
      description: data.description || (data.get ? data.get('description') : ''),
      image: data.image || 'https://img.usecurling.com/p/400/300?q=gift&color=emerald',
      stock: Number(data.stock || (data.get ? data.get('stock') : 10)),
      required_amount: Number(
        data.required_amount || (data.get ? data.get('required_amount') : 50),
      ),
      active: true,
      campaign_end: new Date(Date.now() + 90 * 86400000).toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    prizes.push(newPrize)
    MockStore.savePrizes(prizes)
    return newPrize
  }

  async updatePrize(id: string, data: any): Promise<MockPrize> {
    const prizes = MockStore.getPrizes()
    const idx = prizes.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Prêmio não encontrado')
    prizes[idx] = {
      ...prizes[idx],
      ...(data instanceof FormData
        ? { name: data.get('name')?.toString(), description: data.get('description')?.toString() }
        : data),
      updated: new Date().toISOString(),
    }
    MockStore.savePrizes(prizes)
    return prizes[idx]
  }

  async deletePrize(id: string): Promise<boolean> {
    const prizes = MockStore.getPrizes().filter((p) => p.id !== id)
    MockStore.savePrizes(prizes)
    return true
  }

  async getPartnerStations(): Promise<MockPartnerStation[]> {
    return MockStore.getPartners().filter((pt) => pt.active)
  }

  async getAllPartnerStations(): Promise<MockPartnerStation[]> {
    return MockStore.getPartners()
  }

  async createPartnerStation(data: Partial<MockPartnerStation>): Promise<MockPartnerStation> {
    const list = MockStore.getPartners()
    const newPartner: MockPartnerStation = {
      id: `pt_${Date.now()}`,
      name: data.name || 'Novo Posto Parceiro',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      phone: data.phone || '',
      active: data.active ?? true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    list.unshift(newPartner)
    MockStore.savePartners(list)
    return newPartner
  }

  async updatePartnerStation(
    id: string,
    data: Partial<MockPartnerStation>,
  ): Promise<MockPartnerStation> {
    const list = MockStore.getPartners()
    const idx = list.findIndex((item) => item.id === id)
    if (idx === -1) throw new Error('Posto parceiro não encontrado')
    list[idx] = { ...list[idx], ...data, updated: new Date().toISOString() }
    MockStore.savePartners(list)
    return list[idx]
  }

  async deletePartnerStation(id: string): Promise<boolean> {
    const list = MockStore.getPartners().filter((item) => item.id !== id)
    MockStore.savePartners(list)
    return true
  }

  async getRedemptions(userId: string): Promise<any[]> {
    return MockStore.getRedemptions().filter((r) => r.client === userId)
  }

  async createRedemption(data: {
    client: string
    prize: string
    quantity: number
    total_cost: number
  }): Promise<any> {
    const redemptions = MockStore.getRedemptions()
    const newRedemption = {
      id: `red_${Date.now()}`,
      client: data.client,
      prize: data.prize,
      quantity: data.quantity,
      total_cost: data.total_cost,
      status: 'approved' as const,
      delivery_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    redemptions.unshift(newRedemption)
    MockStore.saveRedemptions(redemptions)

    // Subtrai do estoque do prêmio
    const prizes = MockStore.getPrizes()
    const prize = prizes.find((p) => p.id === data.prize)
    if (prize && prize.stock > 0) {
      prize.stock -= data.quantity
      MockStore.savePrizes(prizes)
    }

    return newRedemption
  }
}

// -------------------------------------------------------------------------
// FUTURA IMPLEMENTAÇÃO REST (POSTGRES VIA API REST)
// O desenvolvedor poderá preencher esta classe quando a API Postgres estiver no ar.
// -------------------------------------------------------------------------
class RestDataServiceImpl implements IDataService {
  private baseUrl = import.meta.env.VITE_API_URL || '/api'

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
      throw new Error(err?.error?.message || `HTTP error ${res.status}`)
    }
    return res.json()
  }

  async getCashbackRules(): Promise<CashbackRules> {
    return this.fetch<CashbackRules>('/settings')
  }
  async updateCashbackRules(rules: CashbackRules): Promise<CashbackRules> {
    return this.fetch<CashbackRules>('/settings', { method: 'PUT', body: JSON.stringify(rules) })
  }
  async getAdminSales(): Promise<{ sales: AdminSale[] }> {
    return this.fetch<{ sales: AdminSale[] }>('/sales')
  }
  async getAdminStats(): Promise<AdminStats> {
    return this.fetch<AdminStats>('/admin/stats')
  }
  async getAdminCustomers(): Promise<{ customers: AdminCustomer[] }> {
    return this.fetch<{ customers: AdminCustomer[] }>('/customers')
  }
  async releaseCashback(cashbackId: string): Promise<ReleaseResult> {
    return this.fetch<ReleaseResult>('/cashback/release', {
      method: 'POST',
      body: JSON.stringify({ cashback_ids: [cashbackId] }),
    })
  }
  async releaseCashbackBatch(cashbackIds: string[]): Promise<BatchReleaseResult> {
    return this.fetch<BatchReleaseResult>('/cashback/release', {
      method: 'POST',
      body: JSON.stringify({ cashback_ids: cashbackIds }),
    })
  }
  async importSale(
    payload: ImportSalePayload,
  ): Promise<{ success: boolean; id: string; message: string }> {
    return this.fetch('/sales', { method: 'POST', body: JSON.stringify(payload.data || payload) })
  }
  async importSaleBatch(sales: ImportSalePayload[]): Promise<BatchSaleResult> {
    return this.fetch('/sales/batch', { method: 'POST', body: JSON.stringify({ sales }) })
  }
  async getPaymentsByPurchase(purchaseId: string): Promise<MockPayment[]> {
    return this.fetch<MockPayment[]>(`/sales/${purchaseId}/payments`)
  }
  async getPaymentsBatch(purchaseIds: string[]): Promise<Record<string, MockPayment[]>> {
    // fallback or batch endpoint
    const mock = new MockDataServiceImpl()
    return mock.getPaymentsBatch(purchaseIds)
  }
  async getPurchaseItems(purchaseId: string): Promise<MockSaleItem[]> {
    return this.fetch<MockSaleItem[]>(`/sales/${purchaseId}/items`)
  }
  async getPurchaseItemsBatch(purchaseIds: string[]): Promise<Record<string, MockSaleItem[]>> {
    const mock = new MockDataServiceImpl()
    return mock.getPurchaseItemsBatch(purchaseIds)
  }
  async getCashbackByUser(userId: string): Promise<MockCashback[]> {
    return this.fetch<MockCashback[]>(`/customers/${userId}/cashback`)
  }
  async getReleasedCashbackByUser(userId: string): Promise<MockCashback[]> {
    const all = await this.getCashbackByUser(userId)
    return all.filter((cb) => cb.status === 'released')
  }
  async getCashbackByPurchase(purchaseId: string): Promise<MockCashback[]> {
    return this.fetch<MockCashback[]>(`/sales/${purchaseId}/cashback`)
  }
  async getPurchases(userId: string): Promise<MockPurchase[]> {
    return this.fetch<MockPurchase[]>(`/customers/${userId}/purchases`)
  }
  async getPurchase(id: string): Promise<MockPurchase> {
    return this.fetch<MockPurchase>(`/sales/${id}`)
  }
  async getBanners(): Promise<MockBanner[]> {
    return this.fetch<MockBanner[]>('/banners')
  }
  async getAllBanners(): Promise<MockBanner[]> {
    return this.fetch<MockBanner[]>('/banners')
  }
  async createBanner(data: any): Promise<MockBanner> {
    return this.fetch<MockBanner>('/banners', { method: 'POST', body: JSON.stringify(data) })
  }
  async updateBanner(id: string, data: any): Promise<MockBanner> {
    return this.fetch<MockBanner>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteBanner(id: string): Promise<boolean> {
    return this.fetch<boolean>(`/banners/${id}`, { method: 'DELETE' })
  }
  async getPrizes(): Promise<MockPrize[]> {
    return this.fetch<MockPrize[]>('/prizes')
  }
  async getAllPrizes(): Promise<MockPrize[]> {
    return this.fetch<MockPrize[]>('/prizes')
  }
  async getPrize(id: string): Promise<MockPrize> {
    return this.fetch<MockPrize>(`/prizes/${id}`)
  }
  async createPrize(data: any): Promise<MockPrize> {
    return this.fetch<MockPrize>('/prizes', { method: 'POST', body: JSON.stringify(data) })
  }
  async updatePrize(id: string, data: any): Promise<MockPrize> {
    return this.fetch<MockPrize>(`/prizes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deletePrize(id: string): Promise<boolean> {
    return this.fetch<boolean>(`/prizes/${id}`, { method: 'DELETE' })
  }
  async getPartnerStations(): Promise<MockPartnerStation[]> {
    return this.fetch<MockPartnerStation[]>('/partner-stations')
  }
  async getAllPartnerStations(): Promise<MockPartnerStation[]> {
    return this.fetch<MockPartnerStation[]>('/partner-stations')
  }
  async createPartnerStation(data: Partial<MockPartnerStation>): Promise<MockPartnerStation> {
    return this.fetch<MockPartnerStation>('/partner-stations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  async updatePartnerStation(
    id: string,
    data: Partial<MockPartnerStation>,
  ): Promise<MockPartnerStation> {
    return this.fetch<MockPartnerStation>(`/partner-stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  async deletePartnerStation(id: string): Promise<boolean> {
    return this.fetch<boolean>(`/partner-stations/${id}`, { method: 'DELETE' })
  }
  async getRedemptions(userId: string): Promise<any[]> {
    return this.fetch<any[]>(`/customers/${userId}/redemptions`)
  }
  async createRedemption(data: any): Promise<any> {
    return this.fetch('/redemptions', { method: 'POST', body: JSON.stringify(data) })
  }
}

// Factory Pattern: exporta a instância ativa do repositório
function createDataService(): IDataService {
  if (ACTIVE_DATA_DRIVER === 'rest') {
    return new RestDataServiceImpl()
  }
  return new MockDataServiceImpl()
}

export const apiService: IDataService = createDataService()
