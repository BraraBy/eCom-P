import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Controller from '../controller/customersController.js';

// firebase upload
import { upload, uploadFile } from '../utils/uploadImage.js';

const rt = express.Router();

rt.get('/', async (req, res) => {
  try {
    const data = await Controller.getAllCus();
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Controller.getCusByEmail({ email });
    if (!user) {
      return res.status(401).json({ status: '401', message: 'Invalid email or password' });
    }
    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Remove password before sending user data
      delete user.password;
      // Create JWT token
      const token = jwt.sign(
        { customers_id: user.customers_id, email: user.email, role: user.role_id },
        process.env.JWT_SECRET, // Use a strong secret in production, store in env
        { expiresIn: '1h' }
      );
      return res.status(200).json({ status: '200', user, token });
    } else {
      return res.status(401).json({ status: '401', message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ status: '500', message: 'Server Error' });
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

rt.post('/upload-firebase', upload.single('image'), uploadFile);

rt.post('/', upload.none(), async (req, res) => {
  let info = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,
    address: req.body.address,
    role: req.body.role ? req.body.role : 'customer',
    email: req.body.email,
    password: req.body.password,
  };

  if (!info.first_name || !info.last_name) {
    return res.status(400).json({ status: '400', message: 'First name and last name are required.' });
  }

  try {
    const Check = await Controller.checkCus(info);
    const roleIdTrans = await Controller.roleNameToID(info.role)
    info.role = roleIdTrans;

    if (Check) {
      return res.status(400).json({ status: '400', message: 'Email Already exists' });
    }

    // Hash the password before saving
    const saltRounds = 10;
    info.password = await bcrypt.hash(info.password, saltRounds);

    const checkedCus = await Controller.createCus(info);
    return res.status(201).json({ status: '201', result: checkedCus, uploadID: checkedCus[0].customers_id });
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
