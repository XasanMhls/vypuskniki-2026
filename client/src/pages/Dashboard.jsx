import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion, useMotionValue, useTransform, useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  FiUsers, FiAward, FiClock, FiArrowRight,
  FiBookOpen, FiStar, FiFeather, FiImage, FiHeart,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч. назад`;
  const days = Math.floor(hrs / 24);
  return `${days} д. назад`;
}

/* ─────────────────────────────────────────────────────────
   3D Tilt Card wrapper
   ───────────────────────────────────────────────────────── */
function Card3D({ children, className, style, intensity = 12 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 });

  const onMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Floating orbs background
   ───────────────────────────────────────────────────────── */
function FloatingOrbs() {
  const orbs = [
    { size: 500, x: '-10%', y: '-15%', color: 'rgba(201,165,85,0.06)', dur: 18 },
    { size: 380, x: '65%',  y: '5%',   color: 'rgba(201,165,85,0.04)', dur: 22 },
    { size: 280, x: '40%',  y: '55%',  color: 'rgba(201,165,85,0.05)', dur: 16 },
    { size: 200, x: '-5%',  y: '60%',  color: 'rgba(201,165,85,0.03)', dur: 26 },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
          style={{
            position: 'absolute',
            width: o.size, height: o.size,
            left: o.x, top: o.y,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(201,165,85,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,165,85,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Loading screen
   ───────────────────────────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070C', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '1.5px solid transparent',
                borderTopColor: '#C9A555',
                borderRightColor: 'rgba(201,165,85,0.3)',
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 8,
                borderRadius: '50%',
                border: '1px solid transparent',
                borderBottomColor: 'rgba(201,165,85,0.6)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A555' }} />
            </div>
          </div>
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.4)' }}>
            Загрузка
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Flip digit for countdown
   ───────────────────────────────────────────────────────── */
function FlipDigit({ value }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={str}
          initial={{ y: -20, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: 20, opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'block',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: '#C9A555',
            lineHeight: 1,
            transformOrigin: 'center',
          }}
        >
          {str}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Graduation countdown
   ───────────────────────────────────────────────────────── */
function GraduationCountdown() {
  const GRADUATION = new Date('2026-06-25T10:00:00');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = GRADUATION.getTime() - now.getTime();

  if (diff <= 0) {
    return (
      <Card3D intensity={6} style={{ borderRadius: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,165,85,0.12), rgba(201,165,85,0.04))',
          border: '1px solid rgba(201,165,85,0.25)',
          borderRadius: 20, padding: '2rem',
          backdropFilter: 'blur(20px)',
          textAlign: 'center',
        }}>
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}
          >🎓</motion.span>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.6rem', color: '#EDE0C4', marginBottom: 8 }}>
            Мы выпустились!
          </h3>
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.8rem', color: '#6B6570', letterSpacing: '0.05em' }}>
            Новая глава уже началась
          </p>
        </div>
      </Card3D>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const units = [
    { value: days, label: 'Дней' },
    { value: hours, label: 'Часов' },
    { value: minutes, label: 'Минут' },
    { value: seconds, label: 'Секунд' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card3D intensity={5} style={{ borderRadius: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,165,85,0.08), rgba(7,7,12,0.8))',
          border: '1px solid rgba(201,165,85,0.2)',
          borderRadius: 20, padding: '1.75rem',
          backdropFilter: 'blur(24px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.5), transparent)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <FiClock style={{ color: '#C9A555', width: 14, height: 14 }} />
            <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555' }}>
              До выпускного
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {units.map((u) => (
              <div key={u.label} style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(201,165,85,0.06)',
                  border: '1px solid rgba(201,165,85,0.12)',
                  borderRadius: 12, padding: '0.75rem 0.25rem 0.6rem',
                  marginBottom: 6,
                  backdropFilter: 'blur(8px)',
                }}>
                  <FlipDigit value={u.value} />
                </div>
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3A3840' }}>
                  {u.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Stat card with 3D tilt
   ───────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, sublabel, accent, delay }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card3D intensity={10} style={{ borderRadius: 18, height: '100%' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, rgba(201,165,85,0.09) 0%, rgba(7,7,12,0.7) 100%)`,
            border: '1px solid rgba(201,165,85,0.15)',
            borderRadius: 18, padding: '1.5rem',
            backdropFilter: 'blur(24px)',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.4), transparent)' }} />
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 120, height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }} />

          <div style={{
            width: 36, height: 36, borderRadius: 10, marginBottom: '1rem',
            background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
            border: `1px solid ${accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}>
            <Icon style={{ color: accent, width: 16, height: 16 }} />
          </div>

          <p style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: value ? 'italic' : 'normal',
            fontSize: value ? 'clamp(2rem, 4vw, 2.8rem)' : '0.9rem',
            fontWeight: 300,
            color: value ? '#C9A555' : '#EDE0C4',
            lineHeight: 1,
            marginBottom: 8,
            transform: 'translateZ(10px)',
          }}>
            {value ?? sublabel ?? '—'}
          </p>
          <p style={{
            fontFamily: '"Jost", sans-serif', fontWeight: 600,
            fontSize: '0.6rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)',
          }}>
            {label}
          </p>
          {value && sublabel && (
            <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: '#3A3840', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sublabel}
            </p>
          )}
        </motion.div>
      </Card3D>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Quick action with 3D
   ───────────────────────────────────────────────────────── */
function ActionCard({ to, emoji, title, subtitle, accent, delay }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card3D intensity={14} style={{ borderRadius: 16 }}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(to)}
          style={{
            position: 'relative', overflow: 'hidden',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(201,165,85,0.12)',
            borderRadius: 16, padding: '1.4rem 1.25rem',
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
            transformStyle: 'preserve-3d',
          }}
          className="group"
        >
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}08, transparent)`, opacity: 0, transition: 'opacity 0.3s' }} className="group-hover:opacity-100" />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${accent}30, transparent)` }} />

          <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem', transform: 'translateZ(16px)', display: 'block' }}>
            {emoji}
          </div>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#EDE0C4', marginBottom: 4, transform: 'translateZ(8px)' }}>
            {title}
          </p>
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.73rem', color: '#6B6570', lineHeight: 1.5 }}>
            {subtitle}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.85rem' }}>
            <div style={{ height: 1, width: 16, background: accent, opacity: 0.4 }} />
            <FiArrowRight style={{ color: accent, width: 12, height: 12, opacity: 0.5 }} />
          </div>
        </motion.div>
      </Card3D>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Animated number
   ───────────────────────────────────────────────────────── */
function AnimatedNum({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target || isNaN(target)) return;
    const num = Number(target);
    let frame = 0;
    const total = 70;
    const tick = () => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / total, 3);
      setVal(Math.floor(num * ease));
      if (frame < total) requestAnimationFrame(tick);
      else setVal(num);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span>{val}</span>;
}

/* ─────────────────────────────────────────────────────────
   Main Dashboard
   ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.allSettled([
          api.get('/users/stats/class'),
          api.get('/posts', { params: { limit: 5 } }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (postsRes.status === 'fulfilled') {
          const posts = postsRes.value.data.posts || postsRes.value.data || [];
          setRecentPosts(Array.isArray(posts) ? posts.slice(0, 3) : []);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return <PageLoader />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden' }}
    >
      <FloatingOrbs />

      {/* Grain texture overlay */}
      <div style={{
        position: 'fixed', inset: '-50%', width: '200%', height: '200%',
        pointerEvents: 'none', zIndex: 1, opacity: 0.022,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '180px',
      }} />

      <Navbar />

      <main style={{ position: 'relative', zIndex: 2, paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* ── Hero greeting ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ padding: '3rem 0 2.5rem', position: 'relative' }}
          >
            {/* Decorative horizontal rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.5)' }} />
              <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)' }}>
                {today}
              </span>
            </div>

            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#EDE0C4', lineHeight: 1, margin: 0 }}>
              Добро пожаловать,{' '}
              <motion.span
                style={{ color: '#C9A555', display: 'inline-block' }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {user?.name?.split(' ')[0] || 'Выпускник'}
              </motion.span>
            </h1>
            <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.9rem', color: '#3A3840', marginTop: '0.75rem', letterSpacing: '0.05em' }}>
              Выпуск 11 класса · 2025–2026
            </p>
          </motion.div>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard
              icon={FiUsers}
              value={stats?.totalGraduates ?? stats?.graduates}
              label="Выпускников"
              accent="#C9A555"
              delay={0.1}
            />
            <StatCard
              icon={FiAward}
              value={stats?.totalAchievements ?? stats?.awards}
              label="Достижений"
              accent="#A78BFA"
              delay={0.16}
            />
            <StatCard
              icon={FiStar}
              value={null}
              label="Популярная мечта"
              sublabel={stats?.mostCommonDream ?? stats?.topDream ?? 'Нет данных'}
              accent="#60A5FA"
              delay={0.22}
            />
            <StatCard
              icon={FiBookOpen}
              value={null}
              label="Предмет класса"
              sublabel={stats?.mostCommonSubject ?? stats?.topSubject ?? 'Нет данных'}
              accent="#34D399"
              delay={0.28}
            />
          </div>

          {/* ── Main content grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}
            className="lg:grid-cols-3">

            {/* Recent posts (2/3) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6 }}
              style={{ gridColumn: 'span 2' }}
              className="lg:col-span-2"
            >
              <Card3D intensity={4} style={{ borderRadius: 20, height: '100%' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(201,165,85,0.12)',
                  borderRadius: 20, padding: '1.75rem',
                  backdropFilter: 'blur(24px)',
                  height: '100%',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.3), transparent)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,165,85,0.1)', border: '1px solid rgba(201,165,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiFeather style={{ color: '#C9A555', width: 13, height: 13 }} />
                      </div>
                      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.15rem', color: '#EDE0C4' }}>
                        Последние воспоминания
                      </h2>
                    </div>
                    <Link to="/wall" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(201,165,85,0.6)', textTransform: 'uppercase', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#C9A555'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,165,85,0.6)'}
                    >
                      Все <FiArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                  </div>

                  {recentPosts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {recentPosts.map((post, idx) => (
                        <motion.div
                          key={post._id || idx}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.42 + idx * 0.08 }}
                          whileHover={{ x: 4 }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '0.9rem 1rem',
                            borderRadius: 12,
                            background: 'rgba(201,165,85,0.03)',
                            border: '1px solid rgba(201,165,85,0.08)',
                            transition: 'border-color 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.08)'}
                        >
                          <div style={{
                            flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #C9A555, #836030)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#07070C',
                            boxShadow: '0 0 12px rgba(201,165,85,0.2)',
                          }}>
                            {(post.author?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#EDE0C4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {post.author?.name || 'Аноним'}
                              </p>
                              <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', color: '#2A2830', flexShrink: 0 }}>
                                {timeAgo(post.createdAt)}
                              </span>
                            </div>
                            <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.82rem', color: '#6B6570', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {(post.content || post.text || '').slice(0, 120)}
                              {(post.content || post.text || '').length > 120 ? '…' : ''}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 12, textAlign: 'center' }}>
                      <FiFeather style={{ width: 32, height: 32, color: '#2A2830' }} />
                      <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#3A3840' }}>Пока нет записей</p>
                      <Link to="/wall" style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#C9A555', transition: 'opacity 0.2s' }}>
                        Написать первую →
                      </Link>
                    </div>
                  )}
                </div>
              </Card3D>
            </motion.div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <GraduationCountdown />

              {/* Links card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Card3D intensity={5} style={{ borderRadius: 18 }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(201,165,85,0.1)',
                    borderRadius: 18, padding: '1.5rem',
                    backdropFilter: 'blur(20px)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.25), transparent)' }} />
                    <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.4)', marginBottom: '1rem' }}>
                      Разделы
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { to: '/wall',      icon: FiFeather,  label: 'Стена воспоминаний', color: '#C9A555' },
                        { to: '/albums',    icon: FiImage,    label: 'Фотоальбомы',        color: '#60A5FA' },
                        { to: '/graduates', icon: FiUsers,    label: 'Выпускники',         color: '#A78BFA' },
                        { to: '/awards',    icon: FiAward,    label: 'Награды',            color: '#34D399' },
                        { to: '/timeline',  icon: FiBookOpen, label: 'Хронология',         color: '#FB7185' },
                      ].map(({ to, icon: Icon, label, color }) => (
                        <Link
                          key={to}
                          to={to}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.75rem', borderRadius: 10, transition: 'all 0.2s', color: '#6B6570' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,165,85,0.05)'; e.currentTarget.style.color = '#EDE0C4'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6570'; }}
                        >
                          <Icon style={{ color, width: 13, height: 13, flexShrink: 0 }} />
                          <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.8rem', flex: 1 }}>{label}</span>
                          <FiArrowRight style={{ width: 11, height: 11, opacity: 0.3 }} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            </div>
          </div>

          {/* ── Quick actions ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, rgba(201,165,85,0.2), transparent)' }} />
              <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.35)' }}>
                Быстрый переход
              </span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, rgba(201,165,85,0.2), transparent)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              <ActionCard to="/wall"      emoji="✍️" title="Написать"   subtitle="Поделитесь воспоминанием" accent="#C9A555" delay={0.55} />
              <ActionCard to="/albums"    emoji="📸" title="Альбомы"    subtitle="Смотрите фотографии"      accent="#60A5FA" delay={0.60} />
              <ActionCard to="/graduates" emoji="👥" title="Выпускники" subtitle="Найдите одноклассников"   accent="#A78BFA" delay={0.65} />
              <ActionCard to="/awards"    emoji="🏆" title="Награды"    subtitle="Проголосуйте за лучших"   accent="#34D399" delay={0.70} />
              <ActionCard to="/timeline"  emoji="📖" title="Хроника"    subtitle="История нашего класса"    accent="#FB7185" delay={0.75} />
              <ActionCard to="/profile"   emoji="🌟" title="Профиль"    subtitle="Ваша страница выпускника" accent="#FBBF24" delay={0.80} />
            </div>
          </motion.div>

          {/* ── Motivational quote ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{ marginTop: '2.5rem', textAlign: 'center', padding: '3rem 1.5rem' }}
          >
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.2), transparent)', marginBottom: '2.5rem' }} />
            <motion.span
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'block', fontSize: 7, color: '#C9A555', marginBottom: '1.25rem' }}
            >◆</motion.span>
            <blockquote style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', color: 'rgba(237,224,196,0.35)', lineHeight: 1.4, margin: 0 }}>
              Школа закончилась,<br />но дружба — навсегда
            </blockquote>
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.2), transparent)', marginTop: '2.5rem' }} />
          </motion.div>

        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
