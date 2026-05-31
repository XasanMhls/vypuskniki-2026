import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiPlus, FiUser, FiBook, FiPhone, FiAward, FiCamera } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

/* ─── Grain ─────────────────────────────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── Section card ───────────────────────────────────────── */
function Section({ title, icon: Icon, delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,165,85,0.12)',
        borderRadius: 18,
        padding: '1.75rem',
        overflow: 'hidden',
      }}
    >
      {/* top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.35), transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        {Icon && <Icon size={14} color="rgba(201,165,85,0.6)" />}
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '1.1rem', color: '#EDE0C4', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* ─── Input ──────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: '"Jost", sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,165,85,0.15)',
  borderRadius: 12,
  fontFamily: '"Jost", sans-serif',
  fontSize: '0.85rem',
  color: '#EDE0C4',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

function Input({ type = 'text', value, onChange, placeholder, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        ...inputStyle,
        borderColor: focused ? 'rgba(201,165,85,0.4)' : 'rgba(201,165,85,0.15)',
        boxShadow: focused ? '0 0 0 3px rgba(201,165,85,0.06)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        resize: 'none',
        borderColor: focused ? 'rgba(201,165,85,0.4)' : 'rgba(201,165,85,0.15)',
        boxShadow: focused ? '0 0 0 3px rgba(201,165,85,0.06)' : 'none',
        lineHeight: 1.6,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    quote: user?.quote || '',
    dream: user?.dream || '',
    favoriteTeacher: user?.favoriteTeacher || '',
    favoriteSubject: user?.favoriteSubject || '',
    favoriteMemory: user?.favoriteMemory || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    socialLinks: {
      vk: user?.socialLinks?.vk || '',
      telegram: user?.socialLinks?.telegram || '',
      instagram: user?.socialLinks?.instagram || '',
    },
    achievements: user?.achievements || [],
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newAchFocused, setNewAchFocused] = useState(false);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const handleSocialChange = (field, value) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [field]: value } }));

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setForm((p) => ({ ...p, achievements: [...p.achievements, newAchievement.trim()] }));
      setNewAchievement('');
    }
  };
  const removeAchievement = (index) => setForm((p) => ({ ...p, achievements: p.achievements.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Имя не может быть пустым'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.put(`/users/${user._id || user.id}`, form);
      updateUser(data.user || data);
      toast.success('Профиль обновлён!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Не удалось обновить профиль');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07070C', position: 'relative', overflow: 'hidden' }}
    >
      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', opacity: 1, pointerEvents: 'none', zIndex: 0 }} />
      {/* Orbs */}
      <div style={{ position: 'fixed', top: -100, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,165,85,0.05), transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -80, left: -60, width: 350, height: 350, background: 'radial-gradient(circle, rgba(130,96,48,0.04), transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ maxWidth: 780, margin: '0 auto', width: '100%', padding: '100px 24px 64px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1px solid rgba(201,165,85,0.2)', borderRadius: 10, color: '#6B6570', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.4)'; e.currentTarget.style.color = '#C9A555'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.2)'; e.currentTarget.style.color = '#6B6570'; }}>
            <FiArrowLeft size={15} />
          </Link>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#EDE0C4', margin: 0, lineHeight: 1 }}>
              Настройки профиля
            </h1>
            <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.75rem', color: '#3A3840', margin: '4px 0 0', letterSpacing: '0.04em' }}>Выпуск 2025–2026</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Avatar */}
          <Section title="Фото профиля" icon={FiCamera} delay={0.08}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* Current avatar preview */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ padding: 3, background: 'linear-gradient(135deg, #C9A555, #836030, #E2C87A)', borderRadius: '50%', boxShadow: '0 0 24px rgba(201,165,85,0.2)' }}>
                  {form.avatar ? (
                    <img src={form.avatar} alt={form.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid #07070C' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #0F0F18, #1A1A28)', border: '2px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '2rem', color: '#C9A555' }}>
                      {getInitials(form.name)}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <ImageUpload
                  currentImage={form.avatar}
                  onUpload={(url) => handleChange('avatar', url)}
                />
              </div>
            </div>
          </Section>

          {/* Basic Info */}
          <Section title="Основная информация" icon={FiUser} delay={0.13}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Field label="Имя *">
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ваше имя" />
              </Field>
              <Field label="Никнейм">
                <Input value={form.nickname} onChange={(e) => handleChange('nickname', e.target.value)} placeholder="Как вас называют друзья" />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="О себе">
                  <Textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} placeholder="Расскажите немного о себе..." />
                </Field>
              </div>
            </div>
          </Section>

          {/* School Memories */}
          <Section title="Школьные воспоминания" icon={FiBook} delay={0.18}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Field label="Цитата / девиз">
                <Input value={form.quote} onChange={(e) => handleChange('quote', e.target.value)} placeholder="Ваш девиз по жизни" />
              </Field>
              <Field label="Мечта">
                <Input value={form.dream} onChange={(e) => handleChange('dream', e.target.value)} placeholder="О чём вы мечтаете?" />
              </Field>
              <Field label="Любимый учитель">
                <Input value={form.favoriteTeacher} onChange={(e) => handleChange('favoriteTeacher', e.target.value)} placeholder="Кто вдохновлял вас?" />
              </Field>
              <Field label="Любимый предмет">
                <Input value={form.favoriteSubject} onChange={(e) => handleChange('favoriteSubject', e.target.value)} placeholder="Какой предмет любили?" />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Лучшее воспоминание">
                  <Textarea value={form.favoriteMemory} onChange={(e) => handleChange('favoriteMemory', e.target.value)} rows={3} placeholder="Опишите самый запоминающийся момент..." />
                </Field>
              </div>
            </div>
          </Section>

          {/* Achievements */}
          <Section title="Достижения" icon={FiAward} delay={0.22}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <AnimatePresence>
                {form.achievements.map((a, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 20, fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#C9A555' }}>
                    {a}
                    <button type="button" onClick={() => removeAchievement(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6570', padding: 0, display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6B6570'}>
                      <FiX size={12} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {form.achievements.length === 0 && (
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.8rem', color: '#2A2830', fontStyle: 'italic' }}>Добавьте свои достижения</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                placeholder="Новое достижение..."
                style={{
                  ...inputStyle,
                  flex: 1,
                  borderColor: newAchFocused ? 'rgba(201,165,85,0.4)' : 'rgba(201,165,85,0.15)',
                  boxShadow: newAchFocused ? '0 0 0 3px rgba(201,165,85,0.06)' : 'none',
                }}
                onFocus={() => setNewAchFocused(true)}
                onBlur={() => setNewAchFocused(false)}
              />
              <button type="button" onClick={addAchievement}
                style={{ padding: '12px 18px', background: 'rgba(201,165,85,0.1)', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 12, color: '#C9A555', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,165,85,0.18)'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,165,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,165,85,0.2)'; }}>
                <FiPlus size={16} />
              </button>
            </div>
          </Section>

          {/* Contacts */}
          <Section title="Контакты" icon={FiPhone} delay={0.26}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Field label="Телефон">
                <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+7 (999) 123-45-67" />
              </Field>
              <Field label="Telegram">
                <Input value={form.socialLinks.telegram} onChange={(e) => handleSocialChange('telegram', e.target.value)} placeholder="@username" />
              </Field>
              <Field label="ВКонтакте">
                <Input value={form.socialLinks.vk} onChange={(e) => handleSocialChange('vk', e.target.value)} placeholder="vk.com/username" />
              </Field>
              <Field label="Instagram">
                <Input value={form.socialLinks.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} placeholder="@username" />
              </Field>
            </div>
          </Section>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 36px',
                background: submitting ? 'rgba(201,165,85,0.4)' : 'linear-gradient(135deg, #C9A555, #9A7A35)',
                border: 'none',
                borderRadius: 12,
                fontFamily: '"Jost", sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                color: '#07070C',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(201,165,85,0.25)',
                transition: 'box-shadow 0.2s',
              }}
            >
              {submitting ? (
                <>
                  <motion.div style={{ width: 14, height: 14, border: '2px solid rgba(7,7,12,0.3)', borderTopColor: '#07070C', borderRadius: '50%' }}
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Сохранение...
                </>
              ) : (
                <>
                  <FiSave size={15} />
                  Сохранить изменения
                </>
              )}
            </motion.button>
          </motion.div>

        </form>
      </main>

      <Footer />
    </motion.div>
  );
}
