import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiPlus, FiX, FiCheckCircle, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const EMPTY_FORM = { category: '', description: '', icon: '🏆' };

function Card3D({ children, style, intensity = 10 }) {
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

function NomineeRow({ nominee, awardId, isActive, onVote }) {
  const name = nominee.user?.name || 'Участник';
  const userId = nominee.user?._id || nominee.user;
  const votes = nominee.votes?.length ?? 0;
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.08)', borderRadius: 10, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.18)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.08)'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {nominee.user?.avatar
          ? <img src={nominee.user.avatar} alt={name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,165,85,0.3)', flexShrink: 0 }} />
          : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A555, #836030)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.62rem', color: '#07070C', flexShrink: 0 }}>{initials}</div>
        }
        <span style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#9A9098', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#C9A555' }}>{votes}</span>
        {isActive && (
          <motion.button onClick={() => onVote(awardId, userId)} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '0.35rem 0.85rem', background: 'linear-gradient(135deg, #E2C87A, #C9A555)', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#07070C', boxShadow: '0 2px 10px rgba(201,165,85,0.25)' }}>
            Голос
          </motion.button>
        )}
      </div>
    </div>
  );
}

function WinnerBadge({ nominees }) {
  if (!nominees?.length) return null;
  const winner = [...nominees].sort((a, b) => (b.votes?.length ?? 0) - (a.votes?.length ?? 0))[0];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 12 }}>
      <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '1.4rem' }}>👑</motion.span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.6)', margin: 0 }}>Победитель</p>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#EDE0C4', margin: 0 }}>{winner.user?.name || 'Участник'}</p>
      </div>
      <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.8rem', color: '#C9A555' }}>{winner.votes?.length ?? 0}</span>
    </motion.div>
  );
}

const inputStyle = { width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,85,0.15)', borderRadius: 10, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box' };

export default function Awards() {
  const { user } = useAuth();
  const [awards, setAwards]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchAwards(); }, []);

  const fetchAwards = async () => {
    try {
      const { data } = await api.get('/awards');
      setAwards(data.awards || data);
    } catch { toast.error('Не удалось загрузить награды'); }
    finally { setLoading(false); }
  };

  const handleVote = async (awardId, nomineeUserId) => {
    try {
      const { data } = await api.post(`/awards/${awardId}/vote`, { nomineeUserId });
      setAwards((prev) => prev.map((a) => (a._id || a.id) === awardId ? { ...a, ...(data.award || data) } : a));
      toast.success('Голос учтён!');
    } catch (err) { toast.error(err.response?.data?.message || 'Не удалось проголосовать'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.category.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/awards', form);
      setAwards((prev) => [...prev, data.award || data]);
      setShowModal(false); setForm(EMPTY_FORM);
      toast.success('Номинация создана!');
    } catch { toast.error('Не удалось создать номинацию'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      <div style={{ position: 'fixed', top: '5%', right: '-8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(201,165,85,0.08)' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1.5rem 2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.55)' }} />
                  <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>Выпуск · 2025–2026</span>
                </div>
                <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>
                  Награды класса
                </h1>
                <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.88rem', color: '#3A3840', marginTop: '0.5rem' }}>Голосуйте за лучших из лучших</p>
              </div>
              {isAdmin && (
                <motion.button onClick={() => setShowModal(true)} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #E2C87A, #C9A555)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#07070C', boxShadow: '0 4px 20px rgba(201,165,85,0.25)', flexShrink: 0 }}>
                  <FiPlus style={{ width: 14, height: 14 }} /> Создать номинацию
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>

        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: 16 }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
              </div>
            </div>
          ) : awards.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FiAward style={{ width: 56, height: 56, color: '#2A2830', margin: '0 auto 1.5rem' }} />
              </motion.div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.6rem', color: 'rgba(237,224,196,0.4)', marginBottom: 8 }}>Номинации ещё не созданы</p>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: '#3A3840' }}>
                {isAdmin ? 'Нажмите «Создать номинацию», чтобы начать' : 'Загляните позже'}
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {awards.map((award, i) => {
                const awardId = award._id || award.id;
                const nominees = award.nominees || [];
                const isActive = award.isActive !== false;
                return (
                  <motion.div key={awardId || i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Card3D intensity={10} style={{ borderRadius: 18, height: '100%' }}>
                      <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(24px)', border: '1px solid rgba(201,165,85,0.12)', borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.35), transparent)' }} />

                        {/* Card header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                          <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                            style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, transform: 'translateZ(12px)' }}>
                            {award.icon || '🏆'}
                          </motion.div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '1.2rem', color: '#EDE0C4', margin: '0 0 4px', lineHeight: 1.2, transform: 'translateZ(8px)' }}>
                              {award.category || award.title}
                            </h2>
                            {award.description && <p style={{ fontFamily: '"Jost"', fontSize: '0.75rem', color: '#3A3840', lineHeight: 1.5, margin: 0 }}>{award.description}</p>}
                          </div>
                        </div>

                        {/* Status */}
                        <div style={{ marginBottom: '0.85rem' }}>
                          {isActive
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.25rem 0.75rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 7, fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#34D399' }}>
                                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                                Голосование открыто
                              </span>
                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3A3840' }}>
                                <FiCheckCircle style={{ width: 10, height: 10 }} /> Завершено
                              </span>
                          }
                        </div>

                        {/* Nominees */}
                        {nominees.length > 0
                          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                              {nominees.map((nominee, ni) => (
                                <NomineeRow key={nominee._id || nominee.user?._id || ni} nominee={nominee} awardId={awardId} isActive={isActive} onVote={handleVote} />
                              ))}
                            </div>
                          : <p style={{ fontFamily: '"Jost"', fontSize: '0.8rem', color: '#2A2830', fontStyle: 'italic', flex: 1 }}>Кандидаты ещё не добавлены</p>
                        }

                        {!isActive && nominees.length > 0 && <WinnerBadge nominees={nominees} />}
                      </div>
                    </Card3D>
                  </motion.div>
                );
              })}
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
              style={{ width: '100%', maxWidth: 440, background: '#0F0F18', border: '1px solid rgba(201,165,85,0.2)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.5), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', color: '#EDE0C4', margin: 0 }}>Новая номинация</h2>
                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6B6570', cursor: 'pointer', padding: 4 }}><FiX style={{ width: 18, height: 18 }} /></motion.button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Название номинации', key: 'category', placeholder: 'Душа компании', required: true },
                  { label: 'Иконка (эмодзи)', key: 'icon', placeholder: '🏆', maxLength: 4 },
                ].map(({ label, key, placeholder, required, maxLength }) => (
                  <div key={key}>
                    <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>{label}</label>
                    <input name={key} value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} maxLength={maxLength}
                      style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>Описание</label>
                  <textarea name="description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Краткое описание..." rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 76 }} onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <motion.button type="button" onClick={() => setShowModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6570' }}>
                    Отмена
                  </motion.button>
                  <motion.button type="submit" disabled={submitting || !form.category.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '0.8rem', background: submitting || !form.category.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #E2C87A, #C9A555)', border: 'none', borderRadius: 10, cursor: submitting || !form.category.trim() ? 'not-allowed' : 'pointer', fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: submitting || !form.category.trim() ? '#3A3840' : '#07070C', transition: 'all 0.3s' }}>
                    {submitting ? 'Создание...' : 'Создать'}
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
