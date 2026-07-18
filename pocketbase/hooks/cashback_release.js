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

    record.set('status', 'released')
    record.set('released_at', new Date().toISOString())
    $app.save(record)

    return e.json(200, {
      success: true,
      id: cashbackId,
      status: 'released',
      released_at: record.getString('released_at'),
    })
  },
  $apis.requireAuth(),
)
