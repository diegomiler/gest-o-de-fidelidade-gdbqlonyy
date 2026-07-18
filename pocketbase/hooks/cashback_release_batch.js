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

    for (var i = 0; i < ids.length; i++) {
      try {
        var record = $app.findRecordById('cashback', ids[i])
        if (record.getString('status') === 'pending') {
          record.set('status', 'released')
          record.set('released_at', now)
          $app.save(record)
          released.push(ids[i])
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
