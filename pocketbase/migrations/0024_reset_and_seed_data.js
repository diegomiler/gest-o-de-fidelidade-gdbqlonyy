migrate(
  (app) => {
    var cols = ['cashback', 'redemptions', 'purchases', 'banners', 'partner_stations', 'prizes']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }

    var otherUsers = app.findRecordsByFilter(
      '_pb_users_auth_',
      "email != 'diegomiler@live.com'",
      '',
      0,
      0,
    )
    for (var u = 0; u < otherUsers.length; u++) {
      try {
        app.delete(otherUsers[u])
      } catch (_) {}
    }

    var adminId
    try {
      var admin = app.findAuthRecordByEmail('_pb_users_auth_', 'diegomiler@live.com')
      admin.set('name', 'Diego Miler')
      admin.set('cpf', '123.456.789-00')
      admin.set('phone', '(48) 99999-9999')
      admin.set('status', true)
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      app.save(admin)
      adminId = admin.id
    } catch (_) {
      var uCol0 = app.findCollectionByNameOrId('_pb_users_auth_')
      var nr = new Record(uCol0)
      nr.setEmail('diegomiler@live.com')
      nr.setPassword('Skip@Pass')
      nr.setVerified(true)
      nr.set('name', 'Diego Miler')
      nr.set('cpf', '123.456.789-00')
      nr.set('phone', '(48) 99999-9999')
      nr.set('status', true)
      app.save(nr)
      adminId = nr.id
    }

    var uCol = app.findCollectionByNameOrId('_pb_users_auth_')
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
    var userIds = [adminId]
    for (var k = 0; k < mockUsers.length; k++) {
      var mu = mockUsers[k]
      var uid
      try {
        uid = app.findAuthRecordByEmail('_pb_users_auth_', mu.email).id
      } catch (_) {
        var ur = new Record(uCol)
        ur.setEmail(mu.email)
        ur.setPassword('Skip@Pass')
        ur.setVerified(true)
        ur.set('name', mu.name)
        ur.set('cpf', mu.cpf)
        ur.set('phone', mu.phone)
        ur.set('status', true)
        app.save(ur)
        uid = ur.id
      }
      userIds.push(uid)
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
      { t: 'Promoção da Semana', d: 'Descontos imperdíveis em toda a rede esta semana!' },
      { t: 'Cashback em Dobro', d: 'Ganhe o dobro de cashback em combustíveis.' },
      { t: 'Novos Prêmios Disponíveis', d: 'Confira os novos prêmios no catálogo de recompensas.' },
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
    var pData = [
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-201',
        items: [
          { name: 'Gasolina Comum', quantity: 40, unit_price: 5.79, totalAmount: 231.6 },
          { name: 'Óleo Motor 5W30', quantity: 1, unit_price: 45, totalAmount: 45 },
        ],
        total: 276.6,
        date: '2026-07-01T10:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
      },
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-202',
        items: [{ name: 'Diesel S10', quantity: 60, unit_price: 6.19, totalAmount: 371.4 }],
        total: 371.4,
        date: '2026-07-03T14:30:00.000Z',
        status: 'approved',
        pm: 'Pix',
      },
      {
        ui: 1,
        cpf: '111.222.333-01',
        sale: 'SALE-203',
        items: [
          { name: 'Gasolina Aditivada', quantity: 30, unit_price: 5.99, totalAmount: 179.7 },
          { name: 'Refrigerante', quantity: 2, unit_price: 8.5, totalAmount: 17 },
        ],
        total: 196.7,
        date: '2026-07-04T09:15:00.000Z',
        status: 'approved',
        pm: 'Cartão de Débito',
      },
      {
        ui: 1,
        cpf: '111.222.333-01',
        sale: 'SALE-204',
        items: [{ name: 'Gasolina Comum', quantity: 25, unit_price: 5.79, totalAmount: 144.75 }],
        total: 144.75,
        date: '2026-07-05T16:00:00.000Z',
        status: 'pending',
        pm: 'Dinheiro',
      },
      {
        ui: 2,
        cpf: '111.222.333-02',
        sale: 'SALE-205',
        items: [
          { name: 'Kit Limpeza', quantity: 1, unit_price: 35, totalAmount: 35 },
          { name: 'Gasolina Comum', quantity: 20, unit_price: 5.79, totalAmount: 115.8 },
        ],
        total: 150.8,
        date: '2026-07-06T11:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
      },
      {
        ui: 2,
        cpf: '111.222.333-02',
        sale: 'SALE-206',
        items: [
          { name: 'Diesel S10', quantity: 45, unit_price: 6.19, totalAmount: 278.55 },
          { name: 'Snacks', quantity: 3, unit_price: 12, totalAmount: 36 },
        ],
        total: 314.55,
        date: '2026-07-07T13:45:00.000Z',
        status: 'approved',
        pm: 'Pix',
      },
      {
        ui: 3,
        cpf: '111.222.333-03',
        sale: 'SALE-207',
        items: [
          { name: 'Gasolina Aditivada', quantity: 35, unit_price: 5.99, totalAmount: 209.65 },
        ],
        total: 209.65,
        date: '2026-07-08T10:30:00.000Z',
        status: 'canceled',
        pm: 'Cartão de Crédito',
      },
      {
        ui: 3,
        cpf: '111.222.333-03',
        sale: 'SALE-208',
        items: [
          { name: 'Óleo Motor 5W30', quantity: 2, unit_price: 45, totalAmount: 90 },
          { name: 'Filtro de Óleo', quantity: 2, unit_price: 35, totalAmount: 70 },
        ],
        total: 160,
        date: '2026-07-09T15:20:00.000Z',
        status: 'approved',
        pm: 'Cartão de Débito',
      },
      {
        ui: 4,
        cpf: '111.222.333-04',
        sale: 'SALE-209',
        items: [
          { name: 'Gasolina Comum', quantity: 50, unit_price: 5.79, totalAmount: 289.5 },
          { name: 'Água Mineral', quantity: 5, unit_price: 4, totalAmount: 20 },
        ],
        total: 309.5,
        date: '2026-07-10T08:00:00.000Z',
        status: 'approved',
        pm: 'Pix',
      },
      {
        ui: 4,
        cpf: '111.222.333-04',
        sale: 'SALE-210',
        items: [{ name: 'Diesel S10', quantity: 55, unit_price: 6.19, totalAmount: 340.45 }],
        total: 340.45,
        date: '2026-07-11T17:30:00.000Z',
        status: 'pending',
        pm: 'Dinheiro',
      },
      {
        ui: 5,
        cpf: '111.222.333-05',
        sale: 'SALE-211',
        items: [
          { name: 'Gasolina Aditivada', quantity: 28, unit_price: 5.99, totalAmount: 167.72 },
          { name: 'Refrigerante', quantity: 4, unit_price: 8.5, totalAmount: 34 },
        ],
        total: 201.72,
        date: '2026-07-12T12:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
      },
      {
        ui: 5,
        cpf: '111.222.333-05',
        sale: 'SALE-212',
        items: [
          { name: 'Óleo Motor 5W30', quantity: 1, unit_price: 45, totalAmount: 45 },
          { name: 'Gasolina Comum', quantity: 15, unit_price: 5.79, totalAmount: 86.85 },
        ],
        total: 131.85,
        date: '2026-07-13T14:15:00.000Z',
        status: 'approved',
        pm: 'Pix',
      },
      {
        ui: 0,
        cpf: '123.456.789-00',
        sale: 'SALE-213',
        items: [
          { name: 'Gasolina Aditivada', quantity: 80, unit_price: 5.99, totalAmount: 479.2 },
          { name: 'Diesel S10', quantity: 30, unit_price: 6.19, totalAmount: 185.7 },
          { name: 'Óleo Motor 5W30', quantity: 4, unit_price: 45, totalAmount: 180 },
          { name: 'Filtro de Óleo', quantity: 1, unit_price: 3.9, totalAmount: 3.9 },
        ],
        total: 848.8,
        date: '2026-07-14T09:00:00.000Z',
        status: 'approved',
        pm: 'Cartão de Crédito',
      },
    ]

    var createdPurchases = []
    for (var pi = 0; pi < pData.length; pi++) {
      var pd = pData[pi]
      var purchase = new Record(pCol)
      purchase.set('client', userIds[pd.ui])
      purchase.set('cpf', pd.cpf)
      purchase.set('api_sale_id', pd.sale)
      purchase.set('total_amount', pd.total)
      purchase.set('purchase_date', pd.date)
      purchase.set('origin_channel', 'api')
      purchase.set('status', pd.status)
      purchase.set('sync_date', pd.date)
      purchase.set('items', pd.items)
      purchase.set('payment_method', pd.pm)
      app.save(purchase)
      createdPurchases.push({ id: purchase.id, sale: pd.sale, status: pd.status, date: pd.date })
    }

    var cbStatusMap = {
      'SALE-201': 'released',
      'SALE-202': 'released',
      'SALE-203': 'pending',
      'SALE-205': 'released',
      'SALE-206': 'used',
      'SALE-208': 'released',
      'SALE-209': 'pending',
      'SALE-211': 'used',
      'SALE-212': 'released',
      'SALE-213': 'released',
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
      if (!pInfo || pInfo.status !== 'approved') {
        try {
          app.delete(cb)
        } catch (_) {}
        continue
      }
      var desired = cbStatusMap[pInfo.sale]
      if (!desired) continue
      cb.set('status', desired)
      if (desired === 'released' || desired === 'used') {
        cb.set('released_at', pInfo.date)
      }
      if (desired === 'used') {
        var avail = cb.get('amount_available') || 0
        cb.set('amount_used', avail)
        cb.set('amount_available', 0)
      }
      app.save(cb)
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
      'Migration 0024: reset and seeded data — ' +
        userIds.length +
        ' users, ' +
        createdPurchases.length +
        ' purchases, ' +
        prizeIds.length +
        ' prizes, 3 banners, 3 stations, 3 redemptions',
    )
  },
  (app) => {
    var cols = ['cashback', 'redemptions', 'purchases', 'banners', 'partner_stations', 'prizes']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
