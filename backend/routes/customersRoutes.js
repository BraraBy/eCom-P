import express from 'express';
import Controller from '../controller/customersController';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllCus();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/totalCustomers', async (req, res) => {
  try {
    const data = await Controller.getTotalCus();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/:id', async (req, res) => {
  const { customers_id } = req.params;
  try {
    const data = await Controller.getCusById(customers_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,
    address: req.body.address,
  };

  if (!info.first_name || !info.last_name) {
    return res.status(400).json({ status: '400', message: 'First name and last name are required.' });
  }

  try {
    const Check = await Controller.checkCus(info.first_name, info.last_name);

    if (Check) {
      return res.status(400).json({ status: '400', message: 'Already exists' });
    }

    const checkedCus = await Controller.createCus(info);
    return res.status(201).json({ status: '201', result: checkedCus});
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ status: '500', message: 'Server Error' });
  }
});

rt.put('/:id', async (req, res) => {
  const { customers_id } = req.params;
  try {
    const info = await Controller.updateCus(customers_id, req.body);
    console.log(customers_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { customers_id } = req.params;
    if (!customers_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteCus(customers_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
