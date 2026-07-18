migrate(
  (app) => {
    var cols = [
      'redemptions',
      'cashback',
      'purchase_items',
      'purchases',
      'banners',
      'partner_stations',
      'prizes',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }

    var otherUsers = app.findRecordsByFilter(
      '_pb_users_auth_',
      "email != 'diegomiler@live.com'",
      '',
      0,
      0,
    )
    for (var u = 0; u < otherUsers.length; u++) {
      try {
        app.delete(otherUsers[u])
      } catch (_) {}
    }

    try {
      var admin = app.findAuthRecordByEmail('_pb_users_auth_', 'diegomiler@live.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('status', true)
      app.save(admin)
    } catch (_) {
      var uCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var nr = new Record(uCol)
      nr.setEmail('diegomiler@live.com')
      nr.setPassword('Skip@Pass')
      nr.setVerified(true)
      nr.set('name', 'Diego Miler')
      nr.set('cpf', '123.456.789-00')
      nr.set('phone', '(48) 99999-9999')
      nr.set('status', true)
      app.save(nr)
    }

    console.log('Migration 0033: database reset complete — all operational collections cleared')
  },
  (app) => {
    console.log(
      'Migration 0033: down — no automatic restore; re-run seed migrations to repopulate data',
    )
  },
)
