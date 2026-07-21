onRecordAfterCreateSuccess((e) => {
  var purchase = e.record
  var purchaseId = purchase.id

  var importOrigin = (purchase.getString('origin_channel') || '').toLowerCase()
  if (importOrigin === 'import') return e.next()

  var items = []
  try {
    items = $app.findRecordsByFilter('purchase_items', "purchase = '" + purchaseId + "'", '', 0, 0)
  } catch (_) {}

  var totalAmount = 0
  if (items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      totalAmount += (items[i].get('quantity') || 0) * (items[i].get('unit_price') || 0)
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
  var configFound = false

  try {
    var setting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    var sp = setting.get('store_percent')
    var fp = setting.get('fuel_percent')
    var mpa = setting.get('min_purchase_amount')
    if (sp !== null && sp !== undefined && !isNaN(sp)) storePercent = sp
    if (fp !== null && fp !== undefined && !isNaN(fp)) fuelPercent = fp
    if (mpa !== null && mpa !== undefined && !isNaN(mpa)) minPurchaseAmount = mpa
    configFound = true
  } catch (err) {
    $app
      .logger()
      .error(
        'cashback rules not found in settings — aborting cashback generation',
        'error',
        err.message,
      )
  }

  if (!configFound) return e.next()

  if ((!storePercent || storePercent <= 0) && (!fuelPercent || fuelPercent <= 0)) {
    $app
      .logger()
      .error(
        'store_percent and fuel_percent are both missing or zero — aborting cashback generation',
        'purchaseId',
        purchaseId,
      )
    return e.next()
  }

  if (totalAmount < minPurchaseAmount) return e.next()

  var originChannel = (purchase.getString('origin_channel') || '').toLowerCase()
  var fuelKeywords = [
    'combustivel',
    'combustível',
    'fuel',
    'gasolina',
    'gas',
    'diesel',
    'etanol',
    'alcool',
    'álcool',
    'gnv',
    'posto',
  ]
  var isFuel = false
  for (var fk = 0; fk < fuelKeywords.length; fk++) {
    if (originChannel.indexOf(fuelKeywords[fk]) !== -1) {
      isFuel = true
      break
    }
  }
  if (!isFuel) {
    for (var fi = 0; fi < items.length; fi++) {
      var itemText = (
        (items[fi].get('name') || '') +
        ' ' +
        (items[fi].get('product_code') || '')
      ).toLowerCase()
      for (var fk2 = 0; fk2 < fuelKeywords.length; fk2++) {
        if (itemText.indexOf(fuelKeywords[fk2]) !== -1) {
          isFuel = true
          break
        }
      }
      if (isFuel) break
    }
  }

  var cashbackType = isFuel ? 'combustivel' : 'loja'
  var cashbackPercent = isFuel ? fuelPercent : storePercent
  var cashbackAmount = totalAmount * (cashbackPercent / 100)

  if (cashbackAmount <= 0) return e.next()

  var clientId = purchase.getString('client')
  if (!clientId) return e.next()

  var existingCb = $app.findRecordsByFilter('cashback', "purchase = '" + purchaseId + "'", '', 1, 0)
  if (existingCb.length > 0) return e.next()

  try {
    var cashbackCol = $app.findCollectionByNameOrId('cashback')
    var record = new Record(cashbackCol)
    record.set('client', clientId)
    record.set('purchase', purchaseId)
    record.set('type', cashbackType)
    record.set('amount_generated', cashbackAmount)
    record.set('amount_available', 0)
    record.set('amount_used', 0)
    record.set('status', 'pending')
    $app.save(record)
  } catch (err) {
    $app
      .logger()
      .error('cashback generation failed', 'purchaseId', purchaseId, 'error', err.message)
  }

  return e.next()
}, 'purchases')
