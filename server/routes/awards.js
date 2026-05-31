import { Router } from 'express';
import Award from '../models/Award.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/awards — all awards
router.get('/', async (req, res) => {
  try {
    const awards = await Award.find()
      .populate('nominees.user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(awards);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении наград' });
  }
});

// POST /api/awards — create award (admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { category, description, icon } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Категория награды обязательна' });
    }

    const award = await Award.create({
      category,
      description: description || '',
      icon: icon || '🏆',
      createdBy: req.user.id,
    });

    res.status(201).json(award);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании награды' });
  }
});

// PUT /api/awards/:id — update award (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Награда не найдена' });
    }

    const { category, description, icon, isActive } = req.body;
    if (category !== undefined) award.category = category;
    if (description !== undefined) award.description = description;
    if (icon !== undefined) award.icon = icon;
    if (isActive !== undefined) award.isActive = isActive;

    await award.save();
    await award.populate('nominees.user', 'name avatar');

    res.json(award);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении награды' });
  }
});

// DELETE /api/awards/:id — delete award (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Награда не найдена' });
    }

    await Award.findByIdAndDelete(req.params.id);
    res.json({ message: 'Награда удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении награды' });
  }
});

// POST /api/awards/:id/nominate — nominate a user
router.post('/:id/nominate', async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Награда не найдена' });
    }

    if (!award.isActive) {
      return res.status(400).json({ message: 'Голосование по этой награде закрыто' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Укажите пользователя для номинации' });
    }

    // Check if already nominated
    const alreadyNominated = award.nominees.some(
      (n) => n.user.toString() === userId
    );

    if (alreadyNominated) {
      return res.status(400).json({ message: 'Этот пользователь уже номинирован' });
    }

    award.nominees.push({ user: userId, votes: [] });
    await award.save();
    await award.populate('nominees.user', 'name avatar');

    res.json(award);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при номинации' });
  }
});

// POST /api/awards/:id/vote — vote for a nominee
router.post('/:id/vote', async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Награда не найдена' });
    }

    if (!award.isActive) {
      return res.status(400).json({ message: 'Голосование по этой награде закрыто' });
    }

    const { nomineeUserId } = req.body;

    if (!nomineeUserId) {
      return res.status(400).json({ message: 'Укажите номинанта для голосования' });
    }

    // Find the nominee
    const nominee = award.nominees.find(
      (n) => n.user.toString() === nomineeUserId
    );

    if (!nominee) {
      return res.status(404).json({ message: 'Номинант не найден' });
    }

    // Remove previous vote from any nominee (one vote per user per award)
    for (const n of award.nominees) {
      const voteIndex = n.votes.indexOf(req.user.id);
      if (voteIndex !== -1) {
        n.votes.splice(voteIndex, 1);
      }
    }

    // Add vote to chosen nominee
    nominee.votes.push(req.user.id);

    await award.save();
    await award.populate('nominees.user', 'name avatar');

    res.json(award);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при голосовании' });
  }
});

export default router;
