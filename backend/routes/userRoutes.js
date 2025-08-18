import express from 'express';
import Controller from '../controller/userController.js';

const rt = express.Router();

// Get all Users
rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllUser();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.get('/totalUser', async (req, res) => {
  try {
    const data = await Controller.getTotalUser();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

// Get User by ID
rt.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Controller.getUserById(id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

// Create new User
rt.post('/', async (req, res) => {
  const info = {
    role_id: req.body.role_id,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };

    if (!req.body.username){
        res.status(400).json({ status:'400',result: 'Username is required.' });
    }
    try {
        const check = await Controller.checkUser(info)
        if (!check) {
            const data = await Controller.createUser(info);
            res.status(201).json({ status: 201, result: data });
        }else {
            res.status(400).json({ status: '400', result: 'Already exists' });
        }
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Error creating User' });
    }
});


// Update User
rt.put('/:id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const info = await Controller.updateUser(user_id, req.body);
    console.log(user_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

// Force delete User
rt.delete('/:id', async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
        res.status(400).json({ status:'400', result: 'ID is requires.'})
    }
    try{
        const data = await Controller.deleteUser(user_id);
        res.status(200).json({ status: '200', result: data, desc: 'Deleted completed' });
    } catch (err){
        res.status(500).json({ status: '500', result: 'Server Error'});
    }
});

export default rt;
