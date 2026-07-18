migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('purchase_items')
    if (!col.fields.getByName('product_code')) {
      col.fields.add(
        new TextField({
          name: 'product_code',
          required: false,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('purchase_items')
    var field = col.fields.getByName('product_code')
    if (field) {
      col.fields.remove(field)
      app.save(col)
    }
  },
)
