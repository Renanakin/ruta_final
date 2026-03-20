import { getDb } from '../../config/db.js';

const normalizeOrder = (row) => ({
  ...row,
  total_price: Number(row.total_price ?? 0),
  quantity: Number(row.quantity ?? 0),
  product_count: Number(row.product_count ?? 0),
});

const mapOrderSummaries = async (db, whereClause = '', params = []) => {
  const rows = await db.all(`
    SELECT
      o.id,
      o.user_id,
      o.total_price,
      o.status,
      o.delivery_address,
      o.delivery_schedule,
      o.notes,
      o.cancellation_reason,
      o.created_at,
      COALESCE(SUM(oi.quantity), 0) AS quantity,
      COUNT(DISTINCT oi.product_id) AS product_count,
      CASE
        WHEN COUNT(DISTINCT oi.product_id) = 0 THEN NULL
        WHEN COUNT(DISTINCT oi.product_id) = 1 THEN MAX(COALESCE(oi.product_name, p.name))
        ELSE printf('%d productos', COUNT(DISTINCT oi.product_id))
      END AS product_name
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, params);

  return rows.map(normalizeOrder);
};

export const createOrder = async (userId, { total_price, delivery_address, delivery_schedule, notes }) => {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO orders (user_id, total_price, delivery_address, delivery_schedule, notes) VALUES (?, ?, ?, ?, ?)',
    [userId, total_price, delivery_address, delivery_schedule || null, notes || null]
  );

  return {
    id: result.lastID,
    user_id: userId,
    total_price,
    status: 'pending'
  };
};

export const getUserOrders = async (userId) => {
  const db = getDb();
  return mapOrderSummaries(db, 'WHERE o.user_id = ?', [userId]);
};

export const getAllOrders = async () => {
  const db = getDb();
  return mapOrderSummaries(db);
};

export const updateOrderStatus = async (orderId, { status, cancellation_reason }) => {
  const db = getDb();
  await db.run(
    'UPDATE orders SET status = ?, cancellation_reason = ? WHERE id = ?',
    [status, cancellation_reason || null, orderId]
  );
  return { id: Number(orderId), status };
};
