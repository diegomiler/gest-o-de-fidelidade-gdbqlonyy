routerAdd(
  'POST',
  '/backend/v1/cashback/release-batch',
  (e) => {
    const body = e.requestInfo().body || {}
    var ids = body.cashback_ids || body.ids || []
    if (!Array.isArray(ids) || ids.length === 0) {
      return e.badRequestError('cashback_ids array is required')
    }

    var released = []
    var skipped = []
    var now = new Date().toISOString()
    var updatedPurchases = {}

    for (var i = 0; i < ids.length; i++) {
      try {
        var record = $app.findRecordById('cashback', ids[i])
        if (record.getString('status') === 'pending') {
          var amountGenerated = record.get('amount_generated') || 0
          var amountUsed = record.get('amount_used') || 0
          record.set('status', 'released')
          record.set('released_at', now)
          record.set('amount_available', amountGenerated - amountUsed)
          $app.save(record)
          released.push(ids[i])

          var purchaseId = record.getString('purchase')
          if (purchaseId && !updatedPurchases[purchaseId]) {
            updatedPurchases[purchaseId] = true
            try {
              var purchase = $app.findRecordById('purchases', purchaseId)
              if (purchase.getString('status') !== 'approved') {
                purchase.set('status', 'approved')
                $app.save(purchase)
              }
            } catch (pErr) {
              $app
                .logger()
                .error(
                  'failed to update purchase status in batch release',
                  'purchaseId',
                  purchaseId,
                  'error',
                  pErr.message,
                )
            }
          }
        } else {
          skipped.push({ id: ids[i], reason: 'not pending' })
        }
      } catch (_) {
        skipped.push({ id: ids[i], reason: 'not found' })
      }
    }

    return e.json(200, {
      success: true,
      released: released,
      skipped: skipped,
    })
  },
  $apis.requireAuth(),
)
