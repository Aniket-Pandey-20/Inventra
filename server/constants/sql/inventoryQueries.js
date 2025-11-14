export const createInventory = `
    INSERT INTO inventory_batches(batch_id, product_id, quantity, quantity_remaining, unit_price, purchased_at)
    VALUES($1, $2, $3, $3, $4, $5)
    ON CONFLICT (batch_id) DO NOTHING
`;

export const getStockByProduct = `
    SELECT batch_id, quantity_remaining, unit_price
    FROM inventory_batches
   WHERE product_id=$1 AND quantity_remaining > 0
   ORDER BY purchased_at ASC
   FOR UPDATE
`;

export const updateBatchQuantity = `
    UPDATE inventory_batches SET quantity_remaining = quantity_remaining - $1 WHERE batch_id = $2
`;
export const createSaleEntry = `
    INSERT INTO sales(sale_id, product_id, quantity, cogs, sold_at)
    VALUES($1, $2, $3, $4, $5)
    ON CONFLICT (sale_id) DO NOTHING
`;

export const getStockOverview=`
    SELECT 
        p.product_id, 
        p.name, 
        COALESCE(SUM(b.quantity_remaining),0) AS current_quantity,
        COALESCE(SUM(b.quantity_remaining * b.unit_price),0) AS total_cost,
        CASE WHEN SUM(b.quantity_remaining) > 0 
          THEN ROUND(SUM(b.quantity_remaining * b.unit_price)/SUM(b.quantity_remaining),2)
          ELSE 0 END AS avg_cost
      FROM products p
      LEFT JOIN inventory_batches b ON p.product_id = b.product_id
      GROUP BY p.product_id
      ORDER BY p.product_id
`

export const getTransactionLedger=`
    SELECT batch_id AS id, product_id, quantity, unit_price, purchased_at AS timestamp, 'purchase' AS type
    FROM inventory_batches
    WHERE quantity > 0
    UNION ALL
    SELECT sale_id AS id, product_id, quantity, cogs AS unit_price, sold_at AS timestamp, 'sale' AS type
    FROM sales
    ORDER BY timestamp ASC
`