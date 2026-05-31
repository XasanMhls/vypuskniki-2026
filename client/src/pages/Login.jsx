import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import ParticlesBackground from '../components/ParticlesBackground.jsx';

export default function Login() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Заполните все поля'); return; }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка входа. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', display: 'flex', background: '#07070C' }}
    >
      {/* ═══ LEFT DECORATIVE PANEL ═══ */}
      <div
        className="hidden lg:flex"
        style={{
          width: '44%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          background: '#0A0A12',
          borderRight: '1px solid rgba(201,165,85,0.1)',
        }}
      >
        <ParticlesBackground />

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,165,85,0.06) 0%, transparent 100%)',
        }} />

        {/* Ghost year */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden', userSelect: 'none',
        }}>
          <span style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '22vw', fontWeight: 600,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(201,165,85,0.08)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            2026
          </span>
        </div>

        {/* Top logo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ height: 1, width: 28, background: '#C9A555' }} />
            <span style={{
              fontFamily: '"Jost", sans-serif', fontWeight: 600,
              fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
            }}>
              Выпуск 2025–2026
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 2.5rem 1rem' }}>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
            fontWeight: 300, fontSize: 'clamp(2.5rem, 4vw, 3.8rem)',
            color: '#EDE0C4', lineHeight: 1.2, marginBottom: '1.5rem',
          }}>
            Добро<br />пожаловать
          </h2>
          <div style={{ height: 1, width: 48, background: '#C9A555', marginBottom: '1.25rem' }} />
          <p style={{
            fontFamily: '"Jost", sans-serif', fontWeight: 300,
            fontSize: '0.85rem', color: '#6B6570', lineHeight: 1.7, maxWidth: 280,
          }}>
            Войдите в аккаунт выпускника<br />и окунитесь в воспоминания.
          </p>
        </div>

        {/* Bottom quote */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '2rem 2.5rem',
          borderTop: '1px solid rgba(201,165,85,0.1)',
        }}>
          <p style={{
            fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
            fontWeight: 300, fontSize: '1.05rem',
            color: 'rgba(237,224,196,0.35)', lineHeight: 1.5,
          }}>
            «Школа закончилась,<br />но дружба — навсегда»
          </p>
          <p style={{
            marginTop: 10,
            fontFamily: '"Jost", sans-serif', fontWeight: 400,
            fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(201,165,85,0.35)',
          }}>
            — 11 класс, 2026
          </p>
        </div>
      </div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
        background: '#07070C',
      }}>
        {/* Subtle gradient */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,165,85,0.025) 0%, transparent 100%)',
        }} />

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: '2.5rem', alignSelf: 'flex-start', maxWidth: 400, width: '100%' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: '"Jost", sans-serif', fontWeight: 600,
            fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
          }}>
            <div style={{ height: 1, width: 20, background: '#C9A555' }} />
            Выпуск 2025–2026
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}
        >
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <span style={{
              display: 'block', marginBottom: 14,
              fontFamily: '"Jost", sans-serif', fontWeight: 600,
              fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
            }}>
              Авторизация
            </span>
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
              fontSize: 'clamp(2.2rem, 5vw, 3rem)', color: '#EDE0C4', lineHeight: 1.1, margin: 0,
            }}>
              Войти в аккаунт
            </h1>
            <div style={{ height: 1, marginTop: 20, background: 'linear-gradient(to right, rgba(201,165,85,0.4), transparent)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <FiMail style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6570', width: 15, height: 15 }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Электронная почта"
                autoComplete="email"
                className="input-underline"
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <FiLock style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6570', width: 15, height: 15 }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                className="input-underline pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3A3840', transition: 'color 0.2s', padding: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A555')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3840')}
              >
                {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? {} : { y: -1 }}
              whileTap={submitting ? {} : { scale: 0.99 }}
              className="btn-gold-solid"
              style={{ width: '100%', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '1.5px solid rgba(7,7,12,0.3)', borderTopColor: '#07070C',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Вход...
                </span>
              ) : 'Войти'}
            </motion.button>
          </form>

          {/* Links */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(201,165,85,0.1)' }}>
            <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.82rem', color: '#6B6570', textAlign: 'center' }}>
              Нет аккаунта?{' '}
              <Link
                to="/register"
                style={{ color: '#C9A555', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E2C87A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#C9A555')}
              >
                Зарегистрируйтесь
              </Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: 14 }}>
              <Link
                to="/"
                style={{
                  fontFamily: '"Jost", sans-serif', fontWeight: 400,
                  fontSize: '0.72rem', letterSpacing: '0.1em', color: '#3A3840', transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6B6570')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3840')}
              >
                ← На главную
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
