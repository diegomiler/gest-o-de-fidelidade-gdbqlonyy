migrate(
  (app) => {
    var transactionalCols = ['redemptions', 'cashback', 'purchase_items', 'purchases']
    for (var i = 0; i < transactionalCols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(transactionalCols[i]))
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
      admin.set('name', 'Diego Miler')
      admin.set('cpf', '123.456.789-00')
      admin.set('phone', '(48) 99999-9999')
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

    var settingsCol = app.findCollectionByNameOrId('settings')

    var rulesRecord = null
    try {
      rulesRecord = app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {}

    var defaults = {
      store_percent: 8,
      fuel_percent: 2,
      min_purchase_amount: 100,
      min_redemption_amount: 50,
      min_purchase_usage: 500,
    }

    if (rulesRecord) {
      rulesRecord.set('store_percent', defaults.store_percent)
      rulesRecord.set('fuel_percent', defaults.fuel_percent)
      rulesRecord.set('min_purchase_amount', defaults.min_purchase_amount)
      rulesRecord.set('min_redemption_amount', defaults.min_redemption_amount)
      rulesRecord.set('min_purchase_usage', defaults.min_purchase_usage)
      rulesRecord.set('value', defaults)
      app.save(rulesRecord)
    } else {
      var newRecord = new Record(settingsCol)
      newRecord.set('key', 'cashback_rules')
      newRecord.set('store_percent', defaults.store_percent)
      newRecord.set('fuel_percent', defaults.fuel_percent)
      newRecord.set('min_purchase_amount', defaults.min_purchase_amount)
      newRecord.set('min_redemption_amount', defaults.min_redemption_amount)
      newRecord.set('min_purchase_usage', defaults.min_purchase_usage)
      newRecord.set('value', defaults)
      app.save(newRecord)
    }

    var prizesCol = app.findCollectionByNameOrId('prizes')
    var prizeData = [
      {
        name: 'Vale Combustível R$ 50',
        desc: 'Vale combustível para uso nos postos parceiros.',
        stock: 30,
        req: 50,
      },
      {
        name: 'Troca de Óleo',
        desc: 'Troca de óleo completa nos postos parceiros.',
        stock: 15,
        req: 80,
      },
      {
        name: 'Kit Churrasco',
        desc: 'Kit completo para seu churrasco de fim de semana.',
        stock: 10,
        req: 150,
      },
      {
        name: 'Boné Exclusivo',
        desc: 'Boné exclusivo da marca com logo bordado.',
        stock: 20,
        req: 100,
      },
      {
        name: 'Café Especial',
        desc: 'Pacote de café especial torrado na hora.',
        stock: 25,
        req: 30,
      },
    ]
    for (var p = 0; p < prizeData.length; p++) {
      var prizeName = prizeData[p].name
      var prizeExists = false
      try {
        app.findFirstRecordByData('prizes', 'name', prizeName)
        prizeExists = true
      } catch (_) {}
      if (!prizeExists) {
        var pr = new Record(prizesCol)
        pr.set('name', prizeName)
        pr.set('description', prizeData[p].desc)
        pr.set('stock', prizeData[p].stock)
        pr.set('required_amount', prizeData[p].req)
        pr.set('active', true)
        pr.set('campaign_end', '2026-12-31T23:59:59.000Z')
        app.save(pr)
      }
    }

    var sCol = app.findCollectionByNameOrId('partner_stations')
    var stations = [
      {
        n: 'Posto Avenida',
        a: 'Av. Brasil, 1000',
        c: 'Florianópolis',
        st: 'SC',
        p: '(48) 3333-4444',
      },
      {
        n: 'Posto Sul',
        a: 'Rodovia SC 401, km 5',
        c: 'Florianópolis',
        st: 'SC',
        p: '(48) 3433-5555',
      },
      {
        n: 'Posto Centro',
        a: 'Rua Felipe Schmidt, 200',
        c: 'São José',
        st: 'SC',
        p: '(48) 3222-6666',
      },
    ]
    for (var si = 0; si < stations.length; si++) {
      var stationName = stations[si].n
      var stationExists = false
      try {
        app.findFirstRecordByData('partner_stations', 'name', stationName)
        stationExists = true
      } catch (_) {}
      if (!stationExists) {
        var sr = new Record(sCol)
        sr.set('name', stationName)
        sr.set('address', stations[si].a)
        sr.set('city', stations[si].c)
        sr.set('state', stations[si].st)
        sr.set('phone', stations[si].p)
        sr.set('active', true)
        app.save(sr)
      }
    }

    var bCol = app.findCollectionByNameOrId('banners')
    var banners = [
      {
        t: 'Bem-vindo ao Programa',
        d: 'Participe do nosso programa de fidelidade e ganhe cashback!',
      },
      {
        t: 'Promoção da Semana',
        d: 'Descontos imperdíveis em toda a rede esta semana!',
      },
      {
        t: 'Novo App Disponível',
        d: 'Baixe nosso app e ganhe bônus de boas-vindas!',
      },
    ]
    for (var b = 0; b < banners.length; b++) {
      var bannerTitle = banners[b].t
      var bannerExists = false
      try {
        app.findFirstRecordByData('banners', 'title', bannerTitle)
        bannerExists = true
      } catch (_) {}
      if (!bannerExists) {
        var br = new Record(bCol)
        br.set('title', bannerTitle)
        br.set('description', banners[b].d)
        br.set('position', 'home_top')
        br.set('active', true)
        br.set('sort_order', b)
        br.set('start_date', '2026-07-01T00:00:00.000Z')
        br.set('end_date', '2026-12-31T23:59:59.000Z')
        app.save(br)
      }
    }

    console.log('Migration 0035: database reset and re-seeded with column-based settings')
  },
  (app) => {
    var transactionalCols = ['redemptions', 'cashback', 'purchase_items', 'purchases']
    for (var i = 0; i < transactionalCols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(transactionalCols[i]))
      } catch (_) {}
    }
    console.log('Migration 0035: down — transactional data cleared')
  },
)
