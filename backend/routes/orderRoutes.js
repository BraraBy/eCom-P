import express from 'express';
import Controller from '../controller/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllOrd();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/', requireAuth, async (req, res) => {
  // req.user มี { customers_id, email, role }
  // ถ้าต้องการเฉพาะ owner: filter ด้วย customers_id
  try {
    const data = await Controller.getAllOrdByCustomer(req.user.customers_id);
    res.status(200).json({ status: '200', result: data });
  } catch {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const data = await Controller.getOrdById(order_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { order_id } = req.params;
    if (!order_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteOrd(order_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
