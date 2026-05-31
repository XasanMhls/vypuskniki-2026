import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';

const router = Router();

// Multer config: store in memory, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/upload — upload file, return base64 data URL
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    res.json({ url: dataUrl });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при загрузке файла' });
  }
});

export default router;
