migrate(
  (app) => {
    const prizesId = app.findCollectionByNameOrId('prizes').id

    const collection = new Collection({
      name: 'redemptions',
      type: 'base',
      listRule: "@request.auth.id != '' && client = @request.auth.id",
      viewRule: "@request.auth.id != '' && client = @request.auth.id",
      createRule: "@request.auth.id != '' && client = @request.auth.id",
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
          name: 'prize',
          type: 'relation',
          required: true,
          collectionId: prizesId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', onlyInt: true },
        { name: 'total_cost', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['requested', 'approved', 'delivered', 'canceled'],
          maxSelect: 1,
        },
        { name: 'delivery_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_redemptions_client ON redemptions (client)',
        'CREATE INDEX idx_redemptions_status ON redemptions (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('redemptions')
    app.delete(collection)
  },
)
