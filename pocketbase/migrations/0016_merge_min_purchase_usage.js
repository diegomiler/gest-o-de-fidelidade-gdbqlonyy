migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('settings')

    var rulesRecord = null
    try {
      rulesRecord = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {}

    var usageAmount = 0
    try {
      var usageRecord = app.findFirstRecordByData('settings', 'key', 'cashback_min_purchase_usage')
      var usageRaw = usageRecord.getString('value')
      var usageParsed = usageRaw ? JSON.parse(usageRaw) : {}
      if (typeof usageParsed.amount === 'number') {
        usageAmount = usageParsed.amount
      }
    } catch (_) {}

    if (rulesRecord) {
      var raw = rulesRecord.getString('value')
      var parsed = raw ? JSON.parse(raw) : {}
      if (parsed.min_purchase_usage === undefined || parsed.min_purchase_usage === null) {
        parsed.min_purchase_usage = usageAmount
        rulesRecord.set('value', parsed)
        app.save(rulesRecord)
      }
    } else {
      var newRecord = new Record(col)
      newRecord.set('key', 'cashback_rules')
      newRecord.set('value', {
        min_purchase_amount: 0,
        store_percent: 10,
        fuel_percent: 2,
        min_redemption_amount: 10,
        min_purchase_usage: usageAmount,
      })
      app.save(newRecord)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var raw = record.getString('value')
      var parsed = raw ? JSON.parse(raw) : {}
      delete parsed.min_purchase_usage
      record.set('value', parsed)
      app.save(record)
    } catch (_) {}
  },
)
