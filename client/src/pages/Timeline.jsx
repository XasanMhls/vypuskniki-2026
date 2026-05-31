import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiCalendar, FiMapPin, FiStar, FiX, FiPlus, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const EVENT_TYPES = [
  { value: 'milestone',   label: 'Достижение', emoji: '🏆', accent: '#C9A555' },
  { value: 'event',       label: 'Событие',    emoji: '📅', accent: '#60A5FA' },
  { value: 'trip',        label: 'Поездка',    emoji: '🌍', accent: '#34D399' },
  { value: 'celebration', label: 'Праздник',   emoji: '🎉', accent: '#A78BFA' },
  { value: 'exam',        label: 'Экзамен',    emoji: '📝', accent: '#FB7185' },
];

function getTypeConfig(type) { return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[1]; }

function formatDate(dateStr) {
  try { return format(new Date(dateStr), 'd MMMM yyyy', { locale: ru }); }
  catch { return dateStr; }
}

const EMPTY_FORM = { title: '', date: '', description: '', type: 'event' };

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
    <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800, ...style }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </motion.div>
  );
}

const inputStyle = { width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,85,0.15)', borderRadius: 10, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box' };

export default function Timeline() {
  const { user } = useAuth();
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const canAdd = !!user;

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || data);
    } catch { toast.error('Не удалось загрузить хронологию'); }
    finally { setLoading(false); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/events', form);
      setEvents((prev) => [...prev, data.event || data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowModal(false); setForm(EMPTY_FORM);
      toast.success('Событие добавлено!');
    } catch { toast.error('Не удалось добавить событие'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      <div style={{ position: 'fixed', top: '0%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(201,165,85,0.08)' }}>
          <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2.5rem 1.5rem 2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.55)' }} />
                  <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>2025–2026</span>
                </div>
                <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>
                  Хроника класса
                </h1>
                <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.88rem', color: '#3A3840', marginTop: '0.5rem' }}>История нашего 11 класса</p>
              </div>
              {canAdd && (
                <motion.button onClick={() => setShowModal(true)} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #E2C87A, #C9A555)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#07070C', boxShadow: '0 4px 20px rgba(201,165,85,0.25)', flexShrink: 0 }}>
                  <FiPlus style={{ width: 14, height: 14 }} /> Добавить событие
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>

        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: 16 }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
              </div>
            </div>
          ) : events.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FiClock style={{ width: 52, height: 52, color: '#2A2830', margin: '0 auto 1.5rem' }} />
              </motion.div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.6rem', color: 'rgba(237,224,196,0.4)', marginBottom: 8 }}>События пока не добавлены</p>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#3A3840' }}>Будьте первым, кто запишет историю класса</p>
            </motion.div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Gold timeline line */}
              <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, rgba(201,165,85,0.5), rgba(201,165,85,0.1), rgba(201,165,85,0.5))', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {events.map((event, i) => {
                  const cfg = getTypeConfig(event.type);
                  return (
                    <motion.div key={event._id || event.id || i}
                      initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay: i * 0.06 }}
                      style={{ position: 'relative', paddingLeft: '3.5rem' }}>
                      {/* Dot */}
                      <motion.div whileHover={{ scale: 1.4 }}
                        style={{ position: 'absolute', left: 12, top: 20, width: 16, height: 16, borderRadius: '50%', background: cfg.accent, border: '3px solid #07070C', boxShadow: `0 0 12px ${cfg.accent}60`, zIndex: 1 }} />

                      <Card3D intensity={8} style={{ borderRadius: 16 }}>
                        <motion.div whileHover={{ scale: 1.01 }}
                          style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', border: `1px solid ${cfg.accent}20`, borderRadius: 16, padding: '1.25rem 1.4rem', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = cfg.accent + '40'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = cfg.accent + '20'}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${cfg.accent}40, transparent)` }} />

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.7rem', background: cfg.accent + '15', border: `1px solid ${cfg.accent}30`, borderRadius: 7, fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.accent }}>
                              {cfg.emoji} {cfg.label}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: '"Jost"', fontSize: '0.72rem', color: '#3A3840' }}>
                              <FiCalendar style={{ width: 11, height: 11 }} />
                              {formatDate(event.date)}
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: '"Jost"', fontSize: '0.72rem', color: '#3A3840' }}>
                                <FiMapPin style={{ width: 11, height: 11 }} />
                                {event.location}
                              </div>
                            )}
                          </div>

                          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '1.2rem', color: '#EDE0C4', margin: '0 0 0.5rem', transform: 'translateZ(8px)' }}>{event.title}</h3>

                          {event.description && <p style={{ fontFamily: '"Jost"', fontWeight: 300, fontSize: '0.83rem', color: '#6B6570', lineHeight: 1.65, margin: 0 }}>{event.description}</p>}

                          {event.image && <img src={event.image} alt={event.title} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, marginTop: '0.85rem', border: '1px solid rgba(201,165,85,0.1)' }} />}
                        </motion.div>
                      </Card3D>
                    </motion.div>
                  );
                })}
              </div>

              {/* End cap */}
              <div style={{ position: 'relative', paddingLeft: '3.5rem', marginTop: '2rem' }}>
                <div style={{ position: 'absolute', left: 11, top: 8, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A555, #836030)', border: '3px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(201,165,85,0.4)' }}>
                  <FiStar style={{ width: 8, height: 8, color: '#07070C' }} />
                </div>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1rem', color: 'rgba(201,165,85,0.3)', paddingLeft: 4 }}>Продолжение следует...</p>
              </div>
            </div>
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
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ width: '100%', maxWidth: 480, background: '#0F0F18', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.5), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', color: '#EDE0C4', margin: 0 }}>Добавить событие</h2>
                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6B6570', cursor: 'pointer', padding: 4 }}><FiX style={{ width: 18, height: 18 }} /></motion.button>
              </div>
              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Название *</label>
                  <input name="title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Название события" required style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <div>
                  <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Дата *</label>
                  <input name="date" type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <div>
                  <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Тип</label>
                  <select name="type" value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }}>
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value} style={{ background: '#0F0F18' }}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Описание</label>
                  <textarea name="description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Расскажите подробнее..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 76 }} onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <motion.button type="button" onClick={() => setShowModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6570' }}>
                    Отмена
                  </motion.button>
                  <motion.button type="submit" disabled={submitting || !form.title.trim() || !form.date} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '0.8rem', background: submitting || !form.title.trim() || !form.date ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #E2C87A, #C9A555)', border: 'none', borderRadius: 10, cursor: submitting || !form.title.trim() || !form.date ? 'not-allowed' : 'pointer', fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: submitting || !form.title.trim() || !form.date ? '#3A3840' : '#07070C', transition: 'all 0.3s' }}>
                    {submitting ? 'Сохранение...' : 'Добавить'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
