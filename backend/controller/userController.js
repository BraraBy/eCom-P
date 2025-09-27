import postgres from '../utils/db.js';

let result = '';

const getAllUser = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM users');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Users :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getTotalUser = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('select count(user_id) from users');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Users :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getUserById = async (user_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM users WHERE user_id = $1;', [user_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get Users ID ${user_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const getUserByName = async (data) => {
  const client = await postgres.connect();
  const { username } = data;
  try {
    result = await client.query('SELECT * FROM users WHERE username = $1;', [username]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error(`Error to get User username ${username}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const checkUser = async (data) => {
  const client = await postgres.connect();
  const { username } = data;
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE user_id = $1 ;',
      [username]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking for duplicate Username :', err);
    throw err;
  } finally {
    client.release();
  }
};

const createUser = async (data) => {
    const { role_id, username ,password, email } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO user ( role_id, username ,password, email)
               VALUES ($1, $2, $3, $4)
               RETURNING *;`,
          [ role_id, username ,password, email]
      );
      return result.rows;
    } catch (err) {
      console.error('Error creating new user:', err);
      throw err;
    } finally {
      client.release();
    }
  };

const updateUser = async (user_id, data) => {
    const { role_id, username ,password, email } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE user
               SET role_id = $1, username = $2, password = $3, email = $4
               WHERE user_id = $5
               RETURNING *;`,
          [role_id, username ,password, email, user_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating user at ID ${user_id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };

const deleteUser = async (user_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM users WHERE user_id = $1 RETURNING *;`, [user_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting user at ID ${user_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllUser,
  getUserById,
  getUserByName,
  checkUser,
  createUser,
  updateUser,
  deleteUser,
  getTotalUser
};
