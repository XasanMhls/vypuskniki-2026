import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const navLinks = [
  { to: '/dashboard',  label: 'Главная'    },
  { to: '/graduates',  label: 'Выпускники' },
  { to: '/albums',     label: 'Альбомы'    },
  { to: '/wall',       label: 'Стена'      },
  { to: '/awards',     label: 'Награды'    },
  { to: '/timeline',   label: 'Хроника'    },
];

/* ─── 3D Nav Link ─────────────────────────────────────────── */
function NavLink3D({ to, label, active }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 25 });

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div style={{ perspective: 400 }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <Link
          to={to}
          style={{
            display: 'block',
            position: 'relative',
            padding: '8px 18px',
            fontFamily: '"Jost", sans-serif',
            fontWeight: active ? 600 : 400,
            fontSize: '0.8rem',
            letterSpacing: '0.07em',
            color: active ? '#C9A555' : '#6B6570',
            textDecoration: 'none',
            transition: 'color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#EDE0C4'; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6B6570'; }}
        >
          {/* active underline */}
          {active && (
            <motion.div
              layoutId="navUnderline"
              style={{ position: 'absolute', bottom: 4, left: 18, right: 18, height: 1, background: 'linear-gradient(to right, transparent, #C9A555, transparent)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          {/* hover glow chip */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: active ? 'rgba(201,165,85,0.07)' : 'transparent',
              border: active ? '1px solid rgba(201,165,85,0.12)' : '1px solid transparent',
              transition: 'all 0.2s',
              transform: 'translateZ(-4px)',
            }}
          />
          <span style={{ position: 'relative', transform: 'translateZ(4px)', display: 'block' }}>
            {label}
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Dropdown item ───────────────────────────────────────── */
function DropItem({ as: Tag = 'div', children, danger, ...props }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <Tag
        {...props}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '10px 18px',
          fontFamily: '"Jost", sans-serif', fontSize: '0.8rem', fontWeight: 400,
          color: hov ? (danger ? '#ef4444' : '#EDE0C4') : (danger ? '#6B4040' : '#6B6570'),
          background: hov ? (danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)') : 'transparent',
          textDecoration: 'none', cursor: 'pointer', border: 'none',
          transition: 'color 0.18s, background 0.18s',
          ...props.style,
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

/* ─── Main Navbar ─────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(7,7,12,0.97)' : 'rgba(7,7,12,0.8)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(201,165,85,0.1)',
      transition: 'background 0.4s ease',
    }}>
      {/* Gold hairline top */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.45), transparent)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              style={{ height: 1, width: 24, background: 'linear-gradient(to right, #C9A555, rgba(201,165,85,0.3))' }}
              whileHover={{ width: 40 }}
              transition={{ duration: 0.3 }}
            />
            <span style={{
              fontFamily: '"Jost", sans-serif', fontWeight: 700,
              fontSize: '0.68rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: '#C9A555',
            }}>
              Выпуск 2025–2026
            </span>
          </Link>

          {/* Desktop Nav Links — center */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
              className="hidden md:flex">
              {navLinks.map(link => (
                <NavLink3D key={link.to} to={link.to} label={link.label} active={isActive(link.to)} />
              ))}
              {user.role === 'admin' && (
                <NavLink3D to="/admin" label="Админ" active={isActive('/admin')} />
              )}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Desktop avatar dropdown */}
            {user && (
              <div ref={dropdownRef} style={{ position: 'relative' }} className="hidden md:block">
                <motion.button
                  onClick={() => setDropdownOpen(v => !v)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px 8px 8px',
                    background: dropdownOpen ? 'rgba(201,165,85,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${dropdownOpen ? 'rgba(201,165,85,0.25)' : 'rgba(201,165,85,0.1)'}`,
                    borderRadius: 40,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ padding: 1.5, background: 'linear-gradient(135deg, #C9A555, #836030)', borderRadius: '50%', flexShrink: 0 }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1.5px solid #07070C' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0F0F18, #1A1A28)', border: '1.5px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Jost", sans-serif', fontSize: '0.6rem', fontWeight: 700, color: '#C9A555' }}>
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily: '"Jost", sans-serif', fontWeight: 400, fontSize: '0.8rem', color: '#EDE0C4', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                    <FiChevronDown size={13} color="#6B6570" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96, rotateX: -8 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96, rotateX: -8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                        width: 220, overflow: 'hidden',
                        background: 'rgba(10,10,18,0.97)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(201,165,85,0.15)',
                        borderRadius: 14,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,165,85,0.05)',
                        transformOrigin: 'top right',
                      }}
                    >
                      {/* top gold shimmer */}
                      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.4), transparent)' }} />
                      {/* user info */}
                      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(201,165,85,0.08)' }}>
                        <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#EDE0C4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user.name}</p>
                        <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.72rem', color: '#3A3840', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{user.email}</p>
                      </div>
                      <div style={{ padding: '6px 0' }}>
                        <DropItem as={Link} to="/settings">
                          <FiUser size={13} /> Мой профиль
                        </DropItem>
                        <div style={{ height: 1, background: 'rgba(201,165,85,0.06)', margin: '4px 0' }} />
                        <DropItem as="button" onClick={logout} danger>
                          <FiLogOut size={13} /> Выйти
                        </DropItem>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile hamburger */}
            {user && (
              <motion.button
                onClick={() => setMobileOpen(v => !v)}
                whileTap={{ scale: 0.92 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38,
                  border: '1px solid rgba(201,165,85,0.15)',
                  borderRadius: 10,
                  color: '#6B6570', cursor: 'pointer',
                  background: mobileOpen ? 'rgba(201,165,85,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}
                className="md:hidden"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.35)'; e.currentTarget.style.color = '#EDE0C4'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,165,85,0.15)'; e.currentTarget.style.color = '#6B6570'; }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen
                    ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}><FiX size={18} /></motion.div>
                    : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}><FiMenu size={18} /></motion.div>
                  }
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && user && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', background: 'rgba(7,7,12,0.99)', borderTop: '1px solid rgba(201,165,85,0.1)' }}
          >
            <div style={{ padding: '12px 16px 20px' }}>
              {/* Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.to}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 10,
                        fontFamily: '"Jost", sans-serif',
                        fontWeight: isActive(link.to) ? 600 : 400,
                        fontSize: '0.9rem', letterSpacing: '0.05em',
                        color: isActive(link.to) ? '#C9A555' : '#6B6570',
                        background: isActive(link.to) ? 'rgba(201,165,85,0.07)' : 'transparent',
                        borderLeft: isActive(link.to) ? '2px solid rgba(201,165,85,0.5)' : '2px solid transparent',
                        textDecoration: 'none', transition: 'all 0.15s',
                      }}
                    >
                      {link.label}
                      {isActive(link.to) && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9A555' }} />}
                    </Link>
                  </motion.div>
                ))}
                {user.role === 'admin' && (
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.04, duration: 0.22 }}>
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontWeight: 500, fontSize: '0.9rem', color: '#A88440', textDecoration: 'none' }}>
                      <FiShield size={14} /> Панель администратора
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* User section */}
              <div style={{ borderTop: '1px solid rgba(201,165,85,0.08)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px 14px' }}>
                  <div style={{ padding: 2, background: 'linear-gradient(135deg, #C9A555, #836030)', borderRadius: '50%', flexShrink: 0 }}>
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #07070C', display: 'block' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0F0F18, #1A1A28)', border: '2px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Jost"', fontSize: '0.72rem', fontWeight: 700, color: '#C9A555' }}>{getInitials(user.name)}</div>
                    }
                  </div>
                  <div>
                    <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#EDE0C4', margin: 0 }}>{user.name}</p>
                    <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.72rem', color: '#3A3840', margin: '2px 0 0' }}>{user.email}</p>
                  </div>
                </div>
                <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#6B6570', textDecoration: 'none' }}>
                  <FiUser size={14} /> Мой профиль
                </Link>
                <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', borderRadius: 10, fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: '#6B4040', cursor: 'pointer', background: 'none', border: 'none' }}>
                  <FiLogOut size={14} /> Выйти из аккаунта
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
