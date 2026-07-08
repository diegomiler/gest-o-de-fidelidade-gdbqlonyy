migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('cpf')) {
      col.fields.add(new TextField({ name: 'cpf' }))
    }
    if (!col.fields.getByName('phone')) {
      col.fields.add(new TextField({ name: 'phone' }))
    }
    if (!col.fields.getByName('status')) {
      col.fields.add(new BoolField({ name: 'status', default: true }))
    }

    col.addIndex('idx_users_cpf', true, 'cpf', "cpf != ''")

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.removeIndex('idx_users_cpf')
    app.save(col)
  },
)
