migrate(
  (app) => {
    var purchasesCollectionId = app.findCollectionByNameOrId('purchases').id

    var collection = new Collection({
      name: 'purchase_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'purchase',
          type: 'relation',
          required: true,
          collectionId: purchasesCollectionId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit_price', type: 'number', required: true },
        { name: 'total_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_purchase_items_purchase ON purchase_items (purchase)'],
    })
    app.save(collection)
  },
  (app) => {
    var collection = app.findCollectionByNameOrId('purchase_items')
    app.delete(collection)
  },
)
