routerAdd(
  'GET',
  '/backend/v1/admin/customers',
  (e) => {
    var users = $app.findRecordsByFilter('users', '1=1', '-created', 0, 0)

    var customers = []
    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      var purchaseCount = 0
      var totalSpent = 0
      var cashbackTotal = 0

      try {
        var purchases = $app.findRecordsByFilter('purchases', "client = '" + u.id + "'", '', 0, 0)
        purchaseCount = purchases.length
        for (var j = 0; j < purchases.length; j++) {
          totalSpent += purchases[j].get('total_amount') || 0
        }
      } catch (_) {}

      var cashbackStore = 0
      var cashbackFuel = 0

      try {
        var cbs = $app.findRecordsByFilter(
          'cashback',
          "client = '" + u.id + "' && status = 'released'",
          '',
          0,
          0,
        )
        for (var k = 0; k < cbs.length; k++) {
          var cbType = cbs[k].getString('type') || ''
          var cbAmount = cbs[k].get('amount_available') || 0
          cashbackTotal += cbAmount
          if (cbType === 'loja') {
            cashbackStore += cbAmount
          } else if (cbType === 'combustivel') {
            cashbackFuel += cbAmount
          }
        }
      } catch (_) {}

      customers.push({
        id: u.id,
        name: u.getString('name') || '',
        email: u.getString('email') || '',
        cpf: u.getString('cpf') || '',
        phone: u.getString('phone') || '',
        avatar: u.getString('avatar') || '',
        status: u.get('status'),
        created: u.getString('created'),
        purchaseCount: purchaseCount,
        totalSpent: totalSpent,
        cashbackTotal: cashbackTotal,
        cashbackStore: cashbackStore,
        cashbackFuel: cashbackFuel,
      })
    }

    return e.json(200, { customers: customers })
  },
  $apis.requireAuth(),
)
