import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiImage } from 'react-icons/fi';

export default function AlbumCard({ album }) {
  const id = album._id || album.id;
  const { title, coverImage, photos = [], createdBy } = album;

  return (
    <Link to={`/albums/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-white/10
                   hover:border-amber-500/25 hover:shadow-xl hover:shadow-black/40 transition-[border-color,box-shadow] duration-300"
      >
        {/* Cover image or gradient placeholder */}
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-slate-900 to-amber-900/30" />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

        {/* Hover brightness overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />

        {/* Photo count badge — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 text-xs text-gray-200">
          <FiImage className="w-3 h-3 opacity-80" />
          <span>{photos.length}</span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="text-white font-bold text-base leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors duration-200"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {title}
          </h3>
          {createdBy?.name && (
            <p className="text-gray-300 text-sm mt-1 opacity-80">{createdBy.name}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
