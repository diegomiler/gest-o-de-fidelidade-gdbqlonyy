migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('settings')

    var fieldNames = [
      'store_percent',
      'fuel_percent',
      'min_purchase_amount',
      'min_redemption_amount',
      'min_purchase_usage',
    ]

    for (var i = 0; i < fieldNames.length; i++) {
      if (!col.fields.getByName(fieldNames[i])) {
        col.fields.add(
          new NumberField({
            name: fieldNames[i],
            min: 0,
          }),
        )
      }
    }

    app.save(col)

    var defaults = {
      store_percent: 8,
      fuel_percent: 2,
      min_purchase_amount: 100,
      min_redemption_amount: 50,
      min_purchase_usage: 500,
    }

    var rulesRecord = null
    try {
      rulesRecord = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {}

    if (rulesRecord) {
      var rawValue = rulesRecord.get('value')
      var parsed = rawValue
      if (typeof rawValue === 'string') {
        try {
          parsed = JSON.parse(rawValue)
        } catch (_) {
          parsed = {}
        }
      }
      if (typeof parsed !== 'object' || parsed === null) {
        parsed = {}
      }

      var keys = Object.keys(defaults)
      var changed = false
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j]
        var currentVal = rulesRecord.get(k)
        if (currentVal === null || currentVal === undefined || isNaN(currentVal)) {
          var fromJson = parsed[k]
          if (typeof fromJson === 'number' && !isNaN(fromJson)) {
            rulesRecord.set(k, fromJson)
          } else {
            rulesRecord.set(k, defaults[k])
          }
          changed = true
        }
      }

      if (changed) {
        app.save(rulesRecord)
      }
    } else {
      var newRecord = new Record(col)
      newRecord.set('key', 'cashback_rules')
      newRecord.set('store_percent', defaults.store_percent)
      newRecord.set('fuel_percent', defaults.fuel_percent)
      newRecord.set('min_purchase_amount', defaults.min_purchase_amount)
      newRecord.set('min_redemption_amount', defaults.min_redemption_amount)
      newRecord.set('min_purchase_usage', defaults.min_purchase_usage)
      newRecord.set('value', defaults)
      app.save(newRecord)
    }

    console.log('Migration 0034: settings collection refactored with numeric columns')
  },
  (app) => {
    var col = app.findCollectionByNameOrId('settings')
    var fieldNames = [
      'store_percent',
      'fuel_percent',
      'min_purchase_amount',
      'min_redemption_amount',
      'min_purchase_usage',
    ]
    for (var i = 0; i < fieldNames.length; i++) {
      var field = col.fields.getByName(fieldNames[i])
      if (field) {
        col.fields.remove(field)
      }
    }
    app.save(col)
    console.log('Migration 0034: down — numeric columns removed from settings')
  },
)
