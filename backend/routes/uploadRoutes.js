import express from 'express';
import { upload, uploadProductImage } from '../utils/uploadImage.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/product', requireAuth, upload.single('file'), uploadProductImage);

export default router;