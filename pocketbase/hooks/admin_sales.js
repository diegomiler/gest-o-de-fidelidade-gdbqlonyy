routerAdd(
  'GET',
  '/backend/v1/admin/sales',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '1=1', '-purchase_date', 0, 0)

    var sales = []
    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      var clientName = ''
      var clientCpf = ''

      try {
        var client = $app.findRecordById('users', p.getString('client'))
        clientName = client.getString('name') || ''
        clientCpf = client.getString('cpf') || ''
      } catch (_) {}

      var cbStore = 0
      var cbFuel = 0
      try {
        var cbs = $app.findRecordsByFilter('cashback', "purchase = '" + p.id + "'", '', 0, 0)
        for (var j = 0; j < cbs.length; j++) {
          if (cbs[j].getString('type') === 'loja') cbStore += cbs[j].get('amount_generated') || 0
          if (cbs[j].getString('type') === 'combustivel')
            cbFuel += cbs[j].get('amount_generated') || 0
        }
      } catch (_) {}

      sales.push({
        id: p.id,
        api_sale_id: p.getString('api_sale_id') || '',
        date: p.getString('purchase_date') || p.getString('created'),
        client_name: clientName,
        client_cpf: clientCpf,
        total_amount: p.get('total_amount') || 0,
        cb_store: cbStore,
        cb_fuel: cbFuel,
        status: p.getString('status') || '',
      })
    }

    return e.json(200, { sales: sales })
  },
  $apis.requireAuth(),
)
