migrate(
  (app) => {
    const purchasesId = app.findCollectionByNameOrId('purchases').id

    const collection = new Collection({
      name: 'cashback',
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
        {
          name: 'purchase',
          type: 'relation',
          required: true,
          collectionId: purchasesId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'type', type: 'select', values: ['loja', 'combustivel'], maxSelect: 1 },
        { name: 'amount_generated', type: 'number' },
        { name: 'amount_available', type: 'number' },
        { name: 'amount_used', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'released', 'used', 'expired'],
          maxSelect: 1,
        },
        { name: 'released_at', type: 'date' },
        { name: 'expired_at', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_cashback_client ON cashback (client)',
        'CREATE INDEX idx_cashback_status ON cashback (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('cashback')
    app.delete(collection)
  },
)
