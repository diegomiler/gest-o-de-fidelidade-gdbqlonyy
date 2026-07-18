routerAdd(
  'GET',
  '/backend/v1/admin/sales',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var cashbackByPurchase = {}
    var allCashback = $app.findRecordsByFilter('cashback', '', '-created', 0, 0)
    for (var ci = 0; ci < allCashback.length; ci++) {
      var cb = allCashback[ci]
      var cbPid = cb.getString('purchase')
      if (!cbPid) continue
      if (!cashbackByPurchase[cbPid]) {
        cashbackByPurchase[cbPid] = { store: 0, fuel: 0, records: [] }
      }
      var amount = cb.get('amount_generated') || 0
      if (cb.getString('type') === 'loja') {
        cashbackByPurchase[cbPid].store += amount
      } else if (cb.getString('type') === 'combustivel') {
        cashbackByPurchase[cbPid].fuel += amount
      }
      cashbackByPurchase[cbPid].records.push({
        id: cb.id,
        type: cb.getString('type'),
        status: cb.getString('status'),
        amount_generated: amount,
      })
    }

    var itemsByPurchase = {}
    var allItems = $app.findRecordsByFilter('purchase_items', '', 'created', 0, 0)
    for (var ii = 0; ii < allItems.length; ii++) {
      var pItem = allItems[ii]
      var iPid = pItem.getString('purchase')
      if (!iPid) continue
      if (!itemsByPurchase[iPid]) itemsByPurchase[iPid] = []
      itemsByPurchase[iPid].push({
        id: pItem.id,
        product_code: pItem.getString('product_code') || '',
        name: pItem.getString('name') || '',
        quantity: pItem.get('quantity') || 0,
        unit_price: pItem.get('unit_price') || 0,
        total_price: pItem.get('total_price') || 0,
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
        cashback_records: cbInfo.records,
        items: itemsByPurchase[pid] || [],
      })
    }

    return e.json(200, { sales: sales })
  },
  $apis.requireAuth(),
)
