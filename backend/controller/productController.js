import postgres from '../utils/db.js';

let result = '';

const getAllPro = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (err) {
    console.error('Error to get all Product :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getTotalPro = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query('select count(product_id) from products');
    return result.rows;
  } catch (err) {
    console.error('Error to get Total Products :', err);
    throw err;
  } finally {
    client.release();
  }
};

const getProByCategoryId = async (category_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN category c ON p.category_id = c.category_id
       WHERE p.category_id = $1
       ORDER BY p.product_id DESC`,
      [category_id]
    );
    return result.rows;
  } catch (err) {
    console.error(`Error to get Products by category_id ${category_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const getProByCategorySlug = async (slug) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN category c ON p.category_id = c.category_id
       WHERE c.slug = $1
       ORDER BY p.product_id DESC`,
      [slug.toLowerCase()]
    );
    return result.rows;
  } catch (err) {
    console.error(`Error to get Products by category_slug ${slug}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const getProById = async (product_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query('SELECT * FROM products WHERE product_id = $1;', [product_id]);
    return result.rows;
  } catch (err) {
    console.error(`Error to get Products ID ${product_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const getProByName = async (data) => {
  const client = await postgres.connect();
  const { name } = data;
  try {
    result = await client.query('SELECT * FROM products WHERE name = $1;', [name]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error(`Error to get Products from name ${name}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const checkProName = async (data) => {
  const client = await postgres.connect();
  const { name } = data;
  try {
    const result = await client.query(
      'SELECT * FROM products WHERE product_id = $1 ;',
      [name]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking for duplicate Products Name :', err);
    throw err;
  } finally {
    client.release();
  }
};

// Create new customers
const createPro = async (data) => {
    const { name, price, stock, image_url,category_id } = data;
    const client = await postgres.connect();
    try {
      const result = await client.query(
          `INSERT INTO products ( name, price, stock, image_url, category_id)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING *;`,
          [ name, price, stock, image_url,category_id]
      );
      return result.rows;
    } catch (err) {
      console.error('Error to add new Products :', err);
      throw err;
    } finally {
      client.release();
    }
  };

// Update customers
const updatePro = async (product_id, data) => {
    const { name, price, stock, image_url,category_id } = data;
    const client = await postgres.connect();
    try { 
      const result = await client.query(
          `UPDATE products
               SET name = $1, price = $2, stock = $3, image_url = $4, category_id = $5
               WHERE product_id = $6
               RETURNING *;`,
          [name, price, stock, image_url,category_id, product_id]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error updating Products at ID ${product_id}:`, err);
      throw err;
    } finally {
      client.release();
    }
  };

// Force Delete Prefix record.
const deletePro = async (product_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      `DELETE FROM products WHERE product_id = $1 RETURNING *;`, [product_id]
    );
    return result.rows.length > 0 ? result.rows[0] : 'Not found';
  } catch (err) {
    console.error(`Error deleting Products at ID ${product_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
};


export default {
  getAllPro,
  getProById,
  getProByName,
  checkProName,
  createPro,
  updatePro,
  deletePro,
  getTotalPro,
  getProByCategoryId,
  getProByCategorySlug
};
