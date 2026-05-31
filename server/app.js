import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import albumRoutes from './routes/albums.js';
import postRoutes from './routes/posts.js';
import awardRoutes from './routes/awards.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS — allow localhost, Render, Vercel, and any custom origin
app.use(cors({
  origin: (origin, cb) => {
    if (
      !origin ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /\.vercel\.app$/.test(origin) ||
      process.env.ALLOWED_ORIGIN === origin
    ) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Ensure DB is connected before every request (cached — essentially free after first call)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// API routes
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/albums',  albumRoutes);
app.use('/api/posts',   postRoutes);
app.use('/api/awards',  awardRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/upload',  uploadRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Serve React build in production (Render / local prod)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const dist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

export default app;
