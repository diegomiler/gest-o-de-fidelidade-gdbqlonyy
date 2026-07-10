migrate(
  (app) => {
    var updates = {
      'SALE-101': {
        items: [{ name: 'Gasolina Comum', qty: 30, price: 5.79 }],
        payment_method: 'Dinheiro',
      },
      'SALE-102': {
        items: [{ name: 'Diesel S10', qty: 50, price: 6.19 }],
        payment_method: 'Cartão de Débito',
      },
      'SALE-103': {
        items: [{ name: 'Gasolina Comum', qty: 20, price: 2.5 }],
        payment_method: 'Pix',
      },
      'SALE-104': {
        items: [
          { name: 'Óleo Motor 5W30', qty: 1, price: 45.0 },
          { name: 'Filtro de Óleo', qty: 1, price: 35.0 },
          { name: 'Gasolina Aditivada', qty: 40, price: 5.89 },
        ],
        payment_method: 'Cartão de Crédito',
      },
    }

    for (var saleId in updates) {
      try {
        var p = app.findFirstRecordByData('purchases', 'api_sale_id', saleId)
        p.set('items', updates[saleId].items)
        p.set('payment_method', updates[saleId].payment_method)
        app.save(p)
      } catch (_) {}
    }
  },
  (app) => {
    var saleIds = ['SALE-101', 'SALE-102', 'SALE-103', 'SALE-104']
    for (var i = 0; i < saleIds.length; i++) {
      try {
        var p = app.findFirstRecordByData('purchases', 'api_sale_id', saleIds[i])
        p.set('items', null)
        p.set('payment_method', '')
        app.save(p)
      } catch (_) {}
    }
  },
)
