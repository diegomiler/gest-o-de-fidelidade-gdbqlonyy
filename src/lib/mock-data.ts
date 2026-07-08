export const mockUser = {
  id: 'usr_1',
  name: 'Maria Oliveira',
  cpf: '123.456.789-00',
  balance: {
    store: 450.0,
    fuel: 120.0,
    pendingStore: 45.0,
    pendingFuel: 10.0,
  },
}

export const mockTransactions = [
  {
    id: '1',
    date: '2026-06-28',
    store: 'Loja Centro',
    value: 250.0,
    cashbackStore: 25.0,
    cashbackFuel: 5.0,
    status: 'disponível',
  },
  {
    id: '2',
    date: '2026-07-02',
    store: 'Posto Avenida',
    value: 150.0,
    cashbackStore: 15.0,
    cashbackFuel: 3.0,
    status: 'pendente',
  },
  {
    id: '3',
    date: '2026-05-15',
    store: 'Loja Norte',
    value: 120.0,
    cashbackStore: 12.0,
    cashbackFuel: 2.4,
    status: 'utilizado',
  },
  {
    id: '4',
    date: '2026-04-10',
    store: 'Posto Sul',
    value: 100.0,
    cashbackStore: 10.0,
    cashbackFuel: 2.0,
    status: 'expirado',
  },
]

export const mockRewards = [
  {
    id: '1',
    title: 'Vale Compras R$ 50',
    type: 'store',
    cost: 50.0,
    image: 'https://img.usecurling.com/p/400/300?q=gift%20card&color=blue',
    inventory: 15,
  },
  {
    id: '2',
    title: 'Vale Combustível R$ 30',
    type: 'fuel',
    cost: 30.0,
    image: 'https://img.usecurling.com/p/400/300?q=gas%20station&color=yellow',
    inventory: 50,
  },
  {
    id: '3',
    title: 'Kit Churrasco',
    type: 'product',
    cost: 150.0,
    image: 'https://img.usecurling.com/p/400/300?q=barbecue&color=red',
    inventory: 5,
  },
  {
    id: '4',
    title: 'Desconto Troca de Óleo',
    type: 'service',
    cost: 80.0,
    image: 'https://img.usecurling.com/p/400/300?q=oil%20change&color=black',
    inventory: 8,
  },
]

export const mockBanners = [
  {
    id: '1',
    title: 'Especial Mês do Consumidor',
    image: 'https://img.usecurling.com/p/800/300?q=shopping&color=purple',
    active: true,
    ctr: '4.5%',
  },
  {
    id: '2',
    title: 'Dobro de Cashback no Posto',
    image: 'https://img.usecurling.com/p/800/300?q=gasoline&color=orange',
    active: true,
    ctr: '6.2%',
  },
]

export const mockSales = [
  {
    id: 'SALE-101',
    date: '2026-07-08T10:30:00Z',
    customer: 'Maria Oliveira',
    cpf: '123.***.***-00',
    amount: 150.0,
    cbStore: 15.0,
    cbFuel: 3.0,
    status: 'Processado',
  },
  {
    id: 'SALE-102',
    date: '2026-07-08T11:15:00Z',
    customer: 'João Silva',
    cpf: '987.***.***-11',
    amount: 80.0,
    cbStore: 0,
    cbFuel: 0,
    status: 'Sem Cashback (<R$100)',
  },
]

export const mockPartners = [
  {
    id: 'P1',
    name: 'Posto Avenida',
    address: 'Av. Brasil, 1000',
    active: true,
    logo: 'https://img.usecurling.com/i?q=gas&color=azure',
  },
  {
    id: 'P2',
    name: 'Posto Sul',
    address: 'Rodovia SC 401, km 5',
    active: true,
    logo: 'https://img.usecurling.com/i?q=station&color=rose',
  },
]
