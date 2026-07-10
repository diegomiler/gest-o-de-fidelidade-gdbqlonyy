migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('settings')

    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var raw = record.getString('value')
      var parsed = raw ? JSON.parse(raw) : {}

      if (parsed.min_redemption_amount === undefined || parsed.min_redemption_amount === null) {
        parsed.min_redemption_amount = 10
        record.set('value', JSON.stringify(parsed))
        app.save(record)
      }
    } catch (_) {
      var newRecord = new Record(col)
      newRecord.set('key', 'cashback_rules')
      newRecord.set(
        'value',
        JSON.stringify({
          min_purchase_amount: 0,
          store_percent: 10,
          fuel_percent: 2,
          min_redemption_amount: 10,
        }),
      )
      app.save(newRecord)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var raw = record.getString('value')
      var parsed = raw ? JSON.parse(raw) : {}
      delete parsed.min_redemption_amount
      record.set('value', JSON.stringify(parsed))
      app.save(record)
    } catch (_) {}
  },
)
