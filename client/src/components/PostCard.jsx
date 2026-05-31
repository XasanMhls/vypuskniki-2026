import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiTrash2, FiBookmark, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext.jsx';
import CommentSection from './CommentSection.jsx';

const typeBadges = {
  memory: {
    label: 'Воспоминание',
    classes: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  },
  announcement: {
    label: 'Объявление',
    classes: 'bg-red-500/15 text-red-300 border border-red-500/20',
  },
  wish: {
    label: 'Пожелание',
    classes: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  },
  story: {
    label: 'История',
    classes: 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  },
};

export default function PostCard({ post, onLike, onComment, onDelete, currentUserId, isAdmin }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const {
    _id,
    author,
    content,
    image,
    type,
    likes = [],
    comments = [],
    isPinned,
    createdAt,
  } = post;

  const resolvedUserId = currentUserId ?? user?._id ?? user?.id;
  const isLiked = resolvedUserId && likes.some((id) => id === resolvedUserId);
  const isOwner = resolvedUserId && (author?._id === resolvedUserId);
  const canDelete = isOwner || isAdmin || user?.role === 'admin';
  const badge = typeBadges[type];

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru })
    : '';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden transition-[border-color] duration-300 ${
        isPinned
          ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
          : 'border-white/10 hover:border-white/15'
      }`}
    >
      {/* Pinned top indicator strip */}
      {isPinned && (
        <div className="flex items-center gap-1.5 px-5 pt-3 pb-0 text-xs text-amber-400/90">
          <FiBookmark className="w-3 h-3 fill-amber-400" />
          <span className="font-medium tracking-wide">Закреплено</span>
        </div>
      )}

      <div className="p-5">
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Author info */}
          <div className="flex items-center gap-3 min-w-0">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md shadow-amber-500/20">
                {getInitials(author?.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {author?.name || 'Аноним'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
            </div>
          </div>

          {/* Right: badge + pin icon + delete */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {badge && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.classes}`}>
                {badge.label}
              </span>
            )}
            {isPinned && (
              <FiBookmark className="w-4 h-4 text-amber-400 fill-amber-400 opacity-70" />
            )}
            {canDelete && onDelete && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(_id)}
                title="Удалить"
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mt-3">
          {content}
        </p>

        {/* ── Image ── */}
        {image && (
          <div className="mt-3.5 rounded-xl overflow-hidden border border-white/5">
            <img
              src={image}
              alt="Фото к посту"
              className="w-full max-h-72 object-cover"
            />
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-white/5">
          {/* Like */}
          <motion.button
            whileTap={{ scale: 1.4 }}
            onClick={() => onLike && onLike(_id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
              isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
            }`}
          >
            <FiHeart
              className={`w-[18px] h-[18px] transition-all duration-200 ${isLiked ? 'fill-red-400 stroke-red-400' : ''}`}
            />
            {likes.length > 0 && <span>{likes.length}</span>}
          </motion.button>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200"
          >
            <FiMessageCircle className="w-[18px] h-[18px]" />
            {comments.length > 0 && <span className="font-medium">{comments.length}</span>}
            {showComments ? (
              <FiChevronUp className="w-3.5 h-3.5" />
            ) : (
              <FiChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* ── Comments section ── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/5">
                <CommentSection
                  comments={comments}
                  onAddComment={onComment}
                  postId={_id}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
