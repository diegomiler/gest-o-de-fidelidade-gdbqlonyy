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
    var items = data.items || []

    var purchaseDate = ''
    if (timestamp) {
      purchaseDate = timestamp.replace(' ', 'T')
    } else {
      purchaseDate = new Date().toISOString()
    }

    if (!cleanCpf) {
      return e.badRequestError('customerCpf is required')
    }

    try {
      $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
    } catch (_) {
      $app
        .logger()
        .warn(
          'cashback_rules not found in settings — purchase will be imported without cashback generation',
        )
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

      var itemsCreated = 0
      if (items.length > 0) {
        try {
          var itemsCol = $app.findCollectionByNameOrId('purchase_items')
          for (var ii = 0; ii < items.length; ii++) {
            var item = items[ii]
            var productCode = item.codigo || item.code || ''
            var itemName =
              item.descricao || item.description || item.nome || item.name || 'Item sem descrição'
            var qty = Number(item.quantidade) || Number(item.quantity) || 0
            var unitPrice =
              Number(item['preço unitario']) ||
              Number(item['preco unitario']) ||
              Number(item.unit_price) ||
              0
            var totalPrice =
              Number(item['preço total']) ||
              Number(item['preco total']) ||
              Number(item.total_price) ||
              0

            var itemRecord = new Record(itemsCol)
            itemRecord.set('purchase', purchase.id)
            itemRecord.set('product_code', productCode)
            itemRecord.set('name', itemName)
            itemRecord.set('quantity', qty)
            itemRecord.set('unit_price', unitPrice)
            itemRecord.set('total_price', totalPrice)
            $app.save(itemRecord)
            itemsCreated++
          }
        } catch (itemErr) {
          $app
            .logger()
            .warn(
              'Failed to create some purchase items',
              'purchaseId',
              purchase.id,
              'error',
              itemErr.message,
            )
        }
      }

      var cbStorePercent = 0
      var cbFuelPercent = 0
      try {
        var cbSetting = $app.findFirstRecordByData('settings', 'key', 'cashback_rules')
        var sp = cbSetting.get('store_percent')
        var fp = cbSetting.get('fuel_percent')
        if (sp !== null && sp !== undefined && !isNaN(sp)) cbStorePercent = sp
        if (fp !== null && fp !== undefined && !isNaN(fp)) cbFuelPercent = fp
      } catch (cbRuleErr) {
        $app
          .logger()
          .error('cashback_rules not found in settings during import', 'error', cbRuleErr.message)
        return e.json(500, {
          error:
            'Configuração de cashback não encontrada. Não é possível processar a venda sem regras válidas.',
        })
      }

      if (!cbStorePercent || cbStorePercent <= 0) {
        return e.json(400, {
          error:
            'Percentual de cashback da loja (store_percent) não está configurado ou é zero. Não é possível gerar cashback com valores inválidos.',
        })
      }
      if (!cbFuelPercent || cbFuelPercent <= 0) {
        return e.json(400, {
          error:
            'Percentual de cashback de combustível (fuel_percent) não está configurado ou é zero. Não é possível gerar cashback com valores inválidos.',
        })
      }

      var storeCashbackAmount = totalAmount * (cbStorePercent / 100)
      var fuelCashbackAmount = totalAmount * (cbFuelPercent / 100)
      try {
        var cashbackCol = $app.findCollectionByNameOrId('cashback')

        var storeCbRecord = new Record(cashbackCol)
        storeCbRecord.set('client', userId)
        storeCbRecord.set('purchase', purchase.id)
        storeCbRecord.set('type', 'loja')
        if (storeCashbackAmount > 0) {
          var storeCbRecord = new Record(cashbackCol)
          storeCbRecord.set('client', userId)
          storeCbRecord.set('purchase', purchase.id)
          storeCbRecord.set('type', 'loja')
          storeCbRecord.set('amount_generated', storeCashbackAmount)
          storeCbRecord.set('amount_available', storeCashbackAmount)
          storeCbRecord.set('amount_used', 0)
          storeCbRecord.set('status', 'pending')
          $app.save(storeCbRecord)
        }

        if (fuelCashbackAmount > 0) {
          var fuelCbRecord = new Record(cashbackCol)
          fuelCbRecord.set('client', userId)
          fuelCbRecord.set('purchase', purchase.id)
          fuelCbRecord.set('type', 'combustivel')
          fuelCbRecord.set('amount_generated', fuelCashbackAmount)
          fuelCbRecord.set('amount_available', fuelCashbackAmount)
          fuelCbRecord.set('amount_used', 0)
          fuelCbRecord.set('status', 'pending')
          $app.save(fuelCbRecord)
        }
      } catch (cbCreateErr) {
        $app
          .logger()
          .error(
            'cashback generation failed during import',
            'purchaseId',
            purchase.id,
            'error',
            cbCreateErr.message,
          )
      }

      return e.json(200, {
        success: true,
        id: purchase.id,
        message:
          itemsCreated > 0
            ? 'Sale imported successfully with ' + itemsCreated + ' item(s)'
            : 'Sale imported successfully',
        items_created: itemsCreated,
      })
    } catch (err) {
      return e.json(500, { error: 'Failed to create purchase: ' + err.message })
    }
  },
  $apis.requireAuth(),
)
