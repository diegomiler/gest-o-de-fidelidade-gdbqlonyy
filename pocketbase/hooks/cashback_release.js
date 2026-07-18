routerAdd(
  'POST',
  '/backend/v1/cashback/release',
  (e) => {
    const body = e.requestInfo().body || {}
    const cashbackId = body.cashback_id || body.id || ''
    if (!cashbackId) return e.badRequestError('cashback_id is required')

    var record
    try {
      record = $app.findRecordById('cashback', cashbackId)
    } catch (_) {
      return e.notFoundError('cashback record not found')
    }

    if (record.getString('status') !== 'pending') {
      return e.badRequestError(
        'cashback record is not pending (current: ' + record.getString('status') + ')',
      )
    }

    var amountGenerated = record.get('amount_generated') || 0
    var amountUsed = record.get('amount_used') || 0
    record.set('status', 'released')
    record.set('released_at', new Date().toISOString())
    record.set('amount_available', amountGenerated - amountUsed)
    $app.save(record)

    var purchaseId = record.getString('purchase')
    if (purchaseId) {
      try {
        var purchase = $app.findRecordById('purchases', purchaseId)
        if (purchase.getString('status') !== 'approved') {
          purchase.set('status', 'approved')
          $app.save(purchase)
        }
      } catch (err) {
        $app
          .logger()
          .error(
            'failed to update purchase status after cashback release',
            'cashbackId',
            cashbackId,
            'purchaseId',
            purchaseId,
            'error',
            err.message,
          )
      }
    }

    return e.json(200, {
      success: true,
      id: cashbackId,
      status: 'released',
      released_at: record.getString('released_at'),
    })
  },
  $apis.requireAuth(),
)
