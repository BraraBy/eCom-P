import postgres from '../utils/db.js';

let result = '';

const getAllRole = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM role');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Role :', err);
    throw err;
  } finally {
    client.release();
  }
};

// Create new customers
const createRole = async (data) => {
    const { rolename } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO role ( rolename)
               VALUES ($1)
               RETURNING *;`,
          [ rolename ]
      );
      return result.rows;
    } catch (err) {
      console.error('Error to add new Role :', err);
      throw err;
    } finally {
      client.release();
    }
  };

// Update customers
const updateRole = async (role_id, data) => {
    const { rolename } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE customers
               SET rolename = $1
               WHERE role_id = $2
               RETURNING *;`,
          [rolename, role_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating Role at ID ${role_id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };


// Force Delete Prefix record.
const deleteRole = async (role_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM role WHERE role_id = $1 RETURNING *;`, [role_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting Customers at ID ${role_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllRole,
  createRole,
  updateRole,
  deleteRole,
};
