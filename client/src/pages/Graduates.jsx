import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiSearch, FiUsers } from 'react-icons/fi';
import api from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import GraduateCard from '../components/GraduateCard.jsx';

function Card3D({ children, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
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

export default function Graduates() {
  const [graduates, setGraduates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGraduates = useCallback(async (query) => {
    try {
      setLoading(true);
      setError('');
      const params = query ? { search: query } : {};
      const { data } = await api.get('/users', { params });
      setGraduates(data.users || data);
    } catch {
      setError('Не удалось загрузить список выпускников');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchGraduates(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchGraduates]);

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Grain */}
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      {/* Ambient orb */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.55)' }} />
              <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>
                Выпуск · 2025–2026
              </span>
            </div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>
              Наши выпускники
            </h1>
            <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.9rem', color: '#3A3840', marginTop: '0.75rem', letterSpacing: '0.04em' }}>
              Все одноклассники в одном месте
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ maxWidth: 520, marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,165,85,0.4)', width: 16, height: 16 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по имени..."
                style={{
                  width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,85,0.15)',
                  borderRadius: 12, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem',
                  outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'}
              />
            </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: '"Jost", sans-serif', color: '#ef4444', marginBottom: 16 }}>{error}</p>
              <button onClick={() => fetchGraduates(search)} className="btn-gold-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.78rem' }}>
                Попробовать снова
              </button>
            </motion.div>
          )}

          {/* Empty */}
          {!loading && !error && graduates.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <FiUsers style={{ width: 48, height: 48, color: '#2A2830', margin: '0 auto 1rem' }} />
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.4rem', color: 'rgba(237,224,196,0.4)' }}>Выпускники не найдены</p>
              {search && <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.8rem', color: '#3A3840', marginTop: 8 }}>Попробуйте изменить запрос</p>}
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && graduates.length > 0 && (
            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}
            >
              {graduates.map((graduate) => (
                <motion.div key={graduate._id || graduate.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } } }}>
                  <Card3D style={{ borderRadius: 24 }}>
                    <GraduateCard graduate={graduate} />
                  </Card3D>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
