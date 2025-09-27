import postgres from '../utils/db.js';

let result = '';

const getAllPro = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id DESC
    `);
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

const checkProName = async (name) => {
  const client = await postgres.connect();
  try {
    const result = await client.query(
      'SELECT * FROM products WHERE name = $1',
      [name]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking for duplicate Products Name:', err);
    throw err;
  } finally {
    client.release();
  }
};

const createPro = async ({ name, price = 0, stock = 0, image_url = null, category_id = null }) => {
  const client = await postgres.connect();
  try {
    const checkResult = await client.query(
      'SELECT product_id FROM products WHERE name = $1',
      [name]
    );
    if (checkResult.rows.length > 0) {
      throw new Error('Product name already exists');
    }

    const result = await client.query(
      `INSERT INTO products (name, price, stock, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, stock, image_url, category_id]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('Product name already exists');
    }
    throw err;
  } finally {
    client.release();
  }
};

const updatePro = async (product_id, data) => {
  const client = await postgres.connect();
  try {
    const r = await client.query(
      `UPDATE products
         SET name        = COALESCE($1, name),
             price       = COALESCE($2, price),
             stock       = COALESCE($3, stock),
             image_url   = COALESCE($4, image_url),
             category_id = COALESCE($5, category_id)
       WHERE product_id = $6
       RETURNING product_id, name, price, stock, image_url, category_id`,
      [
        data.name !== undefined ? String(data.name).trim() : undefined,
        data.price !== undefined ? Number(data.price) : undefined,
        data.stock !== undefined ? Number(data.stock) : undefined,
        data.image_url !== undefined ? (data.image_url || null) : undefined,
        data.category_id !== undefined
          ? (data.category_id === '' ? null : Number(data.category_id))
          : undefined,
        Number(product_id),
      ]
    );
    return r.rows[0];
  } catch (err) {
    throw new Error(err?.message || 'DB error');
  } finally { client.release(); }
};

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

const listProducts = async ({ page = 1, limit = 10, search = '', category_id = null, category_slug = null }) => {
  const client = await postgres.connect();
  try {
    const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

    const where = [];
    const params = [];
    let i = 1;

    if (category_id) { where.push(`p.category_id = $${i++}`); params.push(Number(category_id)); }
    if (category_slug) { where.push(`LOWER(c.slug) = LOWER($${i++})`); params.push(String(category_slug)); }
    if (search?.trim()) {
      where.push(`(p.name ILIKE $${i} OR c.name ILIKE $${i})`);
      params.push(`%${search.trim()}%`);
      i++;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rowsRes = await client.query(
      `SELECT p.product_id, p.name, p.price, p.stock, p.image_url, p.category_id,
              c.name AS category_name
         FROM products p
         LEFT JOIN category c ON c.category_id = p.category_id
         ${whereSql}
         ORDER BY p.product_id DESC
         LIMIT $${i++} OFFSET $${i++}`,
      [...params, Math.max(1, Number(limit)), offset]
    );

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS total
         FROM products p
         LEFT JOIN category c ON c.category_id = p.category_id
         ${whereSql}`,
      params
    );

    return { rows: rowsRes.rows, total: countRes.rows[0]?.total ?? rowsRes.rows.length };
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
  getProByCategorySlug,
  listProducts,
};
