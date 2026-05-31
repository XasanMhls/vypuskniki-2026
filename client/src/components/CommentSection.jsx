import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext.jsx';

export default function CommentSection({ comments = [], onAddComment, postId }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting || !onAddComment) return;

    setSubmitting(true);
    try {
      await onAddComment(postId, trimmed);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      {/* Comments list */}
      <div className="space-y-3 mb-3">
        <AnimatePresence initial={false}>
          {comments.map((comment, idx) => {
            const author = comment.author || comment.user;
            const timeAgo = comment.createdAt
              ? formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })
              : '';

            return (
              <motion.div
                key={comment._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2.5"
              >
                {/* Avatar */}
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/80 to-purple-600/80 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                    {getInitials(author?.name)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 rounded-xl px-3 py-2">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-white">
                        {author?.name || 'Аноним'}
                      </span>
                      {timeAgo && (
                        <span className="text-[10px] text-gray-500">{timeAgo}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {comment.text || comment.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">
            Пока нет комментариев
          </p>
        )}
      </div>

      {/* Input */}
      {user && (
        <div className="flex items-center gap-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/80 to-purple-600/80 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {getInitials(user.name)}
            </div>
          )}

          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать комментарий..."
              disabled={submitting}
              className="w-full px-3 py-2 pr-10 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
