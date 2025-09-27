import postgres from '../utils/db.js';

let result = '';

const getAllOrd = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM orders');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Orders :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getAllOrdByCustomer = async (customers_id) => {
  const client = await postgres.connect();
  try {
    const sql = `
      SELECT
        o.order_id,
        o.customer_id,
        o.order_date,
        o.total_amount,
        o.status,
        COALESCE(SUM(od.quantity * od.price), 0) AS subtotal,
        COUNT(od.order_detail_id) AS item_count
      FROM orders o
      LEFT JOIN order_details od ON od.order_id = o.order_id
      WHERE o.customer_id = $1
      GROUP BY
        o.order_id, o.customer_id, o.order_date, o.total_amount, o.status
      ORDER BY o.order_date DESC, o.order_id DESC
    `;
    const r = await client.query(sql, [customers_id]);
    return r.rows;
  } catch (err) {
    console.error(`Error to get orders for customer ${customers_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const getTotalOrd = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('select count(order_id) from orders');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Orders :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getOrdById = async (order_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM orders WHERE order_id = $1;', [order_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get orders ID ${order_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const createOrd = async (customers_id, total_amount) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `INSERT INTO orders (customer_id, total_amount, status)
       VALUES ($1, $2, 'COMPLETED')
       RETURNING *`,
      [customers_id, total_amount]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error creating order:", err);
    throw err;
  } finally {
    client.release();
  }
};

const getItemsByOrderForCustomer = async (order_id, customers_id) => {
  const client = await postgres.connect();
  try {
    const sql = `
      SELECT
        od.order_detail_id,
        od.order_id,
        od.product_id,
        p.name AS product_name,
        p.image_url AS image_url,
        od.quantity,
        od.price,
        (od.quantity * od.price) AS line_total
      FROM order_details od
      JOIN orders o ON o.order_id = od.order_id
      LEFT JOIN products p ON p.product_id = od.product_id
      WHERE od.order_id = $1
        AND o.customer_id = $2
      ORDER BY od.order_detail_id ASC
    `;
    const r = await client.query(sql, [order_id, customers_id]);
    return r.rows;
  } catch (err) {
    console.error(`Error to get items for order ${order_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const createOrderWithItems = async (customers_id, items = [], total_amount = 0) => {
  if (!customers_id) throw new Error('UNAUTHORIZED');
  if (!Array.isArray(items) || items.length === 0) throw new Error('NO_ITEMS');

  const client = await postgres.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, total_amount, status)
       VALUES ($1, $2, 'COMPLETED') RETURNING order_id`,
      [customers_id, Number(total_amount) || 0]
    );
    const order_id = orderRes.rows[0].order_id;

    for (const it of items) {
      const pid = Number(it.product_id);
      const qty = Math.max(1, Number(it.quantity || 1));
      const price = Number(it.price || 0);

      const prodRes = await client.query(
        `SELECT product_id, name, stock FROM products WHERE product_id = $1 FOR UPDATE`,
        [pid]
      );
      if (prodRes.rowCount === 0) {
        throw new Error(`PRODUCT_NOT_FOUND:${pid}`);
      }
      const { name, stock } = prodRes.rows[0];
      if (Number(stock) < qty) {
        throw new Error(`INSUFFICIENT_STOCK:${pid}:${name}:${stock}:${qty}`);
      }

      await client.query(`UPDATE products SET stock = stock - $1 WHERE product_id = $2`, [qty, pid]);

      await client.query(
        `INSERT INTO order_details (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order_id, pid, qty, price]
      );
    }

    await client.query('COMMIT');
    return { order_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteOrd = async (order_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM orders WHERE order_id = $1 RETURNING *;`, [order_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting Order at ID ${order_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllOrd,
  getOrdById,
  deleteOrd,
  getTotalOrd,
  getAllOrdByCustomer,
  createOrd,
  getItemsByOrderForCustomer,
  createOrderWithItems,
};
