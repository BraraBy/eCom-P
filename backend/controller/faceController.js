import postgres from '../utils/db.js';

let result = '';

const getAllFac = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM face_data');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Face Data :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getFacById = async (customer_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM face_data WHERE customer_id = $1;', [customer_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get Face Data by ID ${customer_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const createFac = async (data) => {
    const { image_data } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO face_data ( image_data )
               VALUES ($1)
               RETURNING *;`,
          [ image_data ]
      );
      return result.rows;
    } catch (err) {
      console.error('Error creating new Face Data:', err);
      throw err;
    } finally {
      client.release();
    }
  };

const updateFac = async (customer_id, data) => {
    const { image_data } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE face_data
               SET image_data = $1
               WHERE customers_id = $2
               RETURNING *;`,
          [image_data, customer_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating Face Data at Customer ID : ${id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };

const deleteFac = async (customer_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM face_data WHERE customer_id = $1 RETURNING *;`, [customer_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting Face Data at ID ${customer_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllFac,
  getFacById,
  createFac,
  updateFac,
  deleteFac,
};
