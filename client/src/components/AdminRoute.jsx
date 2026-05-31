import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-amber-400/50 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">🛡️</div>
          </div>
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
