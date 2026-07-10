routerAdd(
  'POST',
  '/backend/v1/partner-stations',
  (e) => {
    const body = e.requestInfo().body || {}

    const collection = $app.findCollectionByNameOrId('partner_stations')
    const record = new Record(collection)

    record.set('name', body.name || '')
    record.set('address', body.address || '')
    record.set('city', body.city || '')
    record.set('state', body.state || '')
    record.set('phone', body.phone || '')
    record.set('active', body.active !== undefined ? body.active : true)

    $app.save(record)
    return e.json(200, record)
  },
  $apis.requireAuth(),
)
