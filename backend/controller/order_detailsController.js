import postgres from '../utils/db.js';

let result = '';

const getAllOdd = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM order_details');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Order_details :', err);
    throw err;
  } finally {
    client.release();
  }
};


const getOddById = async (order_details_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM order_details WHERE order_details_id = $1;', [order_details_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get order_details ID ${order_details_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const createOdd = async (data) => {
    const { order_id,product_id,quantity,price } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO order_details ( order_id,product_id,quantity,price)
               VALUES ($1, $2, $3, $4)
               RETURNING *;`,
          [order_id,product_id,quantity,price]
      );
      return result.rows;
    } catch (err) {
      console.error('Error creating new Order_details:', err);
      throw err;
    } finally {
      client.release();
    }
};

const updateOdd = async (order_details_id, data) => {
    const { order_id,product_id,quantity,price } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE order_details
               SET order_id = $1, product_id = $2, quantity = $3, price = $4
               WHERE order_details_id = $5
               RETURNING *;`,
          [order_id,product_id,quantity,price, order_details_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating order_details at ID ${order_details_id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };

const deleteOdd = async (order_details_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM order_details WHERE order_details_id = $1 RETURNING *;`, [order_details_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting order_details at ID ${order_details_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllOdd,
  getOddById,
  createOdd,
  updateOdd,
  deleteOdd,
};
