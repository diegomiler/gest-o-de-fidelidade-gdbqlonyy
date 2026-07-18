onRecordAfterCreateSuccess((e) => {
  var purchase = e.record
  var totalAmount = purchase.get('total_amount') || 0

  var storePercent = 10
  var fuelPercent = 2
  var minPurchaseAmount = 0

  try {
    var setting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    var rawValue = setting.get('value')
    var config = rawValue
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    if (config) {
      if (typeof config.store_percent === 'number') storePercent = config.store_percent
      if (typeof config.fuel_percent === 'number') fuelPercent = config.fuel_percent
      if (typeof config.min_purchase_amount === 'number')
        minPurchaseAmount = config.min_purchase_amount
    }
  } catch (err) {
    $app.logger().warn('cashback rules not found, using defaults', 'error', err.message)
  }

  if (totalAmount < minPurchaseAmount) return e.next()

  var storeCashback = totalAmount * (storePercent / 100)
  var fuelCashback = totalAmount * (fuelPercent / 100)

  if (storeCashback <= 0 && fuelCashback <= 0) return e.next()

  var dateStr = purchase.getString('purchase_date') || purchase.getString('created') || ''
  var purchaseDate = new Date(dateStr)
  var releasedAt = new Date(
    Date.UTC(purchaseDate.getUTCFullYear(), purchaseDate.getUTCMonth() + 1, 1),
  )

  var clientId = purchase.getString('client')
  if (!clientId) return e.next()

  var existingCb = $app.findRecordsByFilter(
    'cashback',
    "purchase = '" + purchase.id + "'",
    '',
    1,
    0,
  )
  if (existingCb.length > 0) return e.next()

  try {
    var cashbackCol = $app.findCollectionByNameOrId('cashback')

    if (storeCashback > 0) {
      var storeRecord = new Record(cashbackCol)
      storeRecord.set('client', clientId)
      storeRecord.set('purchase', purchase.id)
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
      fuelRecord.set('purchase', purchase.id)
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
      .error('cashback generation failed', 'purchaseId', purchase.id, 'error', err.message)
  }

  return e.next()
}, 'purchases')
