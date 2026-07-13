migrate(
  (app) => {
    var allPurchases = app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var updated = 0

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

      record.set('total_amount', calculatedTotal)
      app.save(record)
      updated++
    }

    console.log(
      'Migration 0021: updated ' +
        updated +
        ' purchase records with recalculated totals from items',
    )
  },
  (app) => {
    // No safe reverse — original total_amount values cannot be reconstructed
  },
)
