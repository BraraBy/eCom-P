import postgres from '../utils/db.js';

let result = '';

const getAllCate = async () => {
    const client = await postgres.connect();
    try {
        result = await client.query('SELECT * FROM category');
        return result.rows;
    } catch (err) {
        console.error('Error fetching all Category : ', err);
        throw err;
    } finally {
        client.release();
    }
};

const getTotalCate = async () => {
    const client = await postgres.connect();
    try {
      result = await client.query('select count(category_id) from category');
      return result.rows;
    } catch (err) {
      console.error('Error to get all Category :', err);
      throw err;
    } finally {
      client.release();
    }
  };

const getCateById = async (category_id) => {
    const client = await postgres.connect();
    try {
        result = await client.query('SELECT * FROM category WHERE category_id = $1 ;', [category_id]);
        console.log(result);
        return result.rows;
    } catch (err) {
        console.error(`Error fetching Category at ID ${category_id} :`, err);
        throw err;
    } finally {
        client.release();
    }
};

const getCateByName = async (data) => {
    const client = await postgres.connect();
    const { name } = data;
    try {
        result = await client.query('SELECT * FROM category WHERE = 1$ ;', [name]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        console.error(`Error fetching Category at Name ${name} :`, err);
        throw err;
    } finally {
        client.release();
    }
};

const createCate = async (data) => {
    const { name } = data;
    const client = await postgres.connect();

    try {
        const result = await client.query(
            `INSERT INTO category (name)
             VALUES ($1)
             RETURNING *;`,
            [name]
        );
        return result.rows;
    } catch (err) {
        console.error(`Error creating new Category : `, err);
        throw err;
    } finally {
        client.release();
    }
};

const updateCate = async (category_id, data) => {
    const { name } = data;
    const client = await postgres.connect();
    try {
        const result = await client.query(
            `UPDATE category
             SET name = $1
             WHERE category_id = $2
             RETURNING *;`,
            [name, category_id]
        );
        return result.rows.length > 0 ? result.rows : 'category not found';
    } catch (err) {
        console.error(`Error updating Category : `, err);
        throw err;
    } finally {
        client.release();
    }
};

const deleteCate = async (category_id) => {
    const client = await postgres.connect();
    try {
        const result = await client.query(
            `DELETE FROM category WHERE category_id = $1 RETURNING *;`, [category_id]
        );
        return result.rows.length > 0 ? result.rows[0] : 'category not found';
    } catch (err) {
        console.error(`Error deleting Category : `, err);
        throw err;
    } finally {
        client.release();
    }
};

export default {
    getAllCate,
    getCateById,
    getCateByName,
    createCate,
    updateCate,
    deleteCate,
    getTotalCate
};