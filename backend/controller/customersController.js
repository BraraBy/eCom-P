import postgres from '../utils/db.js';
import multer from 'multer';
import bcrypt from 'bcrypt';

let result = '';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

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

const getCusByEmail = async (data) => {
  const client = await postgres.connect();
  const { email } = data;
  try {
    result = await client.query('SELECT * FROM customers WHERE email = $1;', [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error(`Error to get Customers Email ${email}:`, err);
    throw err;
  } finally {
    client.release();
  }
};

const roleNameToID = async (role_id) => {
  const client = await postgres.connect();
  try {
    const result = await client.query('select * from role where role.rolename = $1;', [role_id]);
    return result.rows[0].role_id;
  } catch (err) {
    console.error(`Error checking role ${role_id}:`, err);
    throw err;
  } finally {
    client.release();
  }
}

const checkCus = async (data) => {
  const client = await postgres.connect();
  const { email } = data;
  
  try {
    const result = await client.query(
      'SELECT * FROM customers WHERE email = $1 ;',
      [email]
    );
    
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error checking for duplicate customers email :', err);
    throw err;
  } finally {
    client.release();
  }
};

const createCus = async (data) => {
  const { first_name, last_name, phone, address, street, city, state, country, zip_code, password, email, role_id } = data;

  const client = await postgres.connect();
  try {
    const dup = await client.query('SELECT 1 FROM customers WHERE email = $1 LIMIT 1;', [email]);
    if (dup.rowCount > 0) {
      const err = new Error('Email already exists');
      err.statusCode = 400;
      throw err;
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await client.query(
      `INSERT INTO customers 
        (first_name, last_name, phone, address, street, city, state, country, zip_code, password, email, role_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING customers_id, first_name, last_name, phone, address, street, city, state, country, zip_code, email, role_id, registered_date;`,
      [first_name, last_name, phone, address, street, city, state, country, zip_code, hashed, email, role_id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const updateCus = async (customers_id, data) => {
  const { first_name, last_name, phone, address, street, city, state, country, zip_code, image_profile, password, email } = data;
  const client = await postgres.connect();
  try {
    const prevRes = await client.query('SELECT * FROM customers WHERE customers_id = $1;', [customers_id]);
    if (prevRes.rowCount === 0) throw new Error('Customer not found');
    const existing = prevRes.rows[0];

    const hashedPassword = password ? await bcrypt.hash(password, SALT_ROUNDS) : existing.password;

    const result = await client.query(
      `UPDATE customers
       SET first_name=$1, last_name=$2, phone=$3, address=$4,
           street=$5, city=$6, state=$7, country=$8, zip_code=$9,
           image_profile=$10, password=$11, email=$12
       WHERE customers_id=$13
       RETURNING customers_id, first_name, last_name, phone, address, street, city, state, country, zip_code, email, role_id, image_profile, registered_date;`,
      [
        first_name || existing.first_name,
        last_name  || existing.last_name,
        phone      || existing.phone,
        address    || existing.address,
        street     || existing.street,
        city       || existing.city,
        state      || existing.state,
        country    || existing.country,
        zip_code   || existing.zip_code,
        image_profile || existing.image_profile,
        hashedPassword,
        email      || existing.email,
        customers_id,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const uploadProfileCus = async (req, res) => {
  try {
    const { customer_id } = req.body;
    const filename = req.file?.filename;

    if (!filename || !customer_id) {
      return res.status(400).json({ success: false, message: 'Missing file or customer ID' });
    }

    const imageUrl = `/uploads/profile/${image.filename}`;

    await pool.query(
      `UPDATE customers SET image_profile = $1 WHERE customers_id = $2`,
      [imageUrl, customer_id]
    );


    res.status(200).json({
      success: true,
      imageUrl,
      message: 'Profile image uploaded and updated in customers table',
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
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
  getTotalCus,
  uploadProfileCus,
  roleNameToID,
  upload,
  getCusByEmail
};
