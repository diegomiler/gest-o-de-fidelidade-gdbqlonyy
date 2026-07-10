migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('settings')

    try {
      app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {
      var record = new Record(col)
      record.set('key', 'cashback_rules')
      record.set(
        'value',
        JSON.stringify({
          min_purchase_amount: 0,
          store_percent: 10,
          fuel_percent: 2,
        }),
      )
      app.save(record)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      app.delete(record)
    } catch (_) {}
  },
)
