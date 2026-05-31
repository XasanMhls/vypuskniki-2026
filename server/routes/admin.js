import { Router } from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Album from '../models/Album.js';
import Award from '../models/Award.js';
import Event from '../models/Event.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

// All routes require auth + admin
router.use(auth, adminOnly);

// GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// PUT /api/admin/users/:id — update user (approved, role)
router.put('/users/:id', async (req, res) => {
  try {
    // Cannot change own role
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя изменить свою собственную роль' });
    }

    const { approved, role } = req.body;
    const updates = {};
    if (approved !== undefined) updates.approved = approved;
    if (role !== undefined) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Cannot delete self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя удалить свой собственный аккаунт' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

// GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, approvedUsers, pendingUsers, totalPosts, totalAlbums, totalAwards, totalEvents] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ approved: true }),
        User.countDocuments({ approved: false }),
        Post.countDocuments(),
        Album.countDocuments(),
        Award.countDocuments(),
        Event.countDocuments(),
      ]);

    // Total photos across all albums
    const albumsWithPhotos = await Album.find().select('photos');
    const totalPhotos = albumsWithPhotos.reduce(
      (sum, album) => sum + (album.photos?.length || 0),
      0
    );

    res.json({
      totalUsers,
      approvedUsers,
      pendingUsers,
      totalPosts,
      totalAlbums,
      totalPhotos,
      totalAwards,
      totalEvents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

export default router;
