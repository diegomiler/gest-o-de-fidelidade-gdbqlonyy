onRecordAfterDeleteSuccess((e) => {
  var purchaseId = e.record.getString('purchase')
  if (!purchaseId) return e.next()

  var items = []
  try {
    items = $app.findRecordsByFilter('purchase_items', "purchase = '" + purchaseId + "'", '', 0, 0)
  } catch (_) {}

  var total = 0
  for (var i = 0; i < items.length; i++) {
    total += (items[i].get('quantity') || 0) * (items[i].get('unit_price') || 0)
  }

  try {
    var purchase = $app.findRecordById('purchases', purchaseId)
    purchase.set('total_amount', total)
    $app.save(purchase)
  } catch (_) {}

  var existingCb = []
  try {
    existingCb = $app.findRecordsByFilter('cashback', "purchase = '" + purchaseId + "'", '', 0, 0)
  } catch (_) {}

  if (total <= 0) {
    for (var ci = 0; ci < existingCb.length; ci++) {
      var cb = existingCb[ci]
      if (cb.getString('status') !== 'pending') continue
      cb.set('amount_generated', 0)
      cb.set('amount_available', 0)
      $app.save(cb)
    }
    return e.next()
  }

  var storePercent = 0
  var fuelPercent = 0
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
    $app
      .logger()
      .warn('cashback rules not found in settings, using 0% defaults', 'error', err.message)
  }

  if (total < minPurchaseAmount) return e.next()

  var originChannel = ''
  try {
    var p2 = $app.findRecordById('purchases', purchaseId)
    originChannel = (p2.getString('origin_channel') || '').toLowerCase()
  } catch (_) {}

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
  var cashbackAmount = total * (cashbackPercent / 100)

  for (var ci2 = 0; ci2 < existingCb.length; ci2++) {
    var cb2 = existingCb[ci2]
    if (cb2.getString('status') !== 'pending') continue
    cb2.set('type', cashbackType)
    cb2.set('amount_generated', cashbackAmount)
    cb2.set('amount_available', 0)
    $app.save(cb2)
  }

  return e.next()
}, 'purchase_items')
