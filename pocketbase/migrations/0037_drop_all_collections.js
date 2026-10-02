migrate(
  (app) => {
    // 1. Apagar todos os dados de todas as tabelas na ordem de dependência (chaves estrangeiras)
    var tablesToClear = [
      'payments',
      'purchase_items',
      'cashback',
      'redemptions',
      'purchases',
      'prizes',
      'banners',
      'partner_stations',
      'settings',
    ]

    for (var i = 0; i < tablesToClear.length; i++) {
      var tableName = tablesToClear[i]
      try {
        if (app.hasTable(tableName)) {
          var col = app.findCollectionByNameOrId(tableName)
          app.truncateCollection(col)
        }
      } catch (e) {
        try {
          app
            .db()
            .newQuery('DELETE FROM ' + tableName)
            .execute()
        } catch (_) {}
      }
    }

    // Limpar usuários não essenciais caso existam registros
    try {
      app.db().newQuery("DELETE FROM users WHERE email != 'diegomiler@live.com'").execute()
    } catch (_) {}

    // 2. Descartar as collections da plataforma, deixando apenas o users do PocketBase
    for (var j = 0; j < tablesToClear.length; j++) {
      var colName = tablesToClear[j]
      try {
        var collection = app.findCollectionByNameOrId(colName)
        app.delete(collection)
      } catch (_) {}
    }
  },
  (app) => {
    // Down vazio pois a transição de arquitetura é permanente para mock/Postgres
  },
)
