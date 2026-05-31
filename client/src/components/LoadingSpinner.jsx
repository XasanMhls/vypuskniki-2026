import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950">
      {/* Spinning gradient ring */}
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-[3px] border-transparent"
          style={{
            borderTopColor: '#f59e0b',
            borderRightColor: '#8b5cf6',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-[2px] border-transparent"
          style={{
            borderBottomColor: '#f59e0b',
            borderLeftColor: '#7c3aed',
          }}
        />
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-purple-500" />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mt-6 text-sm text-gray-400 font-medium"
      >
        Загрузка...
      </motion.p>
    </div>
  );
}
