import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// เสิร์ฟไฟล์ static จาก build ของ React
app.use(express.static(path.join(__dirname, 'build')));

// กรณี request ใดๆ ให้ส่งกลับไฟล์ index.html ซึ่งถูกสร้างขึ้นจาก React build
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 4200;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
