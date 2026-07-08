migrate(
  (app) => {
    const collection = new Collection({
      name: 'purchases',
      type: 'base',
      listRule: "@request.auth.id != '' && client = @request.auth.id",
      viewRule: "@request.auth.id != '' && client = @request.auth.id",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'client',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'cpf', type: 'text' },
        { name: 'api_sale_id', type: 'text' },
        { name: 'total_amount', type: 'number' },
        { name: 'purchase_date', type: 'date' },
        { name: 'origin_channel', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'approved', 'canceled'],
          maxSelect: 1,
        },
        { name: 'sync_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_purchases_client ON purchases (client)',
        'CREATE INDEX idx_purchases_status ON purchases (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('purchases')
    app.delete(collection)
  },
)
