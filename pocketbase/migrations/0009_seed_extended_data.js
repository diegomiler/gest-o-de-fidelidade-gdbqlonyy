migrate(
  (app) => {
    var userId = (function () {
      try {
        return app.findAuthRecordByEmail('_pb_users_auth_', 'diegomiler@live.com').id
      } catch (_) {
        return null
      }
    })()

    if (!userId) return

    var prizesCol = app.findCollectionByNameOrId('prizes')

    try {
      app.findFirstRecordByData('prizes', 'name', 'Desconto Troca de Óleo')
    } catch (_) {
      var oilPrize = new Record(prizesCol)
      oilPrize.set('name', 'Desconto Troca de Óleo')
      oilPrize.set('description', 'Desconto completo para troca de óleo nos postos parceiros.')
      oilPrize.set('stock', 8)
      oilPrize.set('required_amount', 80)
      oilPrize.set('active', true)
      oilPrize.set('campaign_end', '2026-12-31T23:59:59.000Z')
      app.save(oilPrize)
    }

    var stationsCol = app.findCollectionByNameOrId('partner_stations')

    try {
      app.findFirstRecordByData('partner_stations', 'name', 'Posto Sul')
    } catch (_) {
      var station = new Record(stationsCol)
      station.set('name', 'Posto Sul')
      station.set('address', 'Rodovia SC 401, km 5')
      station.set('city', 'Florianópolis')
      station.set('state', 'SC')
      station.set('phone', '(48) 3433-5555')
      station.set('active', true)
      app.save(station)
    }

    var purchasesCol = app.findCollectionByNameOrId('purchases')

    var newPurchases = [
      {
        api_sale_id: 'SALE-103',
        total_amount: 50.0,
        date: '2026-07-05T09:00:00.000Z',
        status: 'approved',
      },
      {
        api_sale_id: 'SALE-104',
        total_amount: 350.0,
        date: '2026-07-06T16:30:00.000Z',
        status: 'approved',
      },
    ]

    for (var i = 0; i < newPurchases.length; i++) {
      var pd = newPurchases[i]
      try {
        app.findFirstRecordByData('purchases', 'api_sale_id', pd.api_sale_id)
      } catch (_) {
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
      }
    }
  },
  (app) => {
    try {
      var prize = app.findFirstRecordByData('prizes', 'name', 'Desconto Troca de Óleo')
      app.delete(prize)
    } catch (_) {}

    try {
      var station = app.findFirstRecordByData('partner_stations', 'name', 'Posto Sul')
      app.delete(station)
    } catch (_) {}

    var saleIds = ['SALE-103', 'SALE-104']
    for (var i = 0; i < saleIds.length; i++) {
      try {
        var purchase = app.findFirstRecordByData('purchases', 'api_sale_id', saleIds[i])
        app.delete(purchase)
      } catch (_) {}
    }
  },
)
