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
    total += (items[i].get('quantity') || 0) * (items[i].get('unit_price') || 0)
  }

  var purchase = $app.findRecordById('purchases', purchaseId)
  purchase.set('total_amount', total)
  $app.save(purchase)

  var importOrigin = (purchase.getString('origin_channel') || '').toLowerCase()
  if (importOrigin === 'import') return e.next()

  if (total <= 0) return e.next()

  var storePercent = 0
  var fuelPercent = 0
  var minPurchaseAmount = 0
  var usingDefaults = true
  try {
    var setting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    usingDefaults = false
    var sp = setting.get('store_percent')
    var fp = setting.get('fuel_percent')
    var mpa = setting.get('min_purchase_amount')
    if (sp !== null && sp !== undefined && !isNaN(sp)) storePercent = sp
    if (fp !== null && fp !== undefined && !isNaN(fp)) fuelPercent = fp
    if (mpa !== null && mpa !== undefined && !isNaN(mpa)) minPurchaseAmount = mpa
  } catch (err) {
    $app
      .logger()
      .warn('cashback rules not found in settings, using 0% defaults', 'error', err.message)
  }

  if (total < minPurchaseAmount) return e.next()

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
  var cashbackAmount = total * (cashbackPercent / 100)

  var clientId = purchase.getString('client')
  if (!clientId) return e.next()

  var existingCb = $app.findRecordsByFilter('cashback', "purchase = '" + purchaseId + "'", '', 0, 0)

  if (existingCb.length === 0) {
    if (cashbackAmount <= 0) return e.next()
    try {
      var cashbackCol = $app.findCollectionByNameOrId('cashback')
      var noteText = usingDefaults
        ? 'Cashback calculado com valores padrão (0%) - configuracao nao encontrada'
        : ''
      var record = new Record(cashbackCol)
      record.set('client', clientId)
      record.set('purchase', purchaseId)
      record.set('type', cashbackType)
      record.set('amount_generated', cashbackAmount)
      record.set('amount_available', 0)
      record.set('amount_used', 0)
      record.set('status', 'pending')
      if (noteText) record.set('notes', noteText)
      $app.save(record)
    } catch (err) {
      $app
        .logger()
        .error('cashback generation failed', 'purchaseId', purchaseId, 'error', err.message)
    }
  } else {
    var updateNoteText = usingDefaults
      ? 'Cashback recalculado com valores padrão (0%) - configuracao nao encontrada'
      : ''
    for (var ci = 0; ci < existingCb.length; ci++) {
      var cb = existingCb[ci]
      if (cb.getString('status') !== 'pending') continue
      cb.set('type', cashbackType)
      cb.set('amount_generated', cashbackAmount)
      cb.set('amount_available', 0)
      if (updateNoteText) cb.set('notes', updateNoteText)
      $app.save(cb)
    }
  }

  return e.next()
}, 'purchase_items')
