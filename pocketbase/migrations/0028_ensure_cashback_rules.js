migrate(
  (app) => {
    var defaults = {
      min_purchase_amount: 0,
      store_percent: 10,
      fuel_percent: 2,
      min_redemption_amount: 10,
      min_purchase_usage: 0,
    }

    try {
      var record = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var rawValue = record.get('value')
      var config = rawValue
      if (typeof config === 'string') {
        config = JSON.parse(config)
      }
      if (!config || typeof config !== 'object') {
        config = {}
      }

      var updated = false
      var keys = Object.keys(defaults)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (typeof config[key] !== 'number') {
          config[key] = defaults[key]
          updated = true
        }
      }

      if (updated || !rawValue) {
        record.set('value', config)
        app.save(record)
      }
    } catch (_) {
      var col = app.findCollectionByNameOrId('settings')
      var newRecord = new Record(col)
      newRecord.set('key', 'cashback_rules')
      newRecord.set('value', defaults)
      app.save(newRecord)
    }
  },
  (app) => {},
)
