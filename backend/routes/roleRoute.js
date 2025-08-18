import express from 'express';
import Controller from '../controller/roleController.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllRole();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  const info = {
    rolename: req.body.order_id,
  };
    try {
      const data = await Controller.createRole(info);
      console.log(info);
      
      res.status(200).json({ status: '200', result: data });
    } catch (err) {
      res.status(500).json({ status: '500', result: 'Server Error' });
    }
});

rt.put('/:id', async (req, res) => {
  const { role_id } = req.params;
  try {
    const info = await Controller.updateRole(role_id, req.body);
    console.log(role_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:id', async (req, res) => {
    const { role_id } = req.params;
    if (!role_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteRole(role_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
