import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import ParticlesBackground from '../components/ParticlesBackground.jsx';
import Footer from '../components/Footer.jsx';

const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ'];

/* ── Pixel sparkle cursor effect ── */
function HeroSparkle({ heroRef }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const lastPos = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawnAt = (x, y) => {
      const count = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -(Math.random() * 2.2 + 0.8),
          r: Math.random() * 2.2 + 0.6,
          life: 1,
          decay: Math.random() * 0.022 + 0.018,
          shape: Math.random() < 0.4 ? 'diamond' : 'circle',
          rot: Math.random() * Math.PI,
          rotV: (Math.random() - 0.5) * 0.12,
        });
      }
    };

    const onMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      if (Math.hypot(dx, dy) > 6) {
        spawnAt(x, y);
        lastPos.current = { x, y };
      }
    };

    hero.addEventListener('mousemove', onMouseMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // slight gravity
        p.rot += p.rotV;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = alpha > 0.6 ? '#E2C87A' : '#C9A555';

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.shape === 'diamond') {
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.moveTo(0, -p.r * 1.4);
          ctx.lineTo(p.r, 0);
          ctx.lineTo(0, p.r * 1.4);
          ctx.lineTo(-p.r, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glow halo on bright particles
        if (p.life > 0.5 && p.r > 1.2) {
          ctx.globalAlpha = alpha * 0.3;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 3.5);
          g.addColorStop(0, '#C9A555');
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      hero.removeEventListener('mousemove', onMouseMove);
    };
  }, [heroRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 6,
      }}
    />
  );
}

