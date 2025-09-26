import express from 'express';
import Controller from '../controller/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const rt = express.Router();

rt.get('/all', async (req, res) => {
  try {
    const data = await Controller.getAllOrd();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/', requireAuth, async (req, res) => {
  try {
    const data = await Controller.getAllOrdByCustomer(req.user.customers_id);
    res.status(200).json({ status: '200', result: data });
  } catch {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:order_id/items', requireAuth, async (req, res) => {
  const { order_id } = req.params;
  try {
    const items = await Controller.getItemsByOrderForCustomer(order_id, req.user.customers_id);
    res.status(200).json({ status: '200', result: items });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:order_id', requireAuth, async (req, res) => {
  const { order_id } = req.params;
  try {
    const data = await Controller.getOrdById(order_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', requireAuth, async (req, res) => {
  try {
    const { total_amount, items } = req.body || {};
    if (total_amount === undefined) {
      return res.status(400).json({ status: '400', result: 'Missing total_amount' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: '400', result: 'No items' });
    }
    const result = await Controller.createOrderWithItems(
      req.user.customers_id,
      items,
      Number(total_amount) || 0
    );
    return res.status(201).json({ status: '201', result });
  } catch (err) {
    const msg = String(err?.message || '');
    if (msg.startsWith('INSUFFICIENT_STOCK')) {
      const [, pid, name, have, need] = msg.split(':');
      return res
        .status(409)
        .json({ status: '409', result: `Stock not enough for "${name}" (have ${have}, need ${need})` });
    }
    if (msg.startsWith('PRODUCT_NOT_FOUND')) {
      return res.status(404).json({ status: '404', result: 'Product not found' });
    }
    if (msg === 'UNAUTHORIZED') {
      return res.status(401).json({ status: '401', result: 'Please login' });
    }
    console.error(err);
    return res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:order_id', async (req, res) => {
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
