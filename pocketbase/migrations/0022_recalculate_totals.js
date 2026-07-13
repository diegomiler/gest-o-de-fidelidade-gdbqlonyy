migrate(
  (app) => {
    var allPurchases = app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var updated = 0
    var skipped = 0

    for (var i = 0; i < allPurchases.length; i++) {
      var record = allPurchases[i]
      var rawItems = record.get('items')

      var items = rawItems
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch (_) {
          items = null
        }
      }

      var calculatedTotal = 0
      if (Array.isArray(items) && items.length > 0) {
        for (var j = 0; j < items.length; j++) {
          var item = items[j]
          if (item && typeof item.qty === 'number' && typeof item.price === 'number') {
            calculatedTotal += item.qty * item.price
          }
        }
      }

      var currentTotal = record.get('total_amount') || 0
      if (Math.abs(calculatedTotal - currentTotal) > 0.01) {
        record.set('total_amount', calculatedTotal)
        app.save(record)
        updated++
      } else {
        skipped++
      }
    }

    console.log(
      'Migration 0022: recalculated totals — updated ' +
        updated +
        ' purchases, skipped ' +
        skipped +
        ' (already correct)',
    )
  },
  (app) => {
    // No safe reverse — original total_amount values cannot be reconstructed
  },
)
