import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiUsers, FiShield, FiTrash2, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

const STAT_ICONS = ['👥','✅','⏳','💬','📸','🖼️','🏆','📅'];
const STAT_ACCENTS = ['#C9A555','#34D399','#FBBF24','#60A5FA','#FB7185','#A78BFA','#C9A555','#60A5FA'];

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

function AdminStatCard({ icon, label, value, accent, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}>
      <Card3D intensity={12} style={{ borderRadius: 16 }}>
        <motion.div whileHover={{ scale: 1.03 }}
          style={{ position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.025)', border: `1px solid ${accent}20`, borderRadius: 16, padding: '1.25rem 1.4rem', backdropFilter: 'blur(20px)', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${accent}50, transparent)` }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}15, transparent)`, filter: 'blur(16px)' }} />
          <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem', transform: 'translateZ(10px)' }}>{icon}</div>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '2rem', color: accent, lineHeight: 1, margin: '0 0 4px', transform: 'translateZ(6px)' }}>{value}</p>
          <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.4)', margin: 0 }}>{label}</p>
        </motion.div>
      </Card3D>
    </motion.div>
  );
}

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats')]);
        setUsers(usersRes.data.users || usersRes.data);
        setStats(statsRes.data.stats || statsRes.data);
      } catch { toast.error('Не удалось загрузить данные'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, { approved: true });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, approved: true } : u));
      toast.success('Пользователь одобрен');
    } catch { toast.error('Не удалось одобрить'); }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Роль изменена на ${newRole === 'admin' ? 'Админ' : 'Участник'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Не удалось изменить роль'); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Удалить этого пользователя? Это действие необратимо.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Пользователь удалён');
    } catch (err) { toast.error(err.response?.data?.message || 'Не удалось удалить'); }
  };

  const filteredUsers = filter === 'pending' ? users.filter((u) => !u.approved) : filter === 'approved' ? users.filter((u) => u.approved) : users;
  const pendingCount = users.filter((u) => !u.approved).length;

  const statItems = stats ? [
    { label: 'Пользователей', value: stats.totalUsers ?? 0 },
    { label: 'Одобрено', value: stats.approvedUsers ?? 0 },
    { label: 'Ожидают', value: stats.pendingUsers ?? 0 },
    { label: 'Постов', value: stats.totalPosts ?? 0 },
    { label: 'Альбомов', value: stats.totalAlbums ?? 0 },
    { label: 'Фото', value: stats.totalPhotos ?? 0 },
    { label: 'Наград', value: stats.totalAwards ?? 0 },
    { label: 'Событий', value: stats.totalEvents ?? 0 },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', background: '#07070C', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Grain */}
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <main style={{ flex: 1, maxWidth: '80rem', margin: '0 auto', width: '100%', padding: '7rem 1.5rem 4rem', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ height: 1, width: 24, background: 'rgba(201,165,85,0.55)' }} />
            <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.55)' }}>Администрирование</span>
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>Панель администратора</h1>
          <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.88rem', color: '#3A3840', marginTop: '0.5rem' }}>Управляйте сайтом и пользователями</p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[{ id: 'stats', label: 'Статистика', icon: FiBarChart2 }, { id: 'users', label: 'Пользователи', icon: FiUsers }].map((t) => (
            <motion.button key={t.id} onClick={() => setTab(t.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.4rem',
                borderRadius: 10, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.78rem',
                letterSpacing: '0.08em',
                background: tab === t.id ? 'rgba(201,165,85,0.12)' : 'rgba(255,255,255,0.04)',
                border: tab === t.id ? '1px solid rgba(201,165,85,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: tab === t.id ? '#C9A555' : '#6B6570',
                transition: 'all 0.25s',
              }}>
              <t.icon style={{ width: 14, height: 14 }} />
              {t.label}
              {t.id === 'users' && pendingCount > 0 && (
                <span style={{ padding: '0.1rem 0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, fontFamily: '"Jost"', fontSize: '0.65rem', color: '#ef4444' }}>{pendingCount}</span>
              )}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: 16 }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
            </div>
          </div>
        ) : tab === 'stats' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {statItems.map((s, i) => (
              <AdminStatCard key={s.label} icon={STAT_ICONS[i]} label={s.label} value={s.value} accent={STAT_ACCENTS[i]} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `Все (${users.length})` },
                { id: 'approved', label: `Одобренные (${users.length - pendingCount})` },
                { id: 'pending', label: `Ожидающие (${pendingCount})` },
              ].map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{ padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', background: filter === f.id ? 'rgba(201,165,85,0.1)' : 'rgba(255,255,255,0.04)', border: filter === f.id ? '1px solid rgba(201,165,85,0.25)' : '1px solid rgba(255,255,255,0.07)', color: filter === f.id ? '#C9A555' : '#6B6570', transition: 'all 0.2s' }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Users */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredUsers.map((u, i) => (
                <motion.div key={u._id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card3D intensity={4} style={{ borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', border: '1px solid rgba(201,165,85,0.1)', borderRadius: 14, flexWrap: 'wrap', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,165,85,0.1)'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A555, #836030)', border: '1px solid rgba(201,165,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.72rem', color: '#07070C', flexShrink: 0, overflow: 'hidden' }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.85rem', color: '#EDE0C4', margin: 0 }}>{u.name}</p>
                          <p style={{ fontFamily: '"Jost"', fontSize: '0.72rem', color: '#3A3840', margin: 0 }}>{u.email}</p>
                        </div>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: u.role === 'admin' ? 'rgba(201,165,85,0.12)' : 'rgba(255,255,255,0.05)', border: u.role === 'admin' ? '1px solid rgba(201,165,85,0.25)' : '1px solid rgba(255,255,255,0.08)', color: u.role === 'admin' ? '#C9A555' : '#6B6570' }}>
                          {u.role === 'admin' ? 'Админ' : 'Участник'}
                        </span>
                        {!u.approved && (
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, fontFamily: '"Jost"', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                            Не одобрен
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!u.approved && (
                          <motion.button onClick={() => handleApprove(u._id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.9rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.72rem', color: '#34D399' }}>
                            <FiCheckCircle style={{ width: 13, height: 13 }} /> Одобрить
                          </motion.button>
                        )}
                        {u._id !== (currentUser?._id || currentUser?.id) && (
                          <>
                            <motion.button onClick={() => handleToggleRole(u._id, u.role)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.9rem', background: 'rgba(201,165,85,0.08)', border: '1px solid rgba(201,165,85,0.15)', borderRadius: 8, cursor: 'pointer', fontFamily: '"Jost"', fontWeight: 600, fontSize: '0.72rem', color: '#C9A555' }}>
                              <FiShield style={{ width: 12, height: 12 }} />
                              {u.role === 'admin' ? 'Убрать' : 'Админ'}
                            </motion.button>
                            <motion.button onClick={() => handleDelete(u._id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#3A3840', transition: 'color 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#3A3840'}>
                              <FiTrash2 style={{ width: 15, height: 15 }} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <p style={{ textAlign: 'center', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.2rem', color: 'rgba(237,224,196,0.3)', padding: '4rem 0' }}>
                  {filter === 'pending' ? 'Нет пользователей, ожидающих одобрения' : 'Пользователи не найдены'}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </motion.div>
  );
}
