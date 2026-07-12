migrate(
  (app) => {
    var purchasesCol = app.findCollectionByNameOrId('purchases')
    var allPurchases = app.findRecordsByFilter('purchases', '', '-created', 0, 0)

    var updated = 0
    for (var i = 0; i < allPurchases.length; i++) {
      var record = allPurchases[i]
      var rawItems = record.get('items')
      if (!rawItems) continue

      var items = rawItems
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items)
        } catch (_) {
          continue
        }
      }

      if (!Array.isArray(items) || items.length === 0) continue

      var calculatedTotal = 0
      for (var j = 0; j < items.length; j++) {
        var item = items[j]
        if (item && typeof item.qty === 'number' && typeof item.price === 'number') {
          calculatedTotal += item.qty * item.price
        }
      }

      var currentTotal = record.get('total_amount') || 0
      if (Math.abs(calculatedTotal - currentTotal) > 0.01) {
        record.set('total_amount', calculatedTotal)
        app.save(record)
        updated++
      }
    }

    console.log('Migration 0019: updated ' + updated + ' purchase records with recalculated totals')
  },
  (app) => {
    // No safe reverse — we cannot reconstruct the original total_amount values
    // This migration only corrects data to match item sums, so reverting is a no-op
  },
)
