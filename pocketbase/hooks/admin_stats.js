routerAdd(
  'GET',
  '/backend/v1/admin/stats',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var totalSales = 0
    var chartDataMap = {}
    var clientTotals = {}
    var clientPurchases = {}

    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      var status = p.getString('status') || ''
      var amount = p.get('total_amount') || 0
      var clientId = p.getString('client')

      if (status === 'approved') {
        totalSales += amount

        if (clientId) {
          if (!clientTotals[clientId]) clientTotals[clientId] = 0
          if (!clientPurchases[clientId]) clientPurchases[clientId] = 0
          clientTotals[clientId] += amount
          clientPurchases[clientId]++
        }
      }

      var dateStr = p.getString('purchase_date') || p.getString('created') || ''
      var dateKey = dateStr ? dateStr.substring(0, 10) : ''
      if (dateKey) {
        if (!chartDataMap[dateKey]) chartDataMap[dateKey] = { date: dateKey, sales: 0, cashback: 0 }
        chartDataMap[dateKey].sales += amount
      }
    }

    var cashbackRecords = $app.findRecordsByFilter('cashback', '', '-created', 0, 0)
    var totalCashback = 0
    for (var j = 0; j < cashbackRecords.length; j++) {
      var cb = cashbackRecords[j]
      var cbAmount = cb.get('amount_generated') || 0
      totalCashback += cbAmount

      var cbDate = cb.getString('created') || ''
      var cbDateKey = cbDate ? cbDate.substring(0, 10) : ''
      if (cbDateKey) {
        if (!chartDataMap[cbDateKey])
          chartDataMap[cbDateKey] = { date: cbDateKey, sales: 0, cashback: 0 }
        chartDataMap[cbDateKey].cashback += cbAmount
      }
    }

    var redemptionCount = 0
    try {
      redemptionCount = $app.countRecords('redemptions')
    } catch (_) {}

    var userCount = 0
    try {
      userCount = $app.countRecords('users')
    } catch (_) {}

    var chartData = []
    var dates = Object.keys(chartDataMap).sort()
    for (var k = 0; k < dates.length; k++) {
      chartData.push(chartDataMap[dates[k]])
    }

    var topClientIds = Object.keys(clientTotals)
      .sort(function (a, b) {
        return clientTotals[b] - clientTotals[a]
      })
      .slice(0, 5)

    var topClients = []
    for (var m = 0; m < topClientIds.length; m++) {
      try {
        var user = $app.findRecordById('users', topClientIds[m])
        topClients.push({
          id: user.id,
          name: user.getString('name') || 'Cliente',
          avatar: user.getString('avatar') || '',
          total: clientTotals[topClientIds[m]],
          purchases: clientPurchases[topClientIds[m]],
        })
      } catch (_) {}
    }

    return e.json(200, {
      totalSales: totalSales,
      totalCashback: totalCashback,
      redemptionCount: redemptionCount,
      userCount: userCount,
      chartData: chartData,
      topClients: topClients,
    })
  },
  $apis.requireAuth(),
)
