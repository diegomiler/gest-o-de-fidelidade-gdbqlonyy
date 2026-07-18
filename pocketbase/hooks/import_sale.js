routerAdd(
  'POST',
  '/backend/v1/import/sale',
  (e) => {
    const body = e.requestInfo().body || {}
    const data = body.data || body

    var transactionId = data.transactionId || ''
    var customerName = data.customerName || ''
    var rawCpf = data.customerCpf || ''
    var cleanCpf = rawCpf.replace(/\D/g, '')
    var totalAmount = Number(data.totalAmount) || 0
    var status = data.status || 'pending'
    var timestamp = body.timestamp || data.timestamp || ''

    var purchaseDate = ''
    if (timestamp) {
      purchaseDate = timestamp.replace(' ', 'T')
    } else {
      purchaseDate = new Date().toISOString()
    }

    if (!cleanCpf) {
      return e.badRequestError('customerCpf is required')
    }

    var userId = ''
    if (rawCpf) {
      try {
        var user = $app.findFirstRecordByData('users', 'cpf', rawCpf)
        userId = user.id
      } catch (_) {
        try {
          var userClean = $app.findFirstRecordByData('users', 'cpf', cleanCpf)
          userId = userClean.id
        } catch (_) {}
      }
    }

    if (!userId) {
      try {
        var usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
        var newUser = new Record(usersCol)
        newUser.setEmail(cleanCpf + '@import.local')
        newUser.setPassword('Skip@Pass')
        newUser.setVerified(true)
        newUser.set('name', customerName || 'Cliente Importado')
        newUser.set('cpf', cleanCpf)
        newUser.set('status', true)
        $app.save(newUser)
        userId = newUser.id
      } catch (err) {
        return e.json(500, { error: 'Failed to create user: ' + err.message })
      }
    }

    if (transactionId) {
      try {
        var existing = $app.findFirstRecordByData('purchases', 'api_sale_id', transactionId)
        return e.json(200, { success: true, id: existing.id, message: 'Sale already imported' })
      } catch (_) {}
    }

    try {
      var purchasesCol = $app.findCollectionByNameOrId('purchases')
      var purchase = new Record(purchasesCol)
      purchase.set('client', userId)
      purchase.set('cpf', cleanCpf)
      purchase.set('api_sale_id', transactionId)
      purchase.set('total_amount', totalAmount)
      purchase.set('status', status)
      purchase.set('purchase_date', purchaseDate)
      purchase.set('origin_channel', 'import')
      purchase.set('sync_date', new Date().toISOString())
      $app.save(purchase)

      return e.json(200, {
        success: true,
        id: purchase.id,
        message: 'Sale imported successfully',
      })
    } catch (err) {
      return e.json(500, { error: 'Failed to create purchase: ' + err.message })
    }
  },
  $apis.requireAuth(),
)
