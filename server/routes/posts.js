import { Router } from 'express';
import Post from '../models/Post.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/posts — all posts
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type) {
      filter.type = type;
    }

    const posts = await Post.find(filter)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении записей' });
  }
});

// POST /api/posts — create post
router.post('/', async (req, res) => {
  try {
    const { content, image, type } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Содержание записи обязательно' });
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      image: image || '',
      type: type || 'memory',
    });

    await post.populate('author', 'name avatar');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании записи' });
  }
});

// PUT /api/posts/:id — update post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этой записи' });
    }

    const { content, image, type, isPinned } = req.body;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (type !== undefined) post.type = type;
    if (isPinned !== undefined) post.isPinned = isPinned;

    await post.save();
    await post.populate('author', 'name avatar');
    await post.populate('comments.author', 'name avatar');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении записи' });
  }
});

// DELETE /api/posts/:id — delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления этой записи' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении записи' });
  }
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('author', 'name avatar');
    await post.populate('comments.author', 'name avatar');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении лайка' });
  }
});

// POST /api/posts/:id/comment — add comment
router.post('/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Текст комментария обязателен' });
    }

    post.comments.push({
      author: req.user.id,
      text,
    });

    await post.save();
    await post.populate('author', 'name avatar');
    await post.populate('comments.author', 'name avatar');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
});

export default router;
