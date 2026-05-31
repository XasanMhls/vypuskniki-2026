import { Router } from 'express';
import Album from '../models/Album.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/albums — all albums
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find()
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении альбомов' });
  }
});

// POST /api/albums — create album
router.post('/', async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Название альбома обязательно' });
    }

    const album = await Album.create({
      title,
      description: description || '',
      coverImage: coverImage || '',
      createdBy: req.user.id,
    });

    await album.populate('createdBy', 'name avatar');
    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании альбома' });
  }
});

// GET /api/albums/:id — single album
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('photos.uploadedBy', 'name avatar');

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении альбома' });
  }
});

// PUT /api/albums/:id — update album
router.put('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    if (album.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этого альбома' });
    }

    const { title, description, coverImage } = req.body;
    if (title !== undefined) album.title = title;
    if (description !== undefined) album.description = description;
    if (coverImage !== undefined) album.coverImage = coverImage;

    await album.save();
    await album.populate('createdBy', 'name avatar');

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении альбома' });
  }
});

// DELETE /api/albums/:id — delete album
router.delete('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    if (album.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления этого альбома' });
    }

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: 'Альбом удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении альбома' });
  }
});

// POST /api/albums/:id/photos — add photo
router.post('/:id/photos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    const { url, caption } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL фотографии обязателен' });
    }

    album.photos.push({
      url,
      caption: caption || '',
      uploadedBy: req.user.id,
    });

    await album.save();
    await album.populate('photos.uploadedBy', 'name avatar');
    await album.populate('createdBy', 'name avatar');

    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении фотографии' });
  }
});

// DELETE /api/albums/:id/photos/:photoId — remove photo
router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    const photo = album.photos.id(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Фотография не найдена' });
    }

    if (photo.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления этой фотографии' });
    }

    album.photos.pull({ _id: req.params.photoId });
    await album.save();

    await album.populate('photos.uploadedBy', 'name avatar');
    await album.populate('createdBy', 'name avatar');

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении фотографии' });
  }
});

export default router;
