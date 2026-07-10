routerAdd(
  'PATCH',
  '/backend/v1/partner-stations/{id}',
  (e) => {
    const id = e.request.pathValue('id')
    const body = e.requestInfo().body || {}

    const record = $app.findRecordById('partner_stations', id)

    if (body.name !== undefined) record.set('name', body.name)
    if (body.address !== undefined) record.set('address', body.address)
    if (body.city !== undefined) record.set('city', body.city)
    if (body.state !== undefined) record.set('state', body.state)
    if (body.phone !== undefined) record.set('phone', body.phone)
    if (body.active !== undefined) record.set('active', body.active)

    $app.save(record)
    return e.json(200, record)
  },
  $apis.requireAuth(),
)
