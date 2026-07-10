migrate(
  (app) => {
    const purchasesCol = app.findCollectionByNameOrId('purchases')

    if (!purchasesCol.fields.getByName('items')) {
      purchasesCol.fields.add(new JSONField({ name: 'items' }))
    }
    if (!purchasesCol.fields.getByName('payment_method')) {
      purchasesCol.fields.add(new TextField({ name: 'payment_method' }))
    }

    app.save(purchasesCol)

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      var avatarField = usersCol.fields.getByName('avatar')
      if (avatarField) {
        avatarField.maxSize = 5242880
        avatarField.mimeTypes = ['image/jpeg', 'image/png', 'image/webp']
      }
      app.save(usersCol)
    } catch (_) {}
  },
  (app) => {
    var purchasesCol = app.findCollectionByNameOrId('purchases')
    try {
      var itemsField = purchasesCol.fields.getByName('items')
      if (itemsField) purchasesCol.fields.remove(itemsField)
      var pmField = purchasesCol.fields.getByName('payment_method')
      if (pmField) purchasesCol.fields.remove(pmField)
      app.save(purchasesCol)
    } catch (_) {}
  },
)
