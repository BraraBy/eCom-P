import express from 'express';
import Controller from '../controller/productController.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllPro();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/totalProducts', async (req, res) => {
  try {
    const data = await Controller.getTotalPro();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const data = await Controller.getProById(product_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    image_url: req.body.image_url,
    category_id: req.body.category_id,

  };

  if (!info.name) {
    return res.status(400).json({ status: '400', message: 'Product name are required.' });
  }

  try {
    const Check = await Controller.checkProName(info.name);

    if (Check) {
      return res.status(400).json({ status: '400', message: 'Already exists' });
    }

    const checkedPro = await Controller.createPro(info);
    return res.status(201).json({ status: '201', result: checkedPro});
  } catch (err) {
    console.error('Error Adding Product:', err);
    return res.status(500).json({ status: '500', message: 'Server Error' });
  }
});

rt.put('/:id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const info = await Controller.updatePro(product_id, req.body);
    console.log(product_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { product_id } = req.params;
    if (!product_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deletePro(product_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
