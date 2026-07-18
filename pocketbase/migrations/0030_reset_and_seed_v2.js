migrate(
  (app) => {
    var cols = [
      'redemptions',
      'cashback',
      'purchase_items',
      'purchases',
      'banners',
      'partner_stations',
      'prizes',
      'settings',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }

    var allUsers = app.findRecordsByFilter('_pb_users_auth_', '', '', 0, 0)
    for (var u = 0; u < allUsers.length; u++) {
      try {
        app.delete(allUsers[u])
      } catch (_) {}
    }

    var settingsCol = app.findCollectionByNameOrId('settings')

    var cbRules = new Record(settingsCol)
    cbRules.set('key', 'cashback_rules')
    cbRules.set('value', {
      loja: 0.1,
      combustivel: 0.05,
      store_percent: 10,
      fuel_percent: 5,
      min_purchase_amount: 0,
      min_redemption_amount: 20,
      min_purchase_usage: 0,
    })
    app.save(cbRules)

    var redemptionRules = new Record(settingsCol)
    redemptionRules.set('key', 'redemption_rules')
    redemptionRules.set('value', { min_redemption_value: 20.0 })
    app.save(redemptionRules)

    var uCol = app.findCollectionByNameOrId('_pb_users_auth_')

    var admin = new Record(uCol)
    admin.setEmail('diegomiler@live.com')
    admin.setPassword('Skip@Pass')
    admin.setVerified(true)
    admin.set('name', 'Diego Miler')
    admin.set('cpf', '123.456.789-00')
    admin.set('phone', '(48) 99999-9999')
    admin.set('status', true)
    app.save(admin)

    var mockUsers = [
      {
        name: 'Ana Silva',
        cpf: '111.222.333-01',
        phone: '(48) 98888-1111',
        email: 'ana.silva@mock.com',
      },
      {
        name: 'Bruno Costa',
        cpf: '111.222.333-02',
        phone: '(48) 98888-2222',
        email: 'bruno.costa@mock.com',
      },
      {
        name: 'Carla Santos',
        cpf: '111.222.333-03',
        phone: '(48) 98888-3333',
        email: 'carla.santos@mock.com',
      },
      {
        name: 'Diego Fernandes',
        cpf: '111.222.333-04',
        phone: '(48) 98888-4444',
        email: 'diego.fernandes@mock.com',
      },
      {
        name: 'Eduarda Lima',
        cpf: '111.222.333-05',
        phone: '(48) 98888-5555',
        email: 'eduarda.lima@mock.com',
      },
    ]
    var userIds = [admin.id]
    for (var k = 0; k < mockUsers.length; k++) {
      var mu = mockUsers[k]
      var ur = new Record(uCol)
      ur.setEmail(mu.email)
      ur.setPassword('Skip@Pass')
      ur.setVerified(true)
      ur.set('name', mu.name)
      ur.set('cpf', mu.cpf)
      ur.set('phone', mu.phone)
      ur.set('status', true)
      app.save(ur)
      userIds.push(ur.id)
    }

    var prizesCol = app.findCollectionByNameOrId('prizes')
    var prizeData = [
      {
        name: 'Vale Combustível R$ 50',
        desc: 'Vale combustível para uso nos postos parceiros.',
        stock: 30,
        req: 50,
      },
      {
        name: 'Troca de Óleo',
        desc: 'Troca de óleo completa nos postos parceiros.',
        stock: 15,
        req: 80,
      },
      {
        name: 'Kit Churrasco',
        desc: 'Kit completo para seu churrasco de fim de semana.',
        stock: 10,
        req: 150,
      },
      {
        name: 'Boné Exclusivo',
        desc: 'Boné exclusivo da marca com logo bordado.',
        stock: 20,
        req: 100,
      },
      {
        name: 'Café Especial',
        desc: 'Pacote de café especial torrado na hora.',
        stock: 25,
        req: 30,
      },
    ]
    var prizeIds = []
    for (var p = 0; p < prizeData.length; p++) {
      var pr = new Record(prizesCol)
      pr.set('name', prizeData[p].name)
      pr.set('description', prizeData[p].desc)
      pr.set('stock', prizeData[p].stock)
      pr.set('required_amount', prizeData[p].req)
      pr.set('active', true)
      pr.set('campaign_end', '2026-12-31T23:59:59.000Z')
      app.save(pr)
      prizeIds.push(pr.id)
    }

    var bCol = app.findCollectionByNameOrId('banners')
    var banners = [
      {
        t: 'Bem-vindo ao Programa',
        d: 'Participe do nosso programa de fidelidade e ganhe cashback!',
      },
      { t: 'Promoção da Semana', d: 'Descontos imperdíveis em toda a rede esta semana!' },
      { t: 'Novo App Disponível', d: 'Baixe nosso app e ganhe bônus de boas-vindas!' },
    ]
    for (var b = 0; b < banners.length; b++) {
      var br = new Record(bCol)
      br.set('title', banners[b].t)
      br.set('description', banners[b].d)
      br.set('position', 'home_top')
      br.set('active', true)
      br.set('sort_order', b)
      br.set('start_date', '2026-07-01T00:00:00.000Z')
      br.set('end_date', '2026-12-31T23:59:59.000Z')
      app.save(br)
    }

    var sCol = app.findCollectionByNameOrId('partner_stations')
    var stations = [
      {
        n: 'Posto Avenida',
        a: 'Av. Brasil, 1000',
        c: 'Florianópolis',
        st: 'SC',
        p: '(48) 3333-4444',
      },
      {
        n: 'Posto Sul',
        a: 'Rodovia SC 401, km 5',
        c: 'Florianópolis',
        st: 'SC',
        p: '(48) 3433-5555',
      },
      {
        n: 'Posto Centro',
        a: 'Rua Felipe Schmidt, 200',
        c: 'São José',
        st: 'SC',
        p: '(48) 3222-6666',
      },
    ]
    for (var si = 0; si < stations.length; si++) {
      var sr = new Record(sCol)
      sr.set('name', stations[si].n)
      sr.set('address', stations[si].a)
      sr.set('city', stations[si].c)
      sr.set('state', stations[si].st)
      sr.set('phone', stations[si].p)
      sr.set('active', true)
      app.save(sr)
    }

    var pCol = app.findCollectionByNameOrId('purchases')
    var piCol = app.findCollectionByNameOrId('purchase_items')

    var pData = [
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-001',
        date: '2026-07-01T10:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
        items: [
          { n: 'Gasolina Comum', q: 40, p: 5.79 },
          { n: 'Óleo Motor 5W30', q: 1, p: 45 },
        ],
      },
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-002',
        date: '2026-07-03T14:30:00.000Z',
        status: 'approved',
        pm: 'Pix',
        items: [{ n: 'Diesel S10', q: 60, p: 6.19 }],
      },
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-003',
        date: '2026-07-14T09:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
        items: [
          { n: 'Gasolina Aditivada', q: 80, p: 5.99 },
          { n: 'Diesel S10', q: 30, p: 6.19 },
          { n: 'Óleo Motor 5W30', q: 4, p: 45 },
          { n: 'Filtro de Óleo', q: 1, p: 3.9 },
        ],
      },
      {
        ui: 1,
        cpf: '111.222.333-01',
        sale: 'SALE-004',
        date: '2026-07-04T09:15:00.000Z',
        status: 'approved',
        pm: 'Cartão de Débito',
        items: [
          { n: 'Gasolina Aditivada', q: 30, p: 5.99 },
          { n: 'Refrigerante', q: 2, p: 8.5 },
        ],
      },
      {
        ui: 1,
        cpf: '111.222.333-01',
        sale: 'SALE-005',
        date: '2026-07-05T16:00:00.000Z',
        status: 'pending',
        pm: 'Dinheiro',
        items: [{ n: 'Gasolina Comum', q: 25, p: 5.79 }],
      },
      {
        ui: 2,
        cpf: '111.222.333-02',
        sale: 'SALE-006',
        date: '2026-07-06T11:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
        items: [
          { n: 'Kit Limpeza', q: 1, p: 35 },
          { n: 'Gasolina Comum', q: 20, p: 5.79 },
        ],
      },
      {
        ui: 2,
        cpf: '111.222.333-02',
        sale: 'SALE-007',
        date: '2026-07-07T13:45:00.000Z',
        status: 'approved',
        pm: 'Pix',
        items: [
          { n: 'Diesel S10', q: 45, p: 6.19 },
          { n: 'Snacks', q: 3, p: 12 },
        ],
      },
      {
        ui: 3,
        cpf: '111.222.333-03',
        sale: 'SALE-008',
        date: '2026-07-08T10:30:00.000Z',
        status: 'canceled',
        pm: 'Cartão de Crédito',
        items: [{ n: 'Gasolina Aditivada', q: 35, p: 5.99 }],
      },
      {
        ui: 3,
        cpf: '111.222.333-03',
        sale: 'SALE-009',
        date: '2026-07-09T15:20:00.000Z',
        status: 'approved',
        pm: 'Cartão de Débito',
        items: [
          { n: 'Óleo Motor 5W30', q: 2, p: 45 },
          { n: 'Filtro de Óleo', q: 2, p: 35 },
        ],
      },
      {
        ui: 4,
        cpf: '111.222.333-04',
        sale: 'SALE-010',
        date: '2026-07-10T08:00:00.000Z',
        status: 'approved',
        pm: 'Pix',
        items: [
          { n: 'Gasolina Comum', q: 50, p: 5.79 },
          { n: 'Água Mineral', q: 5, p: 4 },
        ],
      },
      {
        ui: 4,
        cpf: '111.222.333-04',
        sale: 'SALE-011',
        date: '2026-07-11T17:30:00.000Z',
        status: 'pending',
        pm: 'Dinheiro',
        items: [{ n: 'Diesel S10', q: 55, p: 6.19 }],
      },
      {
        ui: 5,
        cpf: '111.222.333-05',
        sale: 'SALE-012',
        date: '2026-07-12T12:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
        items: [
          { n: 'Gasolina Aditivada', q: 28, p: 5.99 },
          { n: 'Refrigerante', q: 4, p: 8.5 },
        ],
      },
      {
        ui: 5,
        cpf: '111.222.333-05',
        sale: 'SALE-013',
        date: '2026-07-13T14:15:00.000Z',
        status: 'approved',
        pm: 'Pix',
        items: [
          { n: 'Óleo Motor 5W30', q: 1, p: 45 },
          { n: 'Gasolina Comum', q: 15, p: 5.79 },
        ],
      },
    ]

    var createdPurchases = []
    for (var pi = 0; pi < pData.length; pi++) {
      var pd = pData[pi]
      var purchase = new Record(pCol)
      purchase.set('client', userIds[pd.ui])
      purchase.set('cpf', pd.cpf)
      purchase.set('api_sale_id', pd.sale)
      purchase.set('total_amount', 0)
      purchase.set('purchase_date', pd.date)
      purchase.set('origin_channel', 'api')
      purchase.set('status', pd.status)
      purchase.set('sync_date', pd.date)
      purchase.set('payment_method', pd.pm)
      app.save(purchase)

      for (var ii = 0; ii < pd.items.length; ii++) {
        var it = pd.items[ii]
        var item = new Record(piCol)
        item.set('purchase', purchase.id)
        item.set('name', it.n)
        item.set('quantity', it.q)
        item.set('unit_price', it.p)
        item.set('total_price', it.q * it.p)
        app.save(item)
      }

      createdPurchases.push({ id: purchase.id, sale: pd.sale, status: pd.status, date: pd.date })
    }

    var purchaseMap = {}
    for (var cpi = 0; cpi < createdPurchases.length; cpi++) {
      purchaseMap[createdPurchases[cpi].id] = createdPurchases[cpi]
    }

    var allCashback = app.findRecordsByFilter('cashback', '', '-created', 0, 0)
    for (var ci = 0; ci < allCashback.length; ci++) {
      var cb = allCashback[ci]
      var pid = cb.getString('purchase')
      var pInfo = purchaseMap[pid]
      if (!pInfo) continue

      if (pInfo.status === 'canceled') {
        try {
          app.delete(cb)
        } catch (_) {}
        continue
      }

      if (pInfo.status === 'approved') {
        cb.set('status', 'released')
        cb.set('released_at', pInfo.date)
        app.save(cb)
      }
    }

    var rCol = app.findCollectionByNameOrId('redemptions')
    var rData = [
      { ui: 0, pi: 0, qty: 1, cost: 50, status: 'delivered', dd: '2026-07-10T00:00:00.000Z' },
      { ui: 2, pi: 2, qty: 1, cost: 150, status: 'requested', dd: '' },
      { ui: 5, pi: 1, qty: 1, cost: 80, status: 'approved', dd: '' },
    ]
    for (var ri = 0; ri < rData.length; ri++) {
      var rd = rData[ri]
      var red = new Record(rCol)
      red.set('client', userIds[rd.ui])
      red.set('prize', prizeIds[rd.pi])
      red.set('quantity', rd.qty)
      red.set('total_cost', rd.cost)
      red.set('status', rd.status)
      if (rd.dd) red.set('delivery_date', rd.dd)
      app.save(red)
    }

    console.log(
      'Migration 0030: reset and seeded v2 — ' +
        userIds.length +
        ' users, ' +
        createdPurchases.length +
        ' purchases, ' +
        prizeIds.length +
        ' prizes',
    )
  },
  (app) => {
    var cols = [
      'redemptions',
      'cashback',
      'purchase_items',
      'purchases',
      'banners',
      'partner_stations',
      'prizes',
      'settings',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
