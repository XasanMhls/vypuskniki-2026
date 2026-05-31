import { motion } from 'framer-motion';

const colorMap = {
  amber: {
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    value: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
  purple: {
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-400',
    value: 'text-violet-400',
    glow: 'shadow-violet-500/10',
  },
  blue: {
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    value: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  green: {
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    value: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  pink: {
    border: 'border-pink-500/20',
    iconBg: 'bg-pink-500/10',
    iconText: 'text-pink-400',
    value: 'text-pink-400',
    glow: 'shadow-pink-500/10',
  },
  red: {
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    value: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
};

export default function StatsCard({ icon: Icon, label, value, color = 'amber' }) {
  const styles = colorMap[color] || colorMap.amber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative bg-white/5 backdrop-blur-xl border ${styles.border} rounded-2xl p-5 shadow-lg ${styles.glow} overflow-hidden`}
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${styles.iconText}`} />

      <div className="flex items-start justify-between gap-3">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className={`text-3xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </p>
          <p className="text-sm text-gray-400 mt-1 leading-snug">{label}</p>
        </div>

        {/* Icon circle */}
        {Icon && (
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${styles.iconText}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
