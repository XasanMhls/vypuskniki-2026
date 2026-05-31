import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiPhone, FiMessageCircle,
  FiBook, FiStar, FiHeart, FiUser, FiAward,
} from 'react-icons/fi';
import { FaTelegram, FaVk, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/* ─── Grain texture ─────────────────────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── Card3D ─────────────────────────────────────────────── */
function Card3D({ children, style, intensity = 8 }) {
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

/* ─── InfoCard ───────────────────────────────────────────── */
function InfoCard({ title, icon: Icon, children, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card3D intensity={6}>
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,165,85,0.12)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          transformStyle: 'preserve-3d',
          transition: 'border-color 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.12)'; }}
        >
          {/* top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.3), transparent)', borderRadius: '16px 16px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem', transform: 'translateZ(8px)' }}>
            {Icon && <Icon size={14} color="rgba(201,165,85,0.7)" />}
            <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>
              {title}
            </span>
          </div>
          <div style={{ transform: 'translateZ(4px)' }}>
            {children}
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}

/* ─── Loading ────────────────────────────────────────────── */
function ProfileLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07070C' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,165,85,0.15)' }} />
            <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#C9A555' }}
              animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
          </div>
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', color: 'rgba(201,165,85,0.45)', textTransform: 'uppercase' }}>Загрузка профиля</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ─── Error ──────────────────────────────────────────────── */
function ProfileError({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07070C' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, padding: '80px 16px 0' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>😔</div>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.5rem', color: '#EDE0C4', marginBottom: 8 }}>
            {message || 'Профиль не найден'}
          </p>
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#3A3840', marginBottom: 24 }}>
            Возможно, страница была удалена или произошла ошибка загрузки.
          </p>
          <Link to="/graduates" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 12, fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#C9A555', textDecoration: 'none' }}>
            <FiArrowLeft size={14} /> Вернуться к выпускникам
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = user && (user._id === id || user.id === id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/users/${id}`);
        setProfile(data.user || data);
      } catch {
        setError('Не удалось загрузить профиль');
        toast.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return <ProfileLoader />;
  if (error || !profile) return <ProfileError message={error} />;

  const socialLinks = profile.socialLinks || {};
  const achievements = profile.achievements || [];
  const hasContacts = profile.phone || socialLinks.vk || socialLinks.telegram || socialLinks.instagram;

  let cardIndex = 0;
  const nextIndex = () => cardIndex++;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07070C', position: 'relative', overflow: 'hidden' }}
    >
      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', opacity: 1, pointerEvents: 'none', zIndex: 0 }} />
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: -160, left: -120, width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,165,85,0.055), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -100, right: -100, width: 420, height: 420, background: 'radial-gradient(circle, rgba(130,96,48,0.04), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: 80, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate('/graduates')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#3A3840', cursor: 'pointer', marginBottom: 36, letterSpacing: '0.05em', background: 'none', border: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#C9A555'}
            onMouseLeave={e => e.currentTarget.style.color = '#3A3840'}
          >
            <FiArrowLeft size={14} /> ← Выпускники
          </motion.button>

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 40 }}
          >
            {/* Hero glow */}
            <div style={{ position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)', width: 320, height: 200, background: 'radial-gradient(ellipse, rgba(201,165,85,0.07), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>

              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                {/* Gold ring */}
                <div style={{ padding: 3, background: 'linear-gradient(135deg, #C9A555, #836030, #E2C87A, #C9A555)', borderRadius: '50%', boxShadow: '0 0 40px rgba(201,165,85,0.25)' }}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid #07070C' }} />
                  ) : (
                    <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #0F0F18, #1A1A28)', border: '3px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '3rem', color: '#C9A555' }}>
                      {getInitials(profile.name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name block */}
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EDE0C4', margin: '0 0 4px', lineHeight: 1.1 }}>
                  {profile.name}
                </h1>
                {profile.nickname && (
                  <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: 'rgba(201,165,85,0.6)', margin: '4px 0 0', letterSpacing: '0.08em' }}>
                    ({profile.nickname})
                  </p>
                )}
                {profile.role === 'admin' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '4px 14px', background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 20, fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A555' }}>
                    <FiStar size={10} /> Администратор
                  </span>
                )}

                {isOwnProfile && (
                  <div style={{ marginTop: 20 }}>
                    <Link
                      to="/settings"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: '1px solid rgba(201,165,85,0.25)', borderRadius: 12, fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', color: '#C9A555', textDecoration: 'none', background: 'rgba(201,165,85,0.05)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.5)'; e.currentTarget.style.background = 'rgba(201,165,85,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.25)'; e.currentTarget.style.background = 'rgba(201,165,85,0.05)'; }}
                    >
                      <FiEdit2 size={13} /> Редактировать профиль
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.2), transparent)', marginTop: 36 }} />
          </motion.div>

          {/* ── Content grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

            {/* О себе */}
            {profile.bio && (
              <InfoCard title="О себе" icon={FiUser} index={nextIndex()}>
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#6B6570', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{profile.bio}</p>
              </InfoCard>
            )}

            {/* Цитата */}
            {profile.quote && (
              <InfoCard title="Цитата" icon={FiMessageCircle} index={nextIndex()}>
                <div style={{ position: 'relative', paddingLeft: 16 }}>
                  <span style={{ position: 'absolute', left: 0, top: -4, fontFamily: '"Cormorant Garamond", serif', fontSize: '2.5rem', color: 'rgba(201,165,85,0.25)', lineHeight: 1, userSelect: 'none' }}>❝</span>
                  <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#C9A555', lineHeight: 1.6, margin: 0 }}>{profile.quote}</p>
                </div>
              </InfoCard>
            )}

            {/* Лучшее воспоминание */}
            {profile.favoriteMemory && (
              <InfoCard title="Лучшее воспоминание" icon={FiHeart} index={nextIndex()}>
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#6B6570', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{profile.favoriteMemory}</p>
              </InfoCard>
            )}

            {/* Мечта */}
            {profile.dream && (
              <InfoCard title="Мечта" icon={null} index={nextIndex()}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🚀</span>
                  <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#6B6570', lineHeight: 1.6, margin: 0 }}>{profile.dream}</p>
                </div>
              </InfoCard>
            )}

            {/* Любимый учитель */}
            {profile.favoriteTeacher && (
              <InfoCard title="Любимый учитель" icon={FiStar} index={nextIndex()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>👩‍🏫</div>
                  <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#EDE0C4', fontWeight: 500, margin: 0 }}>{profile.favoriteTeacher}</p>
                </div>
              </InfoCard>
            )}

            {/* Любимый предмет */}
            {profile.favoriteSubject && (
              <InfoCard title="Любимый предмет" icon={FiBook} index={nextIndex()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>📖</div>
                  <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#EDE0C4', fontWeight: 500, margin: 0 }}>{profile.favoriteSubject}</p>
                </div>
              </InfoCard>
            )}

            {/* Достижения */}
            {achievements.length > 0 && (
              <InfoCard title="Достижения" icon={FiAward} index={nextIndex()}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {achievements.map((ach, idx) => (
                    <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', background: 'rgba(201,165,85,0.07)', border: '1px solid rgba(201,165,85,0.18)', borderRadius: 20, fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: '#C9A555' }}>
                      🏅 {ach}
                    </span>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Контакты */}
            {hasContacts && (
              <InfoCard title="Контакты" icon={FiPhone} index={nextIndex()}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.1)', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#6B6570', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EDE0C4'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B6570'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'; }}>
                      <FiPhone size={13} color="rgba(201,165,85,0.6)" /> {profile.phone}
                    </a>
                  )}
                  {socialLinks.telegram && (
                    <a href={socialLinks.telegram.startsWith('http') ? socialLinks.telegram : `https://t.me/${socialLinks.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.1)', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#6B6570', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B6570'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'; }}>
                      <FaTelegram size={14} color="#60a5fa" /> @{socialLinks.telegram.replace('@', '')}
                    </a>
                  )}
                  {socialLinks.vk && (
                    <a href={socialLinks.vk.startsWith('http') ? socialLinks.vk : `https://vk.com/${socialLinks.vk}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.1)', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#6B6570', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.borderColor = 'rgba(147,197,253,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B6570'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'; }}>
                      <FaVk size={14} color="#93c5fd" /> ВКонтакте
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.1)', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#6B6570', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f9a8d4'; e.currentTarget.style.borderColor = 'rgba(249,168,212,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B6570'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'; }}>
                      <FaInstagram size={14} color="#f9a8d4" /> @{socialLinks.instagram.replace('@', '')}
                    </a>
                  )}
                </div>
              </InfoCard>
            )}
          </div>

          {/* Empty state */}
          {!profile.bio && !profile.quote && !profile.dream && !profile.favoriteTeacher &&
            !profile.favoriteSubject && !profile.favoriteMemory && achievements.length === 0 && !hasContacts && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 16 }}>
              <FiUser size={56} color="rgba(201,165,85,0.15)" />
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#3A3840', margin: 0 }}>Профиль пока не заполнен</p>
              {isOwnProfile && (
                <Link to="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: '1px solid rgba(201,165,85,0.25)', borderRadius: 12, fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#C9A555', textDecoration: 'none', background: 'rgba(201,165,85,0.05)' }}>
                  <FiEdit2 size={13} /> Заполнить профиль
                </Link>
              )}
            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
