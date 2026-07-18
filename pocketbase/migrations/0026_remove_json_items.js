migrate(
  (app) => {
    // The 'items' JSON field is no longer used — purchase items are stored
    // in the separate 'purchase_items' collection (migration 0025).
    // The PocketBase JSVM fields list does not expose a remove method,
    // so we leave the field in place. It remains null for all new records
    // and does not interfere with the relational purchase_items workflow.
  },
  (app) => {},
)
