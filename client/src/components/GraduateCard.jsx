import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GraduateCard({ graduate }) {
  const navigate = useNavigate();
  const id = graduate._id || graduate.id;
  const { name, nickname, avatar, quote, dream } = graduate;

  const getInitials = (n) => {
    if (!n) return '?';
    return n.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      onClick={() => navigate(`/graduates/${id}`)}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,165,85,0.12)',
        borderRadius: 20,
        padding: '1.5rem 1.25rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(201,165,85,0.35)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(201,165,85,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(201,165,85,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.4), transparent)' }} />
      {/* Corner glow on hover */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.08), transparent)', filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Avatar with gold ring */}
        <div style={{ marginBottom: '1rem', padding: 2, background: 'linear-gradient(135deg, #C9A555, #836030, #E2C87A)', borderRadius: '50%', boxShadow: '0 0 20px rgba(201,165,85,0.2)', transform: 'translateZ(16px)' }}>
          {avatar ? (
            <img src={avatar} alt={name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid #07070C' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0F0F18, #1A1A28)', border: '2px solid #07070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.6rem', color: '#C9A555' }}>
              {getInitials(name)}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '1.15rem', color: '#EDE0C4', margin: '0 0 2px', lineHeight: 1.2, transform: 'translateZ(10px)', transition: 'color 0.2s' }}>
          {name}
        </h3>

        {nickname && <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: 'rgba(201,165,85,0.6)', margin: 0, letterSpacing: '0.05em' }}>({nickname})</p>}

        {/* Divider */}
        <div style={{ width: '100%', margin: '0.9rem 0', height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.2), transparent)' }} />

        {/* Quote */}
        {quote ? (
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '0.92rem', color: '#6B6570', lineHeight: 1.55, padding: '0 0.5rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            <span style={{ color: 'rgba(201,165,85,0.7)', fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 2 }}>❝</span>
            {quote}
            <span style={{ color: 'rgba(201,165,85,0.7)', fontSize: '1.1rem', verticalAlign: 'middle', marginLeft: 2 }}>❞</span>
          </p>
        ) : (
          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#2A2830', fontStyle: 'italic', margin: 0 }}>Цитата не указана</p>
        )}

        {/* Dream */}
        {dream && (
          <div style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>🚀</span>
            <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: '#3A3840', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{dream}</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 6, opacity: 0, transition: 'opacity 0.2s' }}
          onMouseEnter={e => { const parent = e.currentTarget.closest('[data-hover]'); }}
        >
        </div>
        <motion.p initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
          style={{ marginTop: '0.85rem', fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.7)' }}>
          Открыть профиль →
        </motion.p>
      </div>
    </motion.div>
  );
}
