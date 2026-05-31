import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiPlus, FiX, FiImage } from 'react-icons/fi';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AlbumCard from '../components/AlbumCard.jsx';

function Card3D({ children, style, intensity = 12 }) {
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
    <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900, ...style }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </motion.div>
  );
}

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/albums');
      setAlbums(data.albums || data);
    } catch { setError('Не удалось загрузить альбомы'); }
    finally { setLoading(false); }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/albums', { title: title.trim(), description: description.trim() });
      setAlbums((prev) => [data.album || data, ...prev]);
      setTitle(''); setDescription(''); setShowModal(false);
      toast.success('Альбом создан!');
    } catch (err) { toast.error(err.response?.data?.message || 'Не удалось создать альбом'); }
    finally { setCreating(false); }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,85,0.15)',
    borderRadius: 10, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem',
    outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Grain */}
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ paddingTop: '2.5rem', paddingBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.55)' }} />
                <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>
                  Фотоальбомы
                </span>
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>
                Наши альбомы
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #E2C87A, #C9A555)',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.75rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#07070C',
                boxShadow: '0 4px 20px rgba(201,165,85,0.25)',
              }}
            >
              <FiPlus style={{ width: 14, height: 14 }} />
              Создать альбом
            </motion.button>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: 16 }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
              </div>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(201,165,85,0.4)', textTransform: 'uppercase' }}>Загрузка</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: '"Jost", sans-serif', color: '#ef4444', marginBottom: 16 }}>{error}</p>
              <button onClick={fetchAlbums} className="btn-gold-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.78rem' }}>Попробовать снова</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && albums.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FiImage style={{ width: 56, height: 56, color: '#2A2830', margin: '0 auto 1.5rem' }} />
              </motion.div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.6rem', color: 'rgba(237,224,196,0.4)', marginBottom: 8 }}>Альбомов пока нет</p>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#3A3840' }}>Будьте первым — создайте фотоальбом!</p>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && albums.length > 0 && (
            <motion.div initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}
            >
              {albums.map((album) => (
                <motion.div key={album._id || album.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } } }}>
                  <Card3D style={{ borderRadius: 20 }}>
                    <AlbumCard album={album} />
                  </Card3D>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ width: '100%', maxWidth: 440, background: '#0F0F18', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.5), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', color: '#EDE0C4', margin: 0 }}>Новый альбом</h2>
                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: '#6B6570', cursor: 'pointer', padding: 4 }}>
                  <FiX style={{ width: 18, height: 18 }} />
                </motion.button>
              </div>
              <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Название</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Выпускной вечер..."
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <div>
                  <label style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Описание</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Краткое описание..."
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <motion.button type="submit" disabled={creating || !title.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '0.9rem', marginTop: 4,
                    background: creating || !title.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #E2C87A, #C9A555)',
                    border: 'none', borderRadius: 10, cursor: creating || !title.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: '0.75rem',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: creating || !title.trim() ? '#3A3840' : '#07070C',
                    transition: 'all 0.3s',
                  }}>
                  {creating ? 'Создание...' : 'Создать альбом'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
