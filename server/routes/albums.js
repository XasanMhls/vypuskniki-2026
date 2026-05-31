import { Router } from 'express';
import Album from '../models/Album.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/albums — albums visible to current user
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user.id },
      ],
    })
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
    const { title, description, coverImage, isPublic } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Название альбома обязательно' });
    }

    const album = await Album.create({
      title,
      description: description || '',
      coverImage: coverImage || '',
      createdBy: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
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

    // Check access: public or creator/admin
    const isCreator = album.createdBy._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!album.isPublic && !isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Этот альбом приватный' });
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

    const { title, description, coverImage, isPublic } = req.body;
    if (title !== undefined) album.title = title;
    if (description !== undefined) album.description = description;
    if (coverImage !== undefined) album.coverImage = coverImage;
    if (isPublic !== undefined) album.isPublic = isPublic;

    await album.save();
    await album.populate('createdBy', 'name avatar');

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении альбома' });
  }
});

// PATCH /api/albums/:id/privacy — toggle public/private
router.patch('/:id/privacy', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Альбом не найден' });

    if (album.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав' });
    }

    album.isPublic = !album.isPublic;
    await album.save();
    res.json({ isPublic: album.isPublic });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при изменении видимости' });
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

// POST /api/albums/:id/photos — add photo/video (any authenticated user)
router.post('/:id/photos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    const { url, caption } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL медиафайла обязателен' });
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
    res.status(500).json({ message: 'Ошибка при добавлении медиафайла' });
  }
});

// DELETE /api/albums/:id/photos/:photoId — remove photo/video
router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Альбом не найден' });
    }

    const photo = album.photos.id(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Медиафайл не найден' });
    }

    const isUploader = photo.uploadedBy?.toString() === req.user.id;
    const isCreator = album.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUploader && !isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Нет прав для удаления этого медиафайла' });
    }

    album.photos.pull({ _id: req.params.photoId });
    await album.save();

    await album.populate('photos.uploadedBy', 'name avatar');
    await album.populate('createdBy', 'name avatar');

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении медиафайла' });
  }
});

export default router;
