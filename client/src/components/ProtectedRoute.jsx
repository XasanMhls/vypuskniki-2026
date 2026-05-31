import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#07070C', position: 'relative', overflow: 'hidden',
      }}>
        {/* ambient orb */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,165,85,0.04), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {/* Spinner rings */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            {/* Outer ring */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,165,85,0.1)' }} />
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.3)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner ring */}
            <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(201,165,85,0.06)' }} />
            <motion.div
              style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid transparent', borderBottomColor: 'rgba(201,165,85,0.5)', borderLeftColor: 'rgba(201,165,85,0.2)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            {/* Center dot */}
            <motion.div
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9A555' }} />
            </motion.div>
          </div>

          {/* Label */}
          <motion.p
            style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.4)', margin: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Загрузка
          </motion.p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
