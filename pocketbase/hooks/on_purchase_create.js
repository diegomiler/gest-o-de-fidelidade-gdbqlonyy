onRecordAfterCreateSuccess((e) => {
  var purchase = e.record
  var purchaseId = purchase.id

  var items = []
  try {
    items = $app.findRecordsByFilter('purchase_items', "purchase = '" + purchaseId + "'", '', 0, 0)
  } catch (_) {}

  var totalAmount = 0
  if (items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      var qty = items[i].get('quantity') || 0
      var price = items[i].get('unit_price') || 0
      totalAmount += qty * price
    }
    if (totalAmount !== (purchase.get('total_amount') || 0)) {
      try {
        var p = $app.findRecordById('purchases', purchaseId)
        p.set('total_amount', totalAmount)
        $app.save(p)
      } catch (_) {}
    }
  } else {
    totalAmount = purchase.get('total_amount') || 0
  }

  var storePercent = 0
  var fuelPercent = 0
  var minPurchaseAmount = 0
  var usingDefaults = true

  try {
    var setting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    var rawValue = setting.get('value')
    var config = rawValue
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    if (config) {
      usingDefaults = false
      if (typeof config.store_percent === 'number') storePercent = config.store_percent
      if (typeof config.fuel_percent === 'number') fuelPercent = config.fuel_percent
      if (typeof config.min_purchase_amount === 'number')
        minPurchaseAmount = config.min_purchase_amount
    }
  } catch (err) {
    $app
      .logger()
      .warn('cashback rules not found in settings, using 0% defaults', 'error', err.message)
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

  var existingCb = $app.findRecordsByFilter('cashback', "purchase = '" + purchaseId + "'", '', 1, 0)
  if (existingCb.length > 0) return e.next()

  try {
    var cashbackCol = $app.findCollectionByNameOrId('cashback')
    var noteText = usingDefaults
      ? 'Cashback calculado com valores padrão (0%) - configuracao nao encontrada'
      : ''

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
      if (noteText) storeRecord.set('notes', noteText)
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
      if (noteText) fuelRecord.set('notes', noteText)
      $app.save(fuelRecord)
    }
  } catch (err) {
    $app
      .logger()
      .error('cashback generation failed', 'purchaseId', purchaseId, 'error', err.message)
  }

  return e.next()
}, 'purchases')