/* ── "11 Г" character hover reveal ── */
function ElevenG({ heroHover, mousePos }) {
  const chars = ['1', '1', '\u00A0', 'Г'];
  const charRefs = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const update = () => {
      charRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mousePos.current.x - cx, mousePos.current.y - cy);

        const maxDist = 320;
        const proximity = heroHover.current
          ? Math.max(0, 1 - dist / maxDist)
          : 0;

        // Base visibility even without hover: 0.08
        // With hover but no proximity: 0.22
        // With proximity: up to 1.0
        const base   = heroHover.current ? 0.22 : 0.08;
        const opacity = base + proximity * 0.78;
        const blur   = Math.max(0, 4 - proximity * 4);
        const glow   = proximity * 80;
        const scale  = 1 + proximity * 0.06;

        el.style.opacity  = opacity.toFixed(3);
        el.style.filter   = `blur(${blur.toFixed(1)}px)`;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.textShadow = proximity > 0.15
          ? `0 0 ${glow}px rgba(201,165,85,${(proximity * 0.9).toFixed(2)}), 0 0 ${glow * 1.8}px rgba(201,165,85,${(proximity * 0.4).toFixed(2)})`
          : 'none';
        el.style.WebkitTextStrokeColor = `rgba(201,165,85,${(0.3 + proximity * 0.55).toFixed(2)})`;
      });

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [heroHover, mousePos]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', overflow: 'hidden', userSelect: 'none',
        zIndex: 4,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {chars.map((ch, i) => (
            <span
              key={i}
              ref={el => (charRefs.current[i] = el)}
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(5rem, 14vw, 14rem)',
                fontWeight: 300,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(201,165,85,0.3)',
                letterSpacing: ch === '\u00A0' ? '0.05em' : '0.12em',
                lineHeight: 1,
                opacity: 0.08,
                filter: 'blur(4px)',
                display: 'inline-block',
                transformOrigin: 'center',
                transition: 'none',
                willChange: 'opacity, filter, transform, text-shadow',
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.75rem', marginTop: '1.25rem',
            opacity: 0.08,
            transition: 'opacity 0.8s ease',
          }}
          ref={el => {
            if (el) {
              const update = () => {
                el.style.opacity = heroHover.current ? '0.35' : '0.08';
              };
              const id = setInterval(update, 200);
              return () => clearInterval(id);
            }
          }}
        >
          <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(201,165,85,0.5)' }} />
          <span style={{
            fontFamily: '"Jost", sans-serif', fontWeight: 600,
            fontSize: '0.65rem', letterSpacing: '0.55em', textTransform: 'uppercase',
            color: 'rgba(201,165,85,0.8)',
          }}>
            Выпускники
          </span>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(201,165,85,0.5)' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Shooting star ── */
function ShootingStar() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    let id = 0;
    const spawn = () => {
      const star = {
        id: id++,
        top: `${15 + Math.random() * 55}%`,
        angle: 30 + Math.random() * 20,
        delay: 0,
        len: 80 + Math.random() * 120,
      };
      setStars(s => [...s, star]);
      setTimeout(() => setStars(s => s.filter(x => x.id !== star.id)), 1200);
      setTimeout(spawn, 5000 + Math.random() * 8000);
    };
    const t = setTimeout(spawn, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 8 }}>
      <AnimatePresence>
        {stars.map(s => (
          <motion.div key={s.id}
            initial={{ x: '-5vw', y: 0, opacity: 0 }}
            animate={{ x: '110vw', y: '-30vh', opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0, 0.8, 1] }}
            style={{
              position: 'absolute', top: s.top, left: 0,
              width: s.len, height: 1.5,
              background: 'linear-gradient(to right, transparent, #E2C87A 40%, #ffffff 60%, transparent)',
              filter: 'blur(0.4px)',
              boxShadow: '0 0 8px 1px rgba(226,200,122,0.6), 0 0 20px 2px rgba(201,165,85,0.25)',
              borderRadius: 2,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', inView }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || target === '∞') return;
    const num = parseInt(target, 10);
    let frame = 0;
    const total = 90;
    const tick = () => {
      frame++;
      setVal(Math.floor(num * (frame / total)));
      if (frame < total) requestAnimationFrame(tick);
      else setVal(num);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  if (target === '∞') return <span>∞</span>;
  return <span>{val}{suffix}</span>;
}

/* ── Stat block ── */
function Stat({ value, suffix, label, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ width: 24, height: 1, background: '#C9A555', margin: '0 auto 20px' }} />
      <div style={{
        fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
        fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 300, color: '#C9A555', lineHeight: 1,
      }}>
        <Counter target={value} suffix={suffix} inView={inView} />
      </div>
      <p style={{
        marginTop: 12, fontFamily: '"Jost", sans-serif', fontWeight: 400,
        fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B6570',
      }}>
        {label}
      </p>
    </motion.div>
  );
}

/* ── Feature card with 3D tilt ── */
function FeatureCard({ numeral, title, description, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0); y.set(0);
    setHovered(false);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.75, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d', perspective: 800,
        position: 'relative', padding: '2rem 2.5rem', cursor: 'default',
        borderTop: hovered ? '1px solid rgba(201,165,85,0.5)' : '1px solid rgba(201,165,85,0.18)',
        transition: 'border-color 0.4s ease',
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(201,165,85,0.05), transparent)',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', transformStyle: 'preserve-3d' }}>
        <span style={{
          display: 'block', marginBottom: 20, fontFamily: '"Jost", sans-serif', fontWeight: 600,
          fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A555',
          transform: 'translateZ(12px)',
        }}>
          {numeral}
        </span>
        <h3 style={{
          marginBottom: 12, fontFamily: '"Cormorant Garamond", serif', fontWeight: 500,
          fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', color: '#EDE0C4', lineHeight: 1.25,
          transform: 'translateZ(8px)',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: '"Jost", sans-serif', fontWeight: 300,
          fontSize: '0.88rem', color: '#6B6570', lineHeight: 1.75,
        }}>
          {description}
        </p>
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'center', gap: 8,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease',
          transform: 'translateZ(16px)',
        }}>
          <div style={{ height: 1, width: 24, background: '#C9A555' }} />
          <span style={{ color: '#C9A555', fontSize: '0.75rem' }}>→</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const heroRef   = useRef(null);
  const heroHoverRef = useRef(false);
  const mousePosRef  = useRef({ x: -999, y: -999 });
  const [heroHoverState, setHeroHoverState] = useState(false);

  // Smooth mouse parallax for hero title
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const titleX  = useTransform(springX, [-1, 1], [-18, 18]);
  const titleY  = useTransform(springY, [-1, 1], [-10, 10]);
  const subX    = useTransform(springX, [-1, 1], [-8, 8]);
  const subY    = useTransform(springY, [-1, 1], [-5, 5]);
  const bgX     = useTransform(springX, [-1, 1], [10, -10]);
  const bgY     = useTransform(springY, [-1, 1], [6, -6]);

  const onHeroEnter = useCallback(() => {
    heroHoverRef.current = true;
    setHeroHoverState(true);
  }, []);
  const onHeroLeave = useCallback(() => {
    heroHoverRef.current = false;
    setHeroHoverState(false);
    mousePosRef.current = { x: -999, y: -999 };
    mouseX.set(0); mouseY.set(0);
  }, [mouseX, mouseY]);
  const onHeroMouseMove = useCallback((e) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    const w = window.innerWidth, h = window.innerHeight;
    mouseX.set((e.clientX / w - 0.5) * 2);
    mouseY.set((e.clientY / h - 0.5) * 2);
  }, [mouseX, mouseY]);

  const features = [
    { title: 'Профили выпускников',  description: 'Узнайте о мечтах, достижениях и судьбе каждого выпускника' },
    { title: 'Фотоальбомы',          description: 'Сохраните лучшие совместные моменты навсегда' },
    { title: 'Стена воспоминаний',   description: 'Делитесь историями, пожеланиями и добрыми словами' },
    { title: 'Награды класса',        description: 'Голосуйте и чествуйте лучших из лучших среди вас' },
    { title: 'Хроника событий',      description: 'Вся история класса на единой временной ленте' },
    { title: 'Только для своих',     description: 'Приватный доступ исключительно для участников класса' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      style={{ background: '#07070C', minHeight: '100vh' }}
    >
      {/* ═══════════════ HERO ═══════════════ */}
      <section
        ref={heroRef}
        onMouseEnter={onHeroEnter}
        onMouseLeave={onHeroLeave}
        onMouseMove={onHeroMouseMove}
        style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', cursor: 'default',
          background: 'radial-gradient(ellipse at 50% 60%, #0F0F18 0%, #07070C 65%)',
        }}
      >
        {/* Stars */}
        <ParticlesBackground />

        {/* Shooting stars */}
        <ShootingStar />

        {/* Ghost year — parallax counter-layer */}
        <motion.div aria-hidden="true" style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', overflow: 'hidden', userSelect: 'none', zIndex: 1,
          x: bgX, y: bgY,
        }}>
          <span style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(14rem, 34vw, 32rem)', fontWeight: 600,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(201,165,85,0.06)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            2026
          </span>
        </motion.div>

        {/* "11 Г" interactive reveal */}
        <ElevenG heroHover={heroHoverRef} mousePos={mousePosRef} />

        {/* Sparkle cursor */}
        <HeroSparkle heroRef={heroRef} />

        {/* Dynamic mouse glow spotlight */}
        <motion.div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(201,165,85,0.055) 0%, transparent 100%)',
        }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Top vignette */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, #07070C, transparent)', pointerEvents: 'none', zIndex: 2 }} />
        {/* Bottom vignette */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, #07070C, transparent)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Main content */}
        <div style={{
          position: 'relative', zIndex: 10, textAlign: 'center',
          padding: '0 1.5rem', maxWidth: '72rem', margin: '0 auto', width: '100%',
        }}>
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'center', marginBottom: '3rem' }}
          >
            <motion.div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.6))' }}
              animate={{ width: ['0px', 'clamp(3rem,6vw,6rem)'] }} transition={{ duration: 1.2, delay: 0.6, ease: [0.22,1,0.36,1] }} />
            <span style={{
              fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.68rem',
              letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A555',
              padding: '6px 16px',
              border: '1px solid rgba(201,165,85,0.18)',
              borderRadius: 20,
              background: 'rgba(201,165,85,0.05)',
            }}>
              Выпуск · 11 класс · 2025–2026
            </span>
            <motion.div style={{ height: 1, background: 'linear-gradient(to left, transparent, rgba(201,165,85,0.6))' }}
              animate={{ width: ['0px', 'clamp(3rem,6vw,6rem)'] }} transition={{ duration: 1.2, delay: 0.6, ease: [0.22,1,0.36,1] }} />
          </motion.div>

          {/* ── TITLE with parallax + shimmer ── */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: '"Cormorant Garamond", serif', lineHeight: 0.9, margin: 0 }}
          >
            {/* "Навсегда" — shimmer sweep + parallax */}
            <motion.span
              style={{
                display: 'block',
                fontSize: 'clamp(5rem, 16vw, 13rem)',
                fontWeight: 300, fontStyle: 'italic',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(105deg, #C4B08A 0%, #EDE0C4 30%, #F8F0D8 45%, #FFFBF0 50%, #F8F0D8 55%, #EDE0C4 70%, #C4B08A 100%)',
                backgroundSize: '250% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                x: titleX, y: titleY,
                filter: 'drop-shadow(0 0 60px rgba(201,165,85,0.18))',
              }}
              animate={{ backgroundPosition: ['150% center', '-80% center', '150% center'] }}
              transition={{ duration: 6, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            >
              Навсегда
            </motion.span>

            {/* "в наших сердцах" — lighter parallax */}
            <motion.span
              style={{
                display: 'block',
                fontSize: 'clamp(1.8rem, 6vw, 5rem)',
                fontWeight: 300,
                color: 'rgba(237,224,196,0.38)',
                letterSpacing: '0.08em',
                marginTop: '0.15em',
                x: subX, y: subY,
              }}
            >
              в наших сердцах
            </motion.span>
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'center', margin: '2.8rem 0' }}
          >
            <div style={{ height: 1, width: 80, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.35))' }} />
            <motion.span
              style={{ color: '#C9A555', fontSize: 6, display: 'block' }}
              animate={{ rotate: [0, 180, 360], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >◆</motion.span>
            <div style={{ height: 1, width: 80, background: 'linear-gradient(to left, transparent, rgba(201,165,85,0.35))' }} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}
          >
            {user ? (
              <Link to="/dashboard" className="btn-gold-solid">В личный кабинет →</Link>
            ) : (
              <>
                <Link to="/login" className="btn-gold-solid">Войти</Link>
                <Link to="/register" className="btn-gold-outline">Регистрация</Link>
              </>
            )}
          </motion.div>
        </div>

        {/* 3D Floating geometry — enhanced */}
        {[
          { size: 130, top: '10%', left: '4%',  delay: 0,   dur: 14, rot: 45  },
          { size: 75,  top: '18%', right: '6%', delay: 2,   dur: 18, rot: 20  },
          { size: 55,  top: '68%', left: '8%',  delay: 1,   dur: 12, rot: 60  },
          { size: 95,  top: '74%', right: '4%', delay: 3,   dur: 16, rot: 30  },
          { size: 42,  top: '38%', left: '2%',  delay: 1.5, dur: 20, rot: 15  },
          { size: 65,  top: '52%', right: '10%',delay: 0.5, dur: 22, rot: 75  },
          { size: 35,  top: '28%', left: '18%', delay: 2.5, dur: 17, rot: 10  },
          { size: 48,  top: '62%', right: '20%',delay: 1.2, dur: 19, rot: 50  },
        ].map((g, i) => (
          <motion.div
            key={i} aria-hidden="true"
            animate={{ y: [0, -18, 0], rotate: [g.rot, g.rot + 22, g.rot], opacity: [0.05, 0.14, 0.05] }}
            transition={{ duration: g.dur, repeat: Infinity, ease: 'easeInOut', delay: g.delay }}
            style={{
              position: 'absolute', width: g.size, height: g.size,
              top: g.top, left: g.left, right: g.right,
              border: `1px solid rgba(201,165,85,${i % 3 === 0 ? 0.3 : 0.18})`,
              borderRadius: i % 2 === 0 ? '6px' : '50%',
              background: i % 3 === 0
                ? 'linear-gradient(135deg, rgba(201,165,85,0.06), transparent)'
                : 'transparent',
              pointerEvents: 'none', zIndex: 5,
              transformStyle: 'preserve-3d',
              backdropFilter: 'blur(1px)',
            }}
          />
        ))}

        {/* Scroll cue */}
        <motion.div
          style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 10,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.2 }}
        >
          <span style={{
            fontFamily: '"Jost", sans-serif', fontSize: '0.58rem', fontWeight: 600,
            letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.4)',
          }}>
            Листайте
          </span>
          <div style={{ position: 'relative', width: 22, height: 36, border: '1px solid rgba(201,165,85,0.2)', borderRadius: 11 }}>
            <motion.div
              animate={{ y: [4, 18, 4], opacity: [1, 0, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#C9A555' }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section style={{
        position: 'relative', padding: 'clamp(4rem, 10vw, 10rem) 0',
        overflow: 'hidden', background: 'linear-gradient(to bottom, #07070C, #0A0A12)',
      }}>
        <div className="rule-gold" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 5rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 'clamp(3rem, 7vw, 7rem)' }}
          >
            <span style={{
              display: 'block', marginBottom: 20, fontFamily: '"Jost", sans-serif', fontWeight: 600,
              fontSize: '0.68rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#C9A555',
            }}>
              Возможности
            </span>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif', fontWeight: 300,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#EDE0C4', lineHeight: 1.15, margin: 0,
            }}>
              Наш класс —<br /><em>наша история</em>
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} numeral={ROMAN[i]} title={f.title} description={f.description} index={i} />
            ))}
          </div>
        </div>
        <div className="rule-gold" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </section>

      {/* ═══════════════ QUOTE ═══════════════ */}
      <section style={{ position: 'relative', padding: 'clamp(5rem, 12vw, 13rem) 0', overflow: 'hidden', background: '#07070C' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.3 }}>
            <div className="rule-gold" style={{ marginBottom: '4rem' }} />
            <blockquote>
              <p style={{
                fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(2rem, 5.5vw, 4rem)', color: '#EDE0C4', lineHeight: 1.35, margin: 0,
              }}>
                Школа закончилась,<br />но дружба — навсегда
              </p>
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: '3.5rem' }}>
              <div style={{ height: 1, width: 48, background: 'rgba(201,165,85,0.3)' }} />
              <span style={{ color: '#C9A555', fontSize: 7 }}>◆</span>
              <div style={{ height: 1, width: 48, background: 'rgba(201,165,85,0.3)' }} />
            </div>
            <div className="rule-gold" style={{ marginTop: '4rem' }} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 10rem) 0', overflow: 'hidden', background: '#0A0A12' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 4rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.85 }}
            style={{ textAlign: 'center', marginBottom: '5rem' }}
          >
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif', fontWeight: 300,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#EDE0C4', margin: 0,
            }}>
              Мы — класс, который запомнят
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2.5rem 2rem' }}>
            <Stat value="25"   suffix="+" label="Выпускников"  index={0} />
            <Stat value="1000" suffix="+" label="Воспоминаний" index={1} />
            <Stat value="4"              label="Года вместе"   index={2} />
            <Stat value="∞"             label="Дружба"        index={3} />
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section style={{
        position: 'relative', padding: 'clamp(5rem, 12vw, 13rem) 0',
        overflow: 'hidden', background: 'linear-gradient(to bottom, #0A0A12, #07070C)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,165,85,0.04) 0%, transparent 100%)',
        }} />
        <div className="rule-gold" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '42rem', margin: '0 auto', padding: '0 1.5rem' }}
        >
          <span style={{
            display: 'block', marginBottom: '1.5rem', fontFamily: '"Jost", sans-serif', fontWeight: 600,
            fontSize: '0.68rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#C9A555',
          }}>
            Присоединяйтесь
          </span>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif', fontWeight: 300,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#EDE0C4', lineHeight: 1.2, margin: '0 0 1.5rem',
          }}>
            Станьте частью<br /><em>нашей истории</em>
          </h2>
          <p style={{
            marginBottom: '3rem', fontFamily: '"Jost", sans-serif', fontWeight: 300,
            fontSize: '0.95rem', color: '#6B6570', lineHeight: 1.85,
          }}>
            Делитесь воспоминаниями, смотрите фото<br />
            и оставайтесь на связи с одноклассниками.
          </p>
          {user
            ? <Link to="/dashboard" className="btn-gold-solid">В личный кабинет →</Link>
            : <Link to="/register" className="btn-gold-solid">Зарегистрироваться</Link>
          }
        </motion.div>
      </section>

      <Footer />
    </motion.div>
  );
}
