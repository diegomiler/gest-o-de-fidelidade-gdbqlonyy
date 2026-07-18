routerAdd(
  'GET',
  '/backend/v1/admin/sales',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var cashbackByPurchase = {}
    var allCashback = $app.findRecordsByFilter('cashback', '', '-created', 0, 0)
    for (var ci = 0; ci < allCashback.length; ci++) {
      var cb = allCashback[ci]
      var pid = cb.getString('purchase')
      if (!pid) continue
      if (!cashbackByPurchase[pid]) {
        cashbackByPurchase[pid] = { store: 0, fuel: 0, records: [] }
      }
      var amount = cb.get('amount_generated') || 0
      if (cb.getString('type') === 'loja') {
        cashbackByPurchase[pid].store += amount
      } else if (cb.getString('type') === 'combustivel') {
        cashbackByPurchase[pid].fuel += amount
      }
      cashbackByPurchase[pid].records.push({
        id: cb.id,
        type: cb.getString('type'),
        status: cb.getString('status'),
        amount_generated: amount,
      })
    }

    var sales = []
    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      var clientId = p.getString('client')

      var clientName = ''
      var clientCpf = ''
      if (clientId) {
        try {
          var user = $app.findRecordById('users', clientId)
          clientName = user.getString('name') || ''
          clientCpf = user.getString('cpf') || ''
        } catch (_) {}
      }

      var pid = p.id
      var cbInfo = cashbackByPurchase[pid] || { store: 0, fuel: 0, records: [] }

      sales.push({
        id: p.id,
        api_sale_id: p.getString('api_sale_id') || '',
        date: p.getString('purchase_date') || p.getString('created') || '',
        client_name: clientName,
        client_cpf: clientCpf,
        total_amount: p.get('total_amount') || 0,
        cb_store: cbInfo.store,
        cb_fuel: cbInfo.fuel,
        status: p.getString('status') || 'pending',
      })
    }

    return e.json(200, { sales: sales })
  },
  $apis.requireAuth(),
)
