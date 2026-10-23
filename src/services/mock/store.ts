/**
 * Mock Store central para o modo sem backend remoto (gestão de fidelidade).
 * Mantém os dados em memória e persiste em localStorage para preservar alterações
 * feitas pelo usuário na interface (configurações, liberações de cashback, importações, banners, postos, prêmios).
 */

export interface MockUser {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  avatar: string
  status: boolean
  created: string
}

export interface MockSaleItem {
  id: string
  purchase: string
  product_code: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
  created: string
  updated: string
}

export interface MockPayment {
  id: string
  purchase: string
  method: string
  amount: number
  created: string
  updated: string
}

export interface MockCashback {
  id: string
  client: string
  purchase: string
  type: 'loja' | 'combustivel'
  amount_generated: number
  amount_available: number
  amount_used: number
  status: 'pending' | 'released' | 'used' | 'expired'
  released_at?: string
  expired_at?: string
  notes?: string
  created: string
  updated: string
}

export interface MockPurchase {
  id: string
  client: string
  cpf: string
  api_sale_id: string
  total_amount: number
  purchase_date: string
  origin_channel: string
  status: 'pending' | 'approved' | 'canceled'
  sync_date: string
  created: string
  updated: string
  client_name?: string
  client_email?: string
}

export interface MockSettings {
  store_percent: number
  fuel_percent: number
  min_purchase_amount: number
  min_redemption_amount: number
  min_purchase_usage: number
}

export interface MockPrize {
  id: string
  name: string
  description: string
  image: string
  stock: number
  required_amount: number
  active: boolean
  campaign_end: string
  created: string
  updated: string
}

export interface MockBanner {
  id: string
  title: string
  description: string
  image: string
  position: string
  start_date: string
  end_date: string
  active: boolean
  sort_order: number
  created: string
  updated: string
}

export interface MockPartnerStation {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  active: boolean
  created: string
  updated: string
}

export interface MockRedemption {
  id: string
  client: string
  prize: string
  quantity: number
  total_cost: number
  status: 'requested' | 'approved' | 'delivered' | 'canceled'
  delivery_date?: string
  created: string
  updated: string
}

const STORAGE_PREFIX = 'fidelidade_mock_'

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    // Notifica listeners no mesmo frame de evento
    window.dispatchEvent(new CustomEvent('fidelidade_store_change', { detail: { key } }))
  } catch {
    /* ignore storage quota errors */
  }
}

// Dados semente iniciais realistas coerentes com o domínio de fidelidade
const INITIAL_USERS: MockUser[] = [
  {
    id: 'usr_diego',
    name: 'Diego Miler',
    email: 'diegomiler@live.com',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=42',
    status: true,
    created: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'usr_maria',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@exemplo.com',
    cpf: '234.567.890-11',
    phone: '(11) 97654-3210',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=22',
    status: true,
    created: '2026-02-10T14:30:00.000Z',
  },
  {
    id: 'usr_carlos',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.santos@exemplo.com',
    cpf: '345.678.901-22',
    phone: '(21) 96543-2109',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=87',
    status: true,
    created: '2026-03-05T09:15:00.000Z',
  },
  {
    id: 'usr_ana',
    name: 'Ana Carolina Pereira',
    email: 'ana.pereira@exemplo.com',
    cpf: '456.789.012-33',
    phone: '(31) 95432-1098',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=55',
    status: true,
    created: '2026-04-12T16:45:00.000Z',
  },
]

const INITIAL_SETTINGS: MockSettings = {
  store_percent: 8,
  fuel_percent: 2,
  min_purchase_amount: 100,
  min_purchase_usage: 500,
  min_redemption_amount: 50,
}

