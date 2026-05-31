import { Router } from 'express';
import Event from '../models/Event.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/events — all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name avatar')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении событий' });
  }
});

// POST /api/events — create event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, image, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Название и дата события обязательны' });
    }

    const event = await Event.create({
      title,
      description: description || '',
      date,
      image: image || '',
      type: type || 'event',
      createdBy: req.user.id,
    });

    await event.populate('createdBy', 'name avatar');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании события' });
  }
});

// PUT /api/events/:id — update event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Событие не найдено' });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этого события' });
    }

    const { title, description, date, image, type } = req.body;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (image !== undefined) event.image = image;
    if (type !== undefined) event.type = type;

    await event.save();
    await event.populate('createdBy', 'name avatar');

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении события' });
  }
});

// DELETE /api/events/:id — delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Событие не найдено' });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления этого события' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Событие удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении события' });
  }
});

export default router;
