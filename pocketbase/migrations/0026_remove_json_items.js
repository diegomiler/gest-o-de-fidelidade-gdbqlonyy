migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('purchases')
    var itemsField = col.fields.getByName('items')
    if (itemsField) {
      col.fields.remove(itemsField)
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('purchases')
    if (!col.fields.getByName('items')) {
      col.fields.add(new JSONField({ name: 'items' }))
    }
    app.save(col)
  },
)
