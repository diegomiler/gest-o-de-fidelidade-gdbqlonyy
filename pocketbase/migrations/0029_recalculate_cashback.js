migrate(
  (app) => {
    var storePercent = 0
    var fuelPercent = 0
    var minPurchaseAmount = 0

    try {
      var setting = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
      var rawValue = setting.get('value')
      var config = rawValue
      if (typeof config === 'string') {
        config = JSON.parse(config)
      }
      if (config) {
        if (typeof config.store_percent === 'number') storePercent = config.store_percent
        if (typeof config.fuel_percent === 'number') fuelPercent = config.fuel_percent
        if (typeof config.min_purchase_amount === 'number')
          minPurchaseAmount = config.min_purchase_amount
      }
    } catch (err) {
      console.log('cashback rules not found in settings, using 0% defaults: ' + err.message)
    }

    var allCashback = app.findRecordsByFilter('cashback', '', '-created', 0, 0)

    var updated = 0
    var skipped = 0

    for (var i = 0; i < allCashback.length; i++) {
      var cb = allCashback[i]
      var purchaseId = cb.getString('purchase')
      var cbType = cb.getString('type')

      if (!purchaseId) {
        skipped++
        continue
      }

      var purchase = null
      try {
        purchase = app.findRecordById('purchases', purchaseId)
      } catch (_) {
        skipped++
        continue
      }

      var totalAmount = purchase.get('total_amount') || 0
      if (totalAmount < minPurchaseAmount) {
        skipped++
        continue
      }

      var percent = 0
      if (cbType === 'loja') {
        percent = storePercent
      } else if (cbType === 'combustivel') {
        percent = fuelPercent
      }

      var newAmountGenerated = totalAmount * (percent / 100)
      var amountUsed = cb.get('amount_used') || 0
      var newAmountAvailable = newAmountGenerated - amountUsed
      if (newAmountAvailable < 0) newAmountAvailable = 0

      var currentGenerated = cb.get('amount_generated') || 0
      var currentAvailable = cb.get('amount_available') || 0

      if (
        Math.abs(newAmountGenerated - currentGenerated) > 0.01 ||
        Math.abs(newAmountAvailable - currentAvailable) > 0.01
      ) {
        cb.set('amount_generated', newAmountGenerated)
        cb.set('amount_available', newAmountAvailable)
        app.save(cb)
        updated++
      } else {
        skipped++
      }
    }

    console.log(
      'Migration 0029: recalculated cashback — updated ' +
        updated +
        ' records, skipped ' +
        skipped +
        ' (already correct or no purchase)',
    )
  },
  (app) => {
    // No safe reverse — original amount_generated values cannot be reconstructed
  },
)
