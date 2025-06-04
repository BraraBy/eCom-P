import postgres from '../utils/db.js';

let result = '';

const getAllCus = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM customers');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Customers :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getTotalCus = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('select count(customers_id) from customers');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Customers :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getCusById = async (customers_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM customers WHERE customers_id = $1;', [customers_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get customers ID ${customers_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

// Get Prefix by Name. Only returns prefix where isDelete is false.
const getCusByName = async (data) => {
  const client = await postgres.connect();
  const { first_name } = data;
  try {
    result = await client.query('SELECT * FROM customers WHERE first_name = $1;', [first_name]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error(`Error to get Customers firstname ${first_name}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const checkCus = async (data) => {
  const client = await postgres.connect();
  const { first_name } = data;
  try {
    const result = await client.query(
      'SELECT * FROM customers WHERE customers_id = $1 ;',
      [first_name]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking for duplicate customers firstname:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Create new customers
const createCus = async (data) => {
    const { first_name, last_name, phone, address, registered_date } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO customers ( first_name, last_name, phone, address, registered_date)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING *;`,
          [ first_name, last_name, phone, address, registered_date]
      );
      return result.rows;
    } catch (err) {
      console.error('Error creating new Customers:', err);
      throw err;
    } finally {
      client.release();
    }
  };

// Update customers
const updateCus = async (customers_id, data) => {
    const { first_name, last_name, phone, address } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE customers
               SET first_name = $1, last_name = $2, phone = $3, address = $4
               WHERE customers_id = $5
               RETURNING *;`,
          [first_name, last_name, phone, address, customers_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating Customers at ID ${customers_id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };


// Force Delete Prefix record.
const deleteCus = async (customers_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM customers WHERE customers_id = $1 RETURNING *;`, [customers_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting Customers at ID ${customers_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllCus,
  getCusById,
  getCusByName,
  checkCus,
  createCus,
  updateCus,
  deleteCus,
  getTotalCus
};