const INITIAL_PURCHASES: MockPurchase[] = [
  {
    id: 'pur_001',
    client: 'usr_diego',
    cpf: '123.456.789-00',
    api_sale_id: 'SALE-003',
    total_amount: 848.8,
    purchase_date: '2026-07-21T21:51:00.000Z',
    origin_channel: 'Loja Matriz',
    status: 'approved',
    sync_date: '2026-07-21T21:52:00.000Z',
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T21:51:00.000Z',
    client_name: 'Diego Miler',
    client_email: 'diegomiler@live.com',
  },
  {
    id: 'pur_002',
    client: 'usr_maria',
    cpf: '234.567.890-11',
    api_sale_id: 'SALE-002',
    total_amount: 450.0,
    purchase_date: '2026-07-20T14:20:00.000Z',
    origin_channel: 'Loja Matriz',
    status: 'pending',
    sync_date: '2026-07-20T14:21:00.000Z',
    created: '2026-07-20T14:20:00.000Z',
    updated: '2026-07-20T14:20:00.000Z',
    client_name: 'Maria Oliveira',
    client_email: 'maria.oliveira@exemplo.com',
  },
  {
    id: 'pur_003',
    client: 'usr_carlos',
    cpf: '345.678.901-22',
    api_sale_id: 'SALE-001',
    total_amount: 320.5,
    purchase_date: '2026-07-19T10:15:00.000Z',
    origin_channel: 'Posto Avenida',
    status: 'pending',
    sync_date: '2026-07-19T10:16:00.000Z',
    created: '2026-07-19T10:15:00.000Z',
    updated: '2026-07-19T10:15:00.000Z',
    client_name: 'Carlos Eduardo Santos',
    client_email: 'carlos.santos@exemplo.com',
  },
  {
    id: 'pur_004',
    client: 'usr_diego',
    cpf: '123.456.789-00',
    api_sale_id: 'SALE-004',
    total_amount: 250.0,
    purchase_date: '2026-07-15T18:30:00.000Z',
    origin_channel: 'Posto Sul',
    status: 'approved',
    sync_date: '2026-07-15T18:31:00.000Z',
    created: '2026-07-15T18:30:00.000Z',
    updated: '2026-07-15T18:30:00.000Z',
    client_name: 'Diego Miler',
    client_email: 'diegomiler@live.com',
  },
]

const INITIAL_PURCHASE_ITEMS: MockSaleItem[] = [
  {
    id: 'item_001',
    purchase: 'pur_001',
    product_code: 'PRD-001',
    name: 'Item de Exemplo',
    quantity: 2,
    unit_price: 424.4,
    total_price: 848.8,
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T21:51:00.000Z',
  },
  {
    id: 'item_002',
    purchase: 'pur_002',
    product_code: 'ALM-102',
    name: 'Kit Pneu Aro 15 Premium',
    quantity: 1,
    unit_price: 450.0,
    total_price: 450.0,
    created: '2026-07-20T14:20:00.000Z',
    updated: '2026-07-20T14:20:00.000Z',
  },
  {
    id: 'item_003',
    purchase: 'pur_003',
    product_code: 'COMB-GAS-01',
    name: 'Gasolina Aditivada V-Power',
    quantity: 50.15,
    unit_price: 6.39,
    total_price: 320.5,
    created: '2026-07-19T10:15:00.000Z',
    updated: '2026-07-19T10:15:00.000Z',
  },
  {
    id: 'item_004',
    purchase: 'pur_004',
    product_code: 'LUB-OLEO-5W30',
    name: 'Óleo Lubrificante Sintético 5W30',
    quantity: 4,
    unit_price: 62.5,
    total_price: 250.0,
    created: '2026-07-15T18:30:00.000Z',
    updated: '2026-07-15T18:30:00.000Z',
  },
]

