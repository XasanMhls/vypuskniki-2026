import { motion } from 'framer-motion';
import { FiCalendar, FiStar, FiBookOpen, FiMusic, FiCamera } from 'react-icons/fi';

const typeConfig = {
  event: { icon: FiCalendar, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  milestone: { icon: FiStar, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  academic: { icon: FiBookOpen, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  social: { icon: FiMusic, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  photo: { icon: FiCamera, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30' },
};

export default function EventCard({ event }) {
  const { title, description, date, image, type = 'event' } = event;

  const config = typeConfig[type] || typeConfig.event;
  const IconComponent = config.icon;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const monthShort = date
    ? new Date(date).toLocaleDateString('ru-RU', { month: 'short' }).toUpperCase()
    : '';

  const day = date ? new Date(date).getDate() : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative flex gap-4 group"
    >
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full ${config.bg} border ${config.border} flex flex-col items-center justify-center`}
        >
          {date ? (
            <>
              <span className={`text-sm font-bold leading-none ${config.color}`}>{day}</span>
              <span className={`text-[9px] uppercase leading-none mt-0.5 ${config.color} opacity-70`}>
                {monthShort}
              </span>
            </>
          ) : (
            <IconComponent className={`w-5 h-5 ${config.color}`} />
          )}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-white/20 to-transparent min-h-[20px]" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors duration-300">
          {/* Image */}
          {image && (
            <div className="relative overflow-hidden">
              <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          <div className="p-4">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}
              >
                <IconComponent className="w-3 h-3" />
                {type === 'milestone'
                  ? 'Веха'
                  : type === 'academic'
                  ? 'Учёба'
                  : type === 'social'
                  ? 'Мероприятие'
                  : type === 'photo'
                  ? 'Фото'
                  : 'Событие'}
              </span>
              {formattedDate && (
                <span className="text-xs text-gray-500">{formattedDate}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors duration-200">
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
