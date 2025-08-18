import express from 'express';
import Controller from '../controller/faceController.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllFac();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const data = await Controller.getFacById(customer_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    image_data: req.body.image_data,
  };

    try {
      const data = await Controller.createFac(info);
      console.log(info);
      
      res.status(200).json({ status: '200', result: data });
    } catch (err) {
      res.status(500).json({ status: '500', result: 'Server Error' });
    }
});

rt.put('/:id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const info = await Controller.updateFac(customer_id, req.body);
    console.log(customer_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { customer_id } = req.params;
    if (!customer_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteFac(customer_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
