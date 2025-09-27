import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import multer from 'multer';
import postgres from './db.js';

import dotenv from 'dotenv';
dotenv.config({ path: 'setting.env' });

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    return date + ' ' + time;
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const { customer_id } = req.body;
        if (!customer_id) {
            return res.status(400).send('No customer_id provided.');
        }
        
        const dateTime = giveCurrentDateTime();
        const storageRef = ref(storage, `eCom-P/${req.file.originalname}_${dateTime}`) ;

        const metadata = {
            contentType: req.file.mimetype,
        };

        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);

        const downloadURL = await getDownloadURL(snapshot.ref);

        const client = await postgres.connect();
        try {
            await client.query(
                'UPDATE customers SET image_profile = $1 WHERE customers_id = $2;',
                [downloadURL, customer_id]
            );
        } finally {
            client.release();
        }
              
        return res.send({
            message: 'File uploaded to Firebase storage',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).send('File upload failed. Please try again.');
    }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `eCom-P/products/${Date.now()}_${req.file.originalname}_${dateTime}`
    );
    const metadata = { contentType: req.file.mimetype };

    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const { product_id } = req.body || {};
    if (product_id) {
      const client = await postgres.connect();
      try {
        await client.query(
          'UPDATE products SET image_url = $1 WHERE product_id = $2;',
          [downloadURL, Number(product_id)]
        );
      } finally {
        client.release();
      }
    }

    return res.status(200).json({
      message: 'File uploaded to Firebase storage',
      downloadURL,
      name: req.file.originalname,
      type: req.file.mimetype,
      product_id: product_id ? Number(product_id) : null,
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return res.status(500).json({ message: 'File upload failed. Please try again.' });
  }
};

export { upload, uploadFile, uploadProductImage };
