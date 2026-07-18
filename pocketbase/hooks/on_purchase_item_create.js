onRecordCreate((e) => {
  var qty = e.record.get('quantity') || 0
  var price = e.record.get('unit_price') || 0
  e.record.set('total_price', qty * price)
  e.next()
}, 'purchase_items')

onRecordAfterCreateSuccess((e) => {
  var purchaseId = e.record.getString('purchase')
  if (!purchaseId) return e.next()

  var items = $app.findRecordsByFilter(
    'purchase_items',
    "purchase = '" + purchaseId + "'",
    '',
    0,
    0,
  )
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total += items[i].get('total_price') || 0
  }

  var purchase = $app.findRecordById('purchases', purchaseId)
  purchase.set('total_amount', total)
  $app.save(purchase)

  if (total <= 0) return e.next()

  var existingCb = $app.findRecordsByFilter('cashback', "purchase = '" + purchaseId + "'", '', 0, 0)

  var storePercent = 10
  var fuelPercent = 2
  var minPurchaseAmount = 0
  try {
    var setting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    var rawValue = setting.get('value')
    var config = rawValue
    if (typeof config === 'string') config = JSON.parse(config)
    if (config) {
      if (typeof config.store_percent === 'number') storePercent = config.store_percent
      if (typeof config.fuel_percent === 'number') fuelPercent = config.fuel_percent
      if (typeof config.min_purchase_amount === 'number')
        minPurchaseAmount = config.min_purchase_amount
    }
  } catch (err) {
    $app.logger().warn('cashback rules not found, using defaults', 'error', err.message)
  }

  if (total < minPurchaseAmount) return e.next()

  var storeCashback = total * (storePercent / 100)
  var fuelCashback = total * (fuelPercent / 100)
  var clientId = purchase.getString('client')
  if (!clientId) return e.next()

  if (existingCb.length === 0) {
    var dateStr = purchase.getString('purchase_date') || purchase.getString('created') || ''
    var purchaseDate = new Date(dateStr)
    var releasedAt = new Date(
      Date.UTC(purchaseDate.getUTCFullYear(), purchaseDate.getUTCMonth() + 1, 1),
    )

    try {
      var cashbackCol = $app.findCollectionByNameOrId('cashback')
      if (storeCashback > 0) {
        var storeRecord = new Record(cashbackCol)
        storeRecord.set('client', clientId)
        storeRecord.set('purchase', purchaseId)
        storeRecord.set('type', 'loja')
        storeRecord.set('amount_generated', storeCashback)
        storeRecord.set('amount_available', storeCashback)
        storeRecord.set('amount_used', 0)
        storeRecord.set('status', 'pending')
        storeRecord.set('released_at', releasedAt.toISOString())
        $app.save(storeRecord)
      }
      if (fuelCashback > 0) {
        var fuelRecord = new Record(cashbackCol)
        fuelRecord.set('client', clientId)
        fuelRecord.set('purchase', purchaseId)
        fuelRecord.set('type', 'combustivel')
        fuelRecord.set('amount_generated', fuelCashback)
        fuelRecord.set('amount_available', fuelCashback)
        fuelRecord.set('amount_used', 0)
        fuelRecord.set('status', 'pending')
        fuelRecord.set('released_at', releasedAt.toISOString())
        $app.save(fuelRecord)
      }
    } catch (err) {
      $app
        .logger()
        .error('cashback generation failed', 'purchaseId', purchaseId, 'error', err.message)
    }
  } else {
    for (var ci = 0; ci < existingCb.length; ci++) {
      var cb = existingCb[ci]
      if (cb.getString('status') !== 'pending') continue
      var cbType = cb.getString('type')
      var newAmount = 0
      if (cbType === 'loja') newAmount = storeCashback
      else if (cbType === 'combustivel') newAmount = fuelCashback
      var usedAmount = cb.get('amount_used') || 0
      cb.set('amount_generated', newAmount)
      cb.set('amount_available', newAmount - usedAmount)
      $app.save(cb)
    }
  }

  return e.next()
}, 'purchase_items')
