import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiHeart, FiSend, FiTrash2, FiMessageCircle, FiFeather } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const POST_TYPES = [
  { value: 'memory',       label: 'Воспоминание', accent: '#C9A555' },
  { value: 'wish',         label: 'Пожелание',    accent: '#60A5FA' },
  { value: 'story',        label: 'История',      accent: '#A78BFA' },
  { value: 'announcement', label: 'Объявление',   accent: '#34D399' },
];

const TYPE_LABEL = { memory: 'Воспоминание', wish: 'Пожелание', story: 'История', announcement: 'Объявление' };
const TYPE_COLOR = { memory: '#C9A555', wish: '#60A5FA', story: '#A78BFA', announcement: '#34D399' };

function timeAgo(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { locale: ru, addSuffix: true }); }
  catch { return ''; }
}

function Avatar({ name, avatar, size = 36 }) {
  const initials = name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,165,85,0.3)', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A555, #836030)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: size * 0.3 + 'px', color: '#07070C', flexShrink: 0, boxShadow: '0 0 12px rgba(201,165,85,0.2)' }}>
      {initials}
    </div>
  );
}

function Card3D({ children, style, intensity = 6 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 280, damping: 28 });
  const onMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);
  const onMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800, ...style }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </motion.div>
  );
}

export default function Wall() {
  const { user } = useAuth();
  const [posts, setPosts]         = useState([]);
  const [content, setContent]     = useState('');
  const [type, setType]           = useState('memory');
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data.posts || data);
    } catch { toast.error('Не удалось загрузить стену'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/posts', { content: content.trim(), type });
      setPosts((prev) => [data.post || data, ...prev]);
      setContent('');
      toast.success('Запись добавлена!');
    } catch { toast.error('Не удалось добавить запись'); }
    finally { setSubmitting(false); }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => (p._id || p.id) === postId ? { ...p, likes: data.likes } : p));
    } catch { toast.error('Не удалось поставить лайк'); }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Удалить эту запись?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      toast.success('Запись удалена');
    } catch { toast.error('Не удалось удалить запись'); }
  };

  const isOwner = (post) => user?._id === post.author?._id || user?.id === post.author?._id || user?._id === post.author?.id || user?.id === post.author?.id || user?.role === 'admin';

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Grain */}
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '10%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
        {/* Hero */}
        <div style={{ position: 'relative', borderBottom: '1px solid rgba(201,165,85,0.08)', overflow: 'hidden' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1.5rem 2.5rem', textAlign: 'center', position: 'relative' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.4rem 1rem', background: 'rgba(201,165,85,0.06)', border: '1px solid rgba(201,165,85,0.15)', borderRadius: 100, marginBottom: '1.5rem' }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A555', display: 'inline-block' }} />
                </motion.span>
                <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(201,165,85,0.7)' }}>Выпуск 2025–2026</span>
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#EDE0C4', margin: '0 0 0.75rem', lineHeight: 1.1 }}>
                Стена воспоминаний
              </h1>
              <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.9rem', color: '#3A3840', letterSpacing: '0.03em' }}>
                Делитесь историями, пожеланиями и воспоминаниями с одноклассниками
              </p>
            </motion.div>
          </div>
        </div>

        <div style={{ maxWidth: '46rem', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Compose */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.55 }}>
            <Card3D intensity={4} style={{ borderRadius: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(201,165,85,0.15)', borderRadius: 20, padding: '1.5rem', backdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.35), transparent)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                  <Avatar name={user?.name} avatar={user?.avatar} size={38} />
                  <div>
                    <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#EDE0C4', margin: 0 }}>{user?.name || 'Вы'}</p>
                    <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: '#3A3840', margin: 0 }}>Поделитесь чем-то с классом</p>
                  </div>
                </div>

                {/* Type selector */}
                <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {POST_TYPES.map((t) => (
                    <motion.button key={t.value} type="button" onClick={() => setType(t.value)}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '0.35rem 0.9rem', borderRadius: 8, cursor: 'pointer',
                        fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.05em',
                        border: `1px solid ${type === t.value ? t.accent + '50' : 'rgba(255,255,255,0.08)'}`,
                        background: type === t.value ? t.accent + '18' : 'rgba(255,255,255,0.04)',
                        color: type === t.value ? t.accent : '#3A3840',
                        transition: 'all 0.2s',
                      }}>
                      {t.label}
                    </motion.button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Поделитесь воспоминанием с классом..." rows={4}
                    style={{
                      width: '100%', padding: '0.9rem 1rem',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.1)',
                      borderRadius: 12, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem',
                      outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.3)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.1)'}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem' }}>
                    <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', color: '#2A2830' }}>
                      {content.length > 0 && `${content.length} символов`}
                    </span>
                    <motion.button type="submit" disabled={submitting || !content.trim()}
                      whileHover={!submitting && content.trim() ? { scale: 1.04, y: -1 } : {}}
                      whileTap={!submitting && content.trim() ? { scale: 0.97 } : {}}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '0.65rem 1.4rem',
                        background: submitting || !content.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #E2C87A, #C9A555)',
                        border: 'none', borderRadius: 9, cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
                        fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: '0.72rem',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: submitting || !content.trim() ? '#3A3840' : '#07070C',
                        boxShadow: submitting || !content.trim() ? 'none' : '0 4px 16px rgba(201,165,85,0.25)',
                        transition: 'all 0.25s',
                      }}>
                      {submitting ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(7,7,12,0.3)', borderTopColor: '#07070C', animation: 'spin 0.8s linear infinite' }} />
                        : <FiSend style={{ width: 13, height: 13 }} />}
                      {submitting ? 'Отправка...' : 'Опубликовать'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </Card3D>
          </motion.div>

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
              </div>
            </div>
          ) : posts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 0' }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <FiFeather style={{ width: 40, height: 40, color: '#2A2830', margin: '0 auto 1rem' }} />
              </motion.div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.4rem', color: 'rgba(237,224,196,0.35)' }}>Стена пуста — будьте первым</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post, i) => {
                const postId = post._id || post.id;
                const likeCount = post.likes?.length ?? post.likesCount ?? 0;
                const accent = TYPE_COLOR[post.type] || '#C9A555';
                const typeLabel = TYPE_LABEL[post.type] || 'Запись';
                return (
                  <motion.div key={postId || i} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i < 8 ? i * 0.05 : 0 }}>
                    <Card3D intensity={5} style={{ borderRadius: 18 }}>
                      <motion.div whileHover={{ scale: 1.005 }}
                        style={{
                          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(201,165,85,0.1)', borderRadius: 18, padding: '1.25rem 1.4rem',
                          position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'}
                      >
                        {/* Left accent bar */}
                        <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 2, background: accent, borderRadius: '0 2px 2px 0', opacity: 0.5 }} />

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={post.author?.name} avatar={post.author?.avatar} size={34} />
                            <div>
                              <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#EDE0C4', margin: 0 }}>{post.author?.name || 'Аноним'}</p>
                              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', color: '#2A2830', margin: 0 }}>{timeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '0.25rem 0.65rem', background: accent + '15', border: `1px solid ${accent}30`, borderRadius: 6, color: accent }}>
                              {typeLabel}
                            </span>
                            {isOwner(post) && (
                              <motion.button onClick={() => handleDelete(postId)}
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#3A3840', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#3A3840'}>
                                <FiTrash2 style={{ width: 14, height: 14 }} />
                              </motion.button>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.88rem', color: '#9A9098', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '0.85rem', paddingLeft: 16 }}>
                          {post.content}
                        </p>

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: '0.65rem', borderTop: '1px solid rgba(201,165,85,0.06)', paddingLeft: 16 }}>
                          <motion.button onClick={() => handleLike(postId)}
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#3A3840', transition: 'color 0.2s', fontFamily: '"Jost", sans-serif', fontSize: '0.78rem' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#FB7185'}
                            onMouseLeave={e => e.currentTarget.style.color = '#3A3840'}>
                            <FiHeart style={{ width: 14, height: 14 }} />
                            <span>{likeCount}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    </Card3D>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
