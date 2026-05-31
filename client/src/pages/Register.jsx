import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import ParticlesBackground from '../components/ParticlesBackground.jsx';

export default function Register() {
  const navigate    = useNavigate();
  const { register } = useAuth();

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [submitting,      setSubmitting]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Заполните все поля'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Введите корректный email'); return;
    }
    if (password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов'); return;
    }
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают'); return;
    }
    setSubmitting(true);
    try {
      const data = await register(name.trim(), email.trim(), password);
      toast.success(data.message || 'Регистрация прошла успешно!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  const pwdMatch = confirmPassword.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', display: 'flex', background: '#07070C' }}
    >
      {/* ═══ FORM PANEL ═══ */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
        background: '#07070C',
        order: 1,
      }}>
        {/* Subtle glow */}
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
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{
              display: 'block', marginBottom: 14,
              fontFamily: '"Jost", sans-serif', fontWeight: 600,
              fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
            }}>
              Регистрация
            </span>
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
              fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#EDE0C4', lineHeight: 1.1, margin: 0,
            }}>
              Присоединиться к классу
            </h1>
            <div style={{ height: 1, marginTop: 18, background: 'linear-gradient(to right, rgba(201,165,85,0.4), transparent)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ position: 'relative', marginBottom: 22 }}>
              <FiUser style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6570', width: 15, height: 15 }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Имя и фамилия"
                autoComplete="name"
                className="input-underline"
              />
            </div>

            {/* Email */}
            <div style={{ position: 'relative', marginBottom: 22 }}>
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
            <div style={{ position: 'relative', marginBottom: 22 }}>
              <FiLock style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6570', width: 15, height: 15 }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль (мин. 6 символов)"
                autoComplete="new-password"
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

            {/* Confirm password */}
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <FiLock style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6570', width: 15, height: 15 }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите пароль"
                autoComplete="new-password"
                className="input-underline pr-10"
                style={{
                  borderBottomColor: pwdMatch
                    ? password === confirmPassword
                      ? 'rgba(52,211,153,0.6)'
                      : 'rgba(239,68,68,0.5)'
                    : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3A3840', transition: 'color 0.2s', padding: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A555')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3840')}
              >
                {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            {/* Password match indicator */}
            <div style={{ height: 22, marginBottom: 20 }}>
              {pwdMatch && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: '"Jost", sans-serif',
                    fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.05em',
                    color: password === confirmPassword ? 'rgba(52,211,153,0.8)' : 'rgba(239,68,68,0.75)',
                    paddingLeft: '2rem',
                  }}
                >
                  {password === confirmPassword ? '✓ Пароли совпадают' : '✗ Пароли не совпадают'}
                </motion.p>
              )}
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
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </motion.button>
          </form>

          {/* Links */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(201,165,85,0.1)' }}>
            <p style={{ fontFamily: '"Jost", sans-serif', fontWeight: 300, fontSize: '0.82rem', color: '#6B6570', textAlign: 'center' }}>
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                style={{ color: '#C9A555', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E2C87A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#C9A555')}
              >
                Войдите
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

      {/* ═══ RIGHT DECORATIVE PANEL ═══ */}
      <div
        className="hidden lg:flex"
        style={{
          width: '44%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          background: '#0A0A12',
          borderLeft: '1px solid rgba(201,165,85,0.1)',
        }}
      >
        <ParticlesBackground />

        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(201,165,85,0.06) 0%, transparent 100%)',
        }} />

        {/* Ghost XI */}
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
            XI
          </span>
        </div>

        {/* Top logo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <span style={{
              fontFamily: '"Jost", sans-serif', fontWeight: 600,
              fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
            }}>
              Выпуск 2025–2026
            </span>
            <div style={{ height: 1, width: 28, background: '#C9A555' }} />
          </Link>
        </div>

        {/* Center */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 2.5rem 1.5rem' }}>
          <span style={{
            display: 'block', marginBottom: 20,
            fontFamily: '"Jost", sans-serif', fontWeight: 600,
            fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
          }}>
            Привилегированный доступ
          </span>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
            fontWeight: 300, fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            color: '#EDE0C4', lineHeight: 1.25, marginBottom: '1.25rem',
          }}>
            Место встречи<br />одноклассников
          </h2>
          <div style={{ height: 1, width: 48, background: '#C9A555', marginBottom: 20 }} />
          <p style={{
            fontFamily: '"Jost", sans-serif', fontWeight: 300,
            fontSize: '0.85rem', color: '#6B6570', lineHeight: 1.7, maxWidth: 260,
          }}>
            После регистрации администратор<br />одобрит ваш аккаунт.
          </p>
        </div>

        {/* Bottom stats */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '1.5rem 2.5rem',
          borderTop: '1px solid rgba(201,165,85,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}>
          {[['25+', 'Выпускников'], ['2026', 'Год'], ['∞', 'Дружба']].map(([num, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
                fontWeight: 300, fontSize: '1.8rem', color: '#C9A555', lineHeight: 1, margin: 0,
              }}>
                {num}
              </p>
              <p style={{
                fontFamily: '"Jost", sans-serif', fontWeight: 400,
                fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#3A3840', marginTop: 6,
              }}>
                {lbl}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
