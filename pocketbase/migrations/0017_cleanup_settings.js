migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('settings')

    try {
      var orphan = app.findFirstRecordByData('settings', 'key', 'cashback_min_purchase_usage')
      app.delete(orphan)
    } catch (_) {}

    var rulesRecord = null
    try {
      rulesRecord = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {}

    var defaults = {
      min_purchase_amount: 0,
      store_percent: 10,
      fuel_percent: 2,
      min_redemption_amount: 10,
      min_purchase_usage: 0,
    }

    if (rulesRecord) {
      var raw = rulesRecord.get('value')
      var parsed = raw
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw)
        } catch (_) {
          parsed = {}
        }
      }
      if (typeof parsed !== 'object' || parsed === null) {
        parsed = {}
      }
      var keys = [
        'min_purchase_amount',
        'store_percent',
        'fuel_percent',
        'min_redemption_amount',
        'min_purchase_usage',
      ]
      var changed = false
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i]
        if (typeof parsed[k] !== 'number' || isNaN(parsed[k])) {
          parsed[k] = defaults[k]
          changed = true
        }
      }
      var merged = {}
      for (var j = 0; j < keys.length; j++) {
        merged[keys[j]] = parsed[keys[j]]
      }
      rulesRecord.set('value', merged)
      app.save(rulesRecord)
    } else {
      var newRecord = new Record(col)
      newRecord.set('key', 'cashback_rules')
      newRecord.set('value', defaults)
      app.save(newRecord)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var raw = record.get('value')
      var parsed = raw
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw)
        } catch (_) {
          parsed = {}
        }
      }
      if (typeof parsed === 'object' && parsed !== null) {
        delete parsed.min_purchase_usage
        record.set('value', parsed)
        app.save(record)
      }
    } catch (_) {}
  },
)
