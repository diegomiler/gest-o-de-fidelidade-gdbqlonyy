migrate(
  (app) => {
    const userId = (function () {
      try {
        const existing = app.findAuthRecordByEmail('_pb_users_auth_', 'diegomiler@live.com')
        return existing.id
      } catch (_) {
        const users = app.findCollectionByNameOrId('_pb_users_auth_')
        const record = new Record(users)
        record.setEmail('diegomiler@live.com')
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', 'Diego Miler')
        record.set('cpf', '123.456.789-00')
        record.set('phone', '(48) 99999-9999')
        record.set('status', true)
        app.save(record)
        return record.id
      }
    })()

    var bannersCol = app.findCollectionByNameOrId('banners')

    var bannerData = [
      {
        title: 'Especial Mês do Consumidor',
        description: 'Promoções exclusivas em toda a rede.',
        position: 'home_top',
        sort_order: 0,
      },
      {
        title: 'Dobro de Cashback no Posto',
        description: 'Ganhe o dobro de cashback em combustíveis.',
        position: 'home_top',
        sort_order: 1,
      },
    ]

    for (var i = 0; i < bannerData.length; i++) {
      var b = bannerData[i]
      try {
        app.findFirstRecordByData('banners', 'title', b.title)
      } catch (_) {
        var record = new Record(bannersCol)
        record.set('title', b.title)
        record.set('description', b.description)
        record.set('position', b.position)
        record.set('active', true)
        record.set('sort_order', b.sort_order)
        record.set('start_date', '2026-07-01T00:00:00.000Z')
        record.set('end_date', '2026-12-31T23:59:59.000Z')
        app.save(record)
      }
    }

    var prizesCol = app.findCollectionByNameOrId('prizes')

    var prizeData = [
      {
        name: 'Vale Compras R$ 50',
        description: 'Vale compras para utilizar em qualquer loja da rede.',
        stock: 15,
        required_amount: 50,
      },
      {
        name: 'Vale Combustível R$ 30',
        description: 'Vale combustível para uso nos postos parceiros.',
        stock: 50,
        required_amount: 30,
      },
      {
        name: 'Kit Churrasco',
        description: 'Kit completo para seu churrasco de fim de semana.',
        stock: 5,
        required_amount: 150,
      },
    ]

    for (var j = 0; j < prizeData.length; j++) {
      var p = prizeData[j]
      try {
        app.findFirstRecordByData('prizes', 'name', p.name)
      } catch (_) {
        var prec = new Record(prizesCol)
        prec.set('name', p.name)
        prec.set('description', p.description)
        prec.set('stock', p.stock)
        prec.set('required_amount', p.required_amount)
        prec.set('active', true)
        prec.set('campaign_end', '2026-12-31T23:59:59.000Z')
        app.save(prec)
      }
    }

    var stationsCol = app.findCollectionByNameOrId('partner_stations')

    try {
      app.findFirstRecordByData('partner_stations', 'name', 'Posto Avenida')
    } catch (_) {
      var station = new Record(stationsCol)
      station.set('name', 'Posto Avenida')
      station.set('address', 'Av. Brasil, 1000')
      station.set('city', 'Florianópolis')
      station.set('state', 'SC')
      station.set('phone', '(48) 3333-4444')
      station.set('active', true)
      app.save(station)
    }

    var purchasesCol = app.findCollectionByNameOrId('purchases')
    var cashbackCol = app.findCollectionByNameOrId('cashback')

    var existingPurchases = app.countRecords('purchases')
    if (existingPurchases === 0) {
      var purchaseData = [
        {
          api_sale_id: 'SALE-101',
          total_amount: 250.0,
          date: '2026-06-28T14:00:00.000Z',
          status: 'approved',
        },
        {
          api_sale_id: 'SALE-102',
          total_amount: 150.0,
          date: '2026-07-02T11:15:00.000Z',
          status: 'approved',
        },
      ]

      for (var k = 0; k < purchaseData.length; k++) {
        var pd = purchaseData[k]
        var purchase = new Record(purchasesCol)
        purchase.set('client', userId)
        purchase.set('cpf', '123.456.789-00')
        purchase.set('api_sale_id', pd.api_sale_id)
        purchase.set('total_amount', pd.total_amount)
        purchase.set('purchase_date', pd.date)
        purchase.set('origin_channel', 'api')
        purchase.set('status', pd.status)
        purchase.set('sync_date', pd.date)
        app.save(purchase)

        var cbStore = new Record(cashbackCol)
        cbStore.set('client', userId)
        cbStore.set('purchase', purchase.id)
        cbStore.set('type', 'loja')
        cbStore.set('amount_generated', pd.total_amount * 0.1)
        cbStore.set('amount_available', pd.total_amount * 0.1)
        cbStore.set('amount_used', 0)
        cbStore.set('status', 'released')
        cbStore.set('released_at', pd.date)
        app.save(cbStore)

        var cbFuel = new Record(cashbackCol)
        cbFuel.set('client', userId)
        cbFuel.set('purchase', purchase.id)
        cbFuel.set('type', 'combustivel')
        cbFuel.set('amount_generated', pd.total_amount * 0.02)
        cbFuel.set('amount_available', pd.total_amount * 0.02)
        cbFuel.set('amount_used', 0)
        cbFuel.set('status', 'released')
        cbFuel.set('released_at', pd.date)
        app.save(cbFuel)
      }
    }
  },
  (app) => {
    try {
      var record = app.findAuthRecordByEmail('_pb_users_auth_', 'diegomiler@live.com')
      app.delete(record)
    } catch (_) {}

    var collections = ['cashback', 'purchases', 'partner_stations', 'prizes', 'banners']
    for (var i = 0; i < collections.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(collections[i])
        app.truncateCollection(col)
      } catch (_) {}
    }
  },
)
