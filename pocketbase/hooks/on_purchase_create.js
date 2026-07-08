onRecordAfterCreateSuccess((e) => {
  var purchase = e.record
  var totalAmount = purchase.get('total_amount') || 0

  var hundreds = Math.floor(totalAmount / 100)
  if (hundreds <= 0) return e.next()

  var storeCashback = hundreds * 10
  var fuelCashback = hundreds * 2

  var dateStr = purchase.getString('purchase_date') || purchase.getString('created') || ''
  var purchaseDate = new Date(dateStr)
  var releasedAt = new Date(
    Date.UTC(purchaseDate.getUTCFullYear(), purchaseDate.getUTCMonth() + 1, 1),
  )

  var clientId = purchase.getString('client')
  if (!clientId) return e.next()

  try {
    var cashbackCol = $app.findCollectionByNameOrId('cashback')

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
  } catch (err) {
    $app
      .logger()
      .error('cashback generation failed', 'purchaseId', purchase.id, 'error', err.message)
  }

  return e.next()
}, 'purchases')
