migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('settings')

    try {
      app.findFirstRecordByData('settings', 'key', 'cashback_min_purchase_usage')
    } catch (_) {
      var record = new Record(col)
      record.set('key', 'cashback_min_purchase_usage')
      record.set('value', JSON.stringify({ amount: 0 }))
      app.save(record)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_min_purchase_usage')
      app.delete(record)
    } catch (_) {}
  },
)
