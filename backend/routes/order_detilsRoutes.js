import express from 'express';
import Controller from '../controller/order_detailsController.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllOdd();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { order_details_id } = req.params;
  try {
    const data = await Controller.getOddById(order_details_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    order_id: req.body.order_id,
    product_id: req.body.product_id,
    quantity: req.body.quantity,
    price: req.body.price,
  };
    try {
      const data = await Controller.createOdd(info);
      console.log(info);
      
      res.status(200).json({ status: '200', result: data });
    } catch (err) {
      res.status(500).json({ status: '500', result: 'Server Error' });
    }
});

rt.put('/:id', async (req, res) => {
  const { order_details_id } = req.params;
  try {
    const info = await Controller.updateOdd(order_details_id, req.body);
    console.log(order_details_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { order_details_id } = req.params;
    if (!order_details_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteOdd(order_details_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
