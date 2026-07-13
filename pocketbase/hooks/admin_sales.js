routerAdd(
  'GET',
  '/backend/v1/admin/sales',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var sales = []
    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      var clientId = p.getString('client')
      var clientName = ''
      var clientCpf = ''

      try {
        var user = $app.findRecordById('users', clientId)
        clientName = user.getString('name') || ''
        clientCpf = user.getString('cpf') || ''
      } catch (_) {}

      var cbStore = 0
      var cbFuel = 0
      try {
        var cashbackRecords = $app.findRecordsByFilter(
          'cashback',
          'purchase = {:pid}',
          '',
          0,
          0,
          p.id,
        )
        for (var j = 0; j < cashbackRecords.length; j++) {
          var cb = cashbackRecords[j]
          var cbType = cb.getString('type')
          var cbAmount = cb.get('amount_generated') || 0
          if (cbType === 'loja') cbStore += cbAmount
          else if (cbType === 'combustivel') cbFuel += cbAmount
        }
      } catch (_) {}

      sales.push({
        id: p.id,
        api_sale_id: p.getString('api_sale_id') || '',
        date: p.getString('purchase_date') || p.getString('created') || '',
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
