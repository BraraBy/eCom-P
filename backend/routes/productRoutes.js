import express from 'express';
import Controller from '../controller/productController.js';
import { upload, uploadFile } from '../utils/uploadImage.js';

const rt = express.Router();

// <-- เอา route ซ้ำตัวแรกออก (ที่ส่งทั้งหมดโดยไม่ดู query) -->

rt.get('/', async (req, res) => {
  try {
    const { category_id, category_slug } = req.query;

    let data;
    if (category_id) {
      data = await Controller.getProByCategoryId(category_id);
    } else if (category_slug) {
      data = await Controller.getProByCategorySlug(category_slug);
    } else {
      data = await Controller.getAllPro();
    }

    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    console.error(err);
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

rt.get('/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const data = await Controller.getProById(product_id);
    res.status(200).json({ status: '200', result: data });
  } catch (err) {
    res.status(500).json({ status: '500', result: 'Server Error' });
  }
});

rt.post('/', async (req, res) => {
  try {
    const { name, price, stock, image_url, category_id } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ 
        status: '400', 
        message: 'Product name is required' 
      });
    }

    try {
      const created = await Controller.createPro({
        name: name.trim(),
        price: Number(price || 0),
        stock: Number(stock || 0),
        image_url: image_url || null,
        category_id: category_id ? Number(category_id) : null,
      });

      res.status(201).json({ 
        status: '201', 
        result: created 
      });
    } catch (err) {
      if (err.message === 'Product name already exists') {
        return res.status(400).json({
          status: '400',
          message: 'Product name already exists'
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ 
      status: '500', 
      message: 'Server Error' 
    });
  }
});

rt.put('/:product_id', async (req, res) => {
  try {
    const id = Number(req.params.product_id);
    const { name, price, stock, image_url, category_id } = req.body || {};
    const updated = await Controller.updatePro(id, {
      name: name ?? undefined,
      price: price !== undefined ? Number(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      image_url: image_url ?? undefined,
      category_id: category_id ? Number(category_id) : undefined,
    });
    res.json({ status: '200', result: updated });
  } catch (e) {
    console.error('PUT /api/products error:', e);
    res.status(500).json({ status: '500', message: e.message || 'Server Error' });
  }
});

// Add this route for Firebase upload
rt.post('/upload-firebase', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: '400', 
        message: 'No file uploaded' 
      });
    }

    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ 
        status: '400', 
        message: 'Product ID is required' 
      });
    }

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(storage, `products/${req.file.originalname}_${dateTime}`);

    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef, 
      req.file.buffer, 
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update product with new image URL
    const client = await postgres.connect();
    try {
      await client.query(
        'UPDATE products SET image_url = $1 WHERE product_id = $2',
        [downloadURL, product_id]
      );
    } finally {
      client.release();
    }

    res.status(200).json({
      status: '200',
      message: 'File uploaded successfully',
      downloadURL
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      status: '500', 
      message: 'File upload failed' 
    });
  }
});

rt.delete('/:product_id', async (req, res) => {
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
