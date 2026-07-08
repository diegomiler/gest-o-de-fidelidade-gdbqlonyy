routerAdd(
  'GET',
  '/backend/v1/admin/stats',
  (e) => {
    var purchases = $app.findRecordsByFilter('purchases', '1=1', '-created', 0, 0)
    var cashbacks = $app.findRecordsByFilter('cashback', '1=1', '-created', 0, 0)

    var totalSales = 0
    var totalCashback = 0
    var chartMap = {}
    var clientTotals = {}

    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      var amount = p.get('total_amount') || 0
      totalSales += amount

      var dateStr = (p.getString('purchase_date') || p.getString('created') || '').slice(0, 10)
      if (!chartMap[dateStr]) chartMap[dateStr] = { date: dateStr, sales: 0, cashback: 0 }
      chartMap[dateStr].sales += amount

      var clientId = p.getString('client')
      if (!clientTotals[clientId]) clientTotals[clientId] = { total: 0, count: 0 }
      clientTotals[clientId].total += amount
      clientTotals[clientId].count++
    }

    for (var j = 0; j < cashbacks.length; j++) {
      var cb = cashbacks[j]
      var cbAmount = cb.get('amount_generated') || 0
      totalCashback += cbAmount

      var cbDate = (cb.getString('created') || '').slice(0, 10)
      if (!chartMap[cbDate]) chartMap[cbDate] = { date: cbDate, sales: 0, cashback: 0 }
      chartMap[cbDate].cashback += cbAmount
    }

    var chartData = []
    var keys = Object.keys(chartMap).sort()
    for (var k = 0; k < keys.length; k++) {
      chartData.push(chartMap[keys[k]])
    }

    var redemptionCount = $app.countRecords('redemptions')
    var userCount = $app.countRecords('users')

    var topClients = []
    var clientIds = Object.keys(clientTotals)
    clientIds.sort(function (a, b) {
      return clientTotals[b].total - clientTotals[a].total
    })
    for (var m = 0; m < Math.min(clientIds.length, 5); m++) {
      var cId = clientIds[m]
      var name = 'Desconhecido'
      try {
        var user = $app.findRecordById('users', cId)
        name = user.getString('name') || 'Desconhecido'
      } catch (_) {}
      topClients.push({
        name: name,
        total: clientTotals[cId].total,
        purchases: clientTotals[cId].count,
      })
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
