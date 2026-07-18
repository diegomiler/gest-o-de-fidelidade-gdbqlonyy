onRecordAfterDeleteSuccess((e) => {
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

  try {
    var purchase = $app.findRecordById('purchases', purchaseId)
    purchase.set('total_amount', total)
    $app.save(purchase)
  } catch (err) {
    $app
      .logger()
      .error(
        'failed to update purchase total after delete',
        'purchaseId',
        purchaseId,
        'error',
        err.message,
      )
  }

  return e.next()
}, 'purchase_items')
