import pool from 'pg';
const { Pool } = pool;

import dotenv from 'dotenv';
dotenv.config({ path: 'setting.env' });

// psql -U postgres -h localhost -d database -p 5432
const postgres = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default postgres;
