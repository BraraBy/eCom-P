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
  getTotalOrd
};
