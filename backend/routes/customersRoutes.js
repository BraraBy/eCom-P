import express from 'express';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: '401', message: 'Invalid email or password' });
    }

    // ไม่ส่ง password กลับ
    delete user.password;

    // สร้าง token
    const accessToken = signAccessToken({
      customers_id: user.customers_id,
      email: user.email,
      role: user.role_id
    });

    // (ตัวเลือก) refresh token
    let refreshToken = null;
    if (process.env.JWT_REFRESH_SECRET) {
      refreshToken = signRefreshToken({
        customers_id: user.customers_id,
        email: user.email,
        role: user.role_id
      });
    }

    return res.status(200).json({
      status: '200',
      result: {
        user,
        accessToken,
        refreshToken, // ถ้าไม่ใช้ refresh ก็เอาออกได้
      }
    });
  } catch (err) {
    return res.status(500).json({ status: '500', message: 'Server Error' });
  }
});

rt.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ status: '400', message: 'Missing refresh token' });

    const payload = verifyRefreshToken(refreshToken);
    // ออก access token ใหม่
    const accessToken = signAccessToken({
      customers_id: payload.customers_id,
      email: payload.email,
      role: payload.role
    });

    return res.status(200).json({ status: '200', result: { accessToken }});
  } catch (err) {
    return res.status(401).json({ status: '401', message: 'Invalid refresh token' });
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

rt.get('/:customers_id', async (req, res) => {
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

  if (!info.first_name || !info.last_name || !info.email || !info.password) {
    return res.status(400).json({ status: '400', message: 'Missing required fields.' });
  }

  try {
    const roleIdTrans = await Controller.roleNameToID(info.role);
    const created = await Controller.createCus({ ...info, role_id: roleIdTrans });
    return res.status(201).json({ status: '201', result: created });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ status: String(code), message: err.message || 'Server Error' });
  }
});


rt.put('/:customers_id', async (req, res) => {
  const { customers_id } = req.params;
  try {
    const info = await Controller.updateCus(customers_id, req.body);
    console.log(customers_id,req.body);
    
    res.status(200).json({ status: '200', result: info });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.delete('/:customers_id', async (req, res) => {
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