// Pagamentos múltiplos para SALE-003 e formas padrão
const INITIAL_PAYMENTS: MockPayment[] = [
  {
    id: 'pay_001',
    purchase: 'pur_001',
    method: 'cartao_credito',
    amount: 424.4,
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T21:51:00.000Z',
  },
  {
    id: 'pay_002',
    purchase: 'pur_001',
    method: 'dinheiro',
    amount: 424.4,
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T21:51:00.000Z',
  },
  {
    id: 'pay_003',
    purchase: 'pur_002',
    method: 'pix',
    amount: 450.0,
    created: '2026-07-20T14:20:00.000Z',
    updated: '2026-07-20T14:20:00.000Z',
  },
  {
    id: 'pay_004',
    purchase: 'pur_003',
    method: 'cartao_debito',
    amount: 320.5,
    created: '2026-07-19T10:15:00.000Z',
    updated: '2026-07-19T10:15:00.000Z',
  },
  {
    id: 'pay_005',
    purchase: 'pur_004',
    method: 'cartao_credito',
    amount: 250.0,
    created: '2026-07-15T18:30:00.000Z',
    updated: '2026-07-15T18:30:00.000Z',
  },
]

const INITIAL_CASHBACK: MockCashback[] = [
  {
    id: 'cb_001_store',
    client: 'usr_diego',
    purchase: 'pur_001',
    type: 'loja',
    amount_generated: 67.9,
    amount_available: 67.9,
    amount_used: 0,
    status: 'released',
    released_at: '2026-07-21T22:00:00.000Z',
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T22:00:00.000Z',
  },
  {
    id: 'cb_001_fuel',
    client: 'usr_diego',
    purchase: 'pur_001',
    type: 'combustivel',
    amount_generated: 16.98,
    amount_available: 16.98,
    amount_used: 0,
    status: 'released',
    released_at: '2026-07-21T22:00:00.000Z',
    created: '2026-07-21T21:51:00.000Z',
    updated: '2026-07-21T22:00:00.000Z',
  },
  {
    id: 'cb_002_store',
    client: 'usr_maria',
    purchase: 'pur_002',
    type: 'loja',
    amount_generated: 36.0,
    amount_available: 0,
    amount_used: 0,
    status: 'pending',
    created: '2026-07-20T14:20:00.000Z',
    updated: '2026-07-20T14:20:00.000Z',
  },
  {
    id: 'cb_002_fuel',
    client: 'usr_maria',
    purchase: 'pur_002',
    type: 'combustivel',
    amount_generated: 9.0,
    amount_available: 0,
    amount_used: 0,
    status: 'pending',
    created: '2026-07-20T14:20:00.000Z',
    updated: '2026-07-20T14:20:00.000Z',
  },
  {
    id: 'cb_003_store',
    client: 'usr_carlos',
    purchase: 'pur_003',
    type: 'loja',
    amount_generated: 25.64,
    amount_available: 0,
    amount_used: 0,
    status: 'pending',
    created: '2026-07-19T10:15:00.000Z',
    updated: '2026-07-19T10:15:00.000Z',
  },
  {
    id: 'cb_003_fuel',
    client: 'usr_carlos',
    purchase: 'pur_003',
    type: 'combustivel',
    amount_generated: 6.41,
    amount_available: 0,
    amount_used: 0,
    status: 'pending',
    created: '2026-07-19T10:15:00.000Z',
    updated: '2026-07-19T10:15:00.000Z',
  },
  {
    id: 'cb_004_store',
    client: 'usr_diego',
    purchase: 'pur_004',
    type: 'loja',
    amount_generated: 20.0,
    amount_available: 20.0,
    amount_used: 0,
    status: 'released',
    released_at: '2026-07-15T19:00:00.000Z',
    created: '2026-07-15T18:30:00.000Z',
    updated: '2026-07-15T19:00:00.000Z',
  },
  {
    id: 'cb_004_fuel',
    client: 'usr_diego',
    purchase: 'pur_004',
    type: 'combustivel',
    amount_generated: 5.0,
    amount_available: 5.0,
    amount_used: 0,
    status: 'released',
    released_at: '2026-07-15T19:00:00.000Z',
    created: '2026-07-15T18:30:00.000Z',
    updated: '2026-07-15T19:00:00.000Z',
  },
]

