import { Router } from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/users — all approved users
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { approved: true };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// GET /api/users/stats/class — fun class stats
router.get('/stats/class', async (req, res) => {
  try {
    const users = await User.find({ approved: true }).select('-password');
    const totalGraduates = users.length;

    // Most common dream
    const dreams = users.map((u) => u.dream).filter(Boolean);
    const dreamCounts = {};
    dreams.forEach((d) => {
      dreamCounts[d] = (dreamCounts[d] || 0) + 1;
    });
    const mostCommonDream =
      Object.entries(dreamCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Не указано';

    // Most common favorite subject
    const subjects = users.map((u) => u.favoriteSubject).filter(Boolean);
    const subjectCounts = {};
    subjects.forEach((s) => {
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    });
    const mostCommonSubject =
      Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Не указано';

    // Total achievements
    const totalAchievements = users.reduce((sum, u) => sum + (u.achievements?.length || 0), 0);

    // Most common favorite teacher
    const teachers = users.map((u) => u.favoriteTeacher).filter(Boolean);
    const teacherCounts = {};
    teachers.forEach((t) => {
      teacherCounts[t] = (teacherCounts[t] || 0) + 1;
    });
    const mostCommonTeacher =
      Object.entries(teacherCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Не указано';

    res.json({
      totalGraduates,
      mostCommonDream,
      mostCommonSubject,
      mostCommonTeacher,
      totalAchievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

// GET /api/users/:id — single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
});

// PUT /api/users/:id — update profile
router.put('/:id', async (req, res) => {
  try {
    // Only own profile or admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этого профиля' });
    }

    const allowedFields = [
      'name',
      'bio',
      'quote',
      'dream',
      'phone',
      'socialLinks',
      'achievements',
      'nickname',
      'favoriteMemory',
      'favoriteTeacher',
      'favoriteSubject',
      'avatar',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

export default router;
