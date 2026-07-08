migrate(
  (app) => {
    const collection = new Collection({
      name: 'banners',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'position', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'active', type: 'bool', default: true },
        { name: 'sort_order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('banners')
    app.delete(collection)
  },
)
