migrate(
  (app) => {
    var purchases = app.findRecordsByFilter('purchases', '', '', 0, 0)
    for (var i = 0; i < purchases.length; i++) {
      purchases[i].set('status', 'pending')
      app.save(purchases[i])
    }

    var cashbackRecords = app.findRecordsByFilter('cashback', '', '', 0, 0)
    for (var c = 0; c < cashbackRecords.length; c++) {
      cashbackRecords[c].set('status', 'pending')
      cashbackRecords[c].set('released_at', null)
      app.save(cashbackRecords[c])
    }

    console.log(
      'Migration 0031: reset ' +
        purchases.length +
        ' purchases and ' +
        cashbackRecords.length +
        ' cashback records to pending',
    )
  },
  (app) => {
    var purchases = app.findRecordsByFilter('purchases', '', '', 0, 0)
    for (var i = 0; i < purchases.length; i++) {
      purchases[i].set('status', 'approved')
      app.save(purchases[i])
    }

    var cashbackRecords = app.findRecordsByFilter('cashback', '', '', 0, 0)
    for (var c = 0; c < cashbackRecords.length; c++) {
      cashbackRecords[c].set('status', 'released')
      cashbackRecords[c].set('released_at', cashbackRecords[c].getString('created') || '')
      app.save(cashbackRecords[c])
    }
  },
)
