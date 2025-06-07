import express from 'express';
import Controller from '../controller/categoryController.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllCate();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/totalCategory', async (req, res) => {
  try {
    const data = await Controller.getTotalCate();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { category_id } = req.params;
  try {
    const data = await Controller.getCateById(category_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    name: req.body.name
  };
    try {
      const data = await Controller.createCate(info);
      console.log(info);
      
      res.status(200).json({ status: '200', result: data });
    } catch (err) {
      res.status(500).json({ status: '500', result: 'Server Error' });
    }
});

rt.put('/:id', async (req, res) => {
  const { category_id } = req.params;
  try {
    const info = await Controller.updateCate(category_id, req.body);
    console.log(category_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { category_id } = req.params;
    if (!category_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteCate(category_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