const INITIAL_PRIZES: MockPrize[] = [
  {
    id: 'prz_001',
    name: 'Vale Compras R$ 50',
    description: 'Crédito de R$ 50,00 válido em qualquer loja física parceira da rede.',
    image: 'https://img.usecurling.com/p/400/300?q=gift%20card&color=blue',
    stock: 25,
    required_amount: 50.0,
    active: true,
    campaign_end: '2026-12-31T23:59:59.000Z',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prz_002',
    name: 'Vale Combustível R$ 30',
    description: 'Abasteça R$ 30,00 de gasolina, etanol ou diesel em postos credenciados.',
    image: 'https://img.usecurling.com/p/400/300?q=gas%20station&color=yellow',
    stock: 40,
    required_amount: 30.0,
    active: true,
    campaign_end: '2026-12-31T23:59:59.000Z',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prz_003',
    name: 'Troca de Óleo Completa',
    description: 'Serviço de troca de óleo até 4 litros + filtro incluso.',
    image: 'https://img.usecurling.com/p/400/300?q=oil%20change&color=black',
    stock: 12,
    required_amount: 80.0,
    active: true,
    campaign_end: '2026-12-31T23:59:59.000Z',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prz_004',
    name: 'Kit Churrasco Premium',
    description: 'Avental térmico, tábua de madeira nobre e faca forjada artesanal.',
    image: 'https://img.usecurling.com/p/400/300?q=barbecue&color=red',
    stock: 8,
    required_amount: 120.0,
    active: true,
    campaign_end: '2026-12-31T23:59:59.000Z',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
]

const INITIAL_BANNERS: MockBanner[] = [
  {
    id: 'ban_001',
    title: 'Especial Semana de Ofertas',
    description: 'Aproveite até 8% de volta em todas as compras da loja matriz.',
    image: 'https://img.usecurling.com/p/800/300?q=shopping&color=purple',
    position: 'home_carousel',
    start_date: '2026-07-01T00:00:00.000Z',
    end_date: '2026-08-31T23:59:59.000Z',
    active: true,
    sort_order: 1,
    created: '2026-07-01T00:00:00.000Z',
    updated: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'ban_002',
    title: 'Cashback em Dobro nos Postos',
    description: 'Abasteça neste fim de semana e acumule mais benefícios para trocar por prêmios.',
    image: 'https://img.usecurling.com/p/800/300?q=gasoline&color=orange',
    position: 'home_carousel',
    start_date: '2026-07-01T00:00:00.000Z',
    end_date: '2026-08-31T23:59:59.000Z',
    active: true,
    sort_order: 2,
    created: '2026-07-01T00:00:00.000Z',
    updated: '2026-07-01T00:00:00.000Z',
  },
]

const INITIAL_PARTNERS: MockPartnerStation[] = [
  {
    id: 'pt_001',
    name: 'Posto Avenida Centro',
    address: 'Av. Brasil, 1000 - Centro',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3214-5500',
    active: true,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pt_002',
    name: 'Auto Posto Sul 24h',
    address: 'Rodovia Régis Bittencourt, km 280',
    city: 'Embu das Artes',
    state: 'SP',
    phone: '(11) 4781-9920',
    active: true,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pt_003',
    name: 'Posto Alphaville Prime',
    address: 'Al. Rio Negro, 500',
    city: 'Barueri',
    state: 'SP',
    phone: '(11) 4195-2000',
    active: true,
    created: '2026-02-15T00:00:00.000Z',
    updated: '2026-02-15T00:00:00.000Z',
  },
]

export const MockStore = {
  getUsers(): MockUser[] {
    return getStored('users', INITIAL_USERS)
  },
  saveUsers(users: MockUser[]): void {
    setStored('users', users)
  },
  getUserById(id: string): MockUser | undefined {
    return this.getUsers().find((u) => u.id === id)
  },
  getUserByEmail(email: string): MockUser | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
  },
  getUserByCpf(cpf: string): MockUser | undefined {
    const clean = cpf.replace(/\D/g, '')
    return this.getUsers().find((u) => u.cpf.replace(/\D/g, '') === clean)
  },
  getUserByPhone(phone: string): MockUser | undefined {
    let clean = phone.replace(/\D/g, '')
    if ((clean.length === 12 || clean.length === 13) && clean.startsWith('55')) {
      clean = clean.slice(2)
    }
    return this.getUsers().find((u) => {
      let uClean = (u.phone || '').replace(/\D/g, '')
      if ((uClean.length === 12 || uClean.length === 13) && uClean.startsWith('55')) {
        uClean = uClean.slice(2)
      }
      return uClean.length > 0 && uClean === clean
    })
  },
  updateUser(id: string, partial: Partial<MockUser>): MockUser {
    const users = this.getUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('Usuário não encontrado')
    users[idx] = { ...users[idx], ...partial }
    this.saveUsers(users)
    return users[idx]
  },

  getSettings(): MockSettings {
    return getStored('settings', INITIAL_SETTINGS)
  },
  saveSettings(settings: MockSettings): void {
    setStored('settings', settings)
  },

  getPurchases(): MockPurchase[] {
    return getStored('purchases', INITIAL_PURCHASES)
  },
  savePurchases(purchases: MockPurchase[]): void {
    setStored('purchases', purchases)
  },

  getPurchaseItems(): MockSaleItem[] {
    return getStored('purchase_items', INITIAL_PURCHASE_ITEMS)
  },
  savePurchaseItems(items: MockSaleItem[]): void {
    setStored('purchase_items', items)
  },

  getPayments(): MockPayment[] {
    return getStored('payments', INITIAL_PAYMENTS)
  },
  savePayments(payments: MockPayment[]): void {
    setStored('payments', payments)
  },

  getCashback(): MockCashback[] {
    return getStored('cashback', INITIAL_CASHBACK)
  },
  saveCashback(cb: MockCashback[]): void {
    setStored('cashback', cb)
  },

  getPrizes(): MockPrize[] {
    return getStored('prizes', INITIAL_PRIZES)
  },
  savePrizes(prizes: MockPrize[]): void {
    setStored('prizes', prizes)
  },

  getBanners(): MockBanner[] {
    return getStored('banners', INITIAL_BANNERS)
  },
  saveBanners(banners: MockBanner[]): void {
    setStored('banners', banners)
  },

  getPartners(): MockPartnerStation[] {
    return getStored('partners', INITIAL_PARTNERS)
  },
  savePartners(partners: MockPartnerStation[]): void {
    setStored('partners', partners)
  },

  getRedemptions(): MockRedemption[] {
    return getStored('redemptions', [])
  },
  saveRedemptions(redemptions: MockRedemption[]): void {
    setStored('redemptions', redemptions)
  },

  // Helper de subscrição local para emular eventos realtime
  subscribe(callback: (key: string) => void): () => void {
    if (typeof window === 'undefined') return () => {}
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ key: string }>
      callback(custom.detail?.key || 'all')
    }
    window.addEventListener('fidelidade_store_change', handler)
    return () => window.removeEventListener('fidelidade_store_change', handler)
  },

  reset(): void {
    if (typeof window === 'undefined') return
    const keys = [
      'users',
      'settings',
      'purchases',
      'purchase_items',
      'payments',
      'cashback',
      'prizes',
      'banners',
      'partners',
      'redemptions',
    ]
    keys.forEach((k) => localStorage.removeItem(STORAGE_PREFIX + k))
    window.dispatchEvent(new CustomEvent('fidelidade_store_change', { detail: { key: 'reset' } }))
  },
}
