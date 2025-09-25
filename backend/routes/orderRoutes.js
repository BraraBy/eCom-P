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

rt.post("/", requireAuth, async (req, res) => {
  try {
    const { total_amount, items } = req.body;
    if (!total_amount) {
      return res.status(400).json({ status: "400", result: "Missing total_amount" });
    }

    // 1. สร้าง order
    const order = await Controller.createOrd(req.user.customers_id, total_amount);

    // 2. สร้าง order_details
    if (Array.isArray(items)) {
      for (const it of items) {
        await import("../controller/order_detailsController.js").then(m =>
          m.default.createOdd({
            order_id: order.order_id,
            product_id: it.product_id,
            quantity: it.quantity,
            price: it.price,
          })
        );
      }
    }

    res.status(201).json({ status: "201", result: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "500", result: "Server Error" });
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
