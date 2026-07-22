migrate(
  (app) => {
    var purchasesCollectionId = app.findCollectionByNameOrId('purchases').id

    var collection = new Collection({
      name: 'payments',
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
        { name: 'method', type: 'text' },
        { name: 'amount', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_payments_purchase ON payments (purchase)'],
    })
    app.save(collection)
  },
  (app) => {
    var collection = app.findCollectionByNameOrId('payments')
    app.delete(collection)
  },
)
