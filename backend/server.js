import express from 'express';
import dotenv from 'dotenv'; 
import cors from 'cors';

dotenv.config({ path: 'setting.env' });

const app = express();
const port = process.env.WEB_PORT;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import categoryRoutes from './routes/categoryRoutes.js' ;
import customersRoutes from './routes/customersRoutes.js' ;
import faceRoutes from './routes/faceRoutes.js' ;
import order_detailsRoutes from './routes/order_detilsRoutes.js' ;
import orderRoutes from './routes/orderRoutes.js' ;
import productRoutes from './routes/productRoutes.js' ;
import roleRoutes from './routes/roleRoute.js' ;
import userRoutes from './routes/userRoutes.js' ;
import uploadRoutes from './routes/uploadRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js' ;
 
// Use student routes
app.use('/api/category', categoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/facedata', faceRoutes);
app.use('/api/order_details', order_detailsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/promotions', promotionRoutes);

app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(` Server is running on PORT ${port}`);
});

