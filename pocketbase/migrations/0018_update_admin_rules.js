migrate(
  (app) => {
    const banners = app.findCollectionByNameOrId('banners')
    banners.createRule = "@request.auth.id != ''"
    banners.updateRule = "@request.auth.id != ''"
    banners.deleteRule = "@request.auth.id != ''"
    app.save(banners)

    const prizes = app.findCollectionByNameOrId('prizes')
    prizes.createRule = "@request.auth.id != ''"
    prizes.updateRule = "@request.auth.id != ''"
    prizes.deleteRule = "@request.auth.id != ''"
    app.save(prizes)

    const stations = app.findCollectionByNameOrId('partner_stations')
    stations.createRule = "@request.auth.id != ''"
    stations.updateRule = "@request.auth.id != ''"
    stations.deleteRule = "@request.auth.id != ''"
    app.save(stations)
  },
  (app) => {
    const banners = app.findCollectionByNameOrId('banners')
    banners.createRule = null
    banners.updateRule = null
    banners.deleteRule = null
    app.save(banners)

    const prizes = app.findCollectionByNameOrId('prizes')
    prizes.createRule = null
    prizes.updateRule = null
    prizes.deleteRule = null
    app.save(prizes)

    const stations = app.findCollectionByNameOrId('partner_stations')
    stations.createRule = null
    stations.updateRule = null
    stations.deleteRule = null
    app.save(stations)
  },
)
