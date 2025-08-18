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
    // databaseURL: process.env.FIRESTORE_DB_URL,
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

        // Get customer_id from request body
        const customer_id = req.body.customer_id;
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

        // Save downloadURL to PostgreSQL
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

export { upload, uploadFile };