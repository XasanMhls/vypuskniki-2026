import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiPlus, FiCheck } from 'react-icons/fi';
import { HiOutlineTrophy } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext.jsx';

export default function AwardCard({ award, onVote, onNominate }) {
  const { user } = useAuth();
  const [showNominees, setShowNominees] = useState(false);

  const { _id, category, description, icon, nominees = [], isActive } = award;

  // Find the winner (most votes) if not active
  const sortedNominees = [...nominees].sort(
    (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
  );
  const winner = !isActive && sortedNominees.length > 0 ? sortedNominees[0] : null;
  const hasWinner = winner && (winner.votes?.length || 0) > 0;

  const hasUserVoted = (nominee) => {
    if (!user) return false;
    return nominee.votes?.some((v) => v === user._id || v === user.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden transition-colors duration-300 ${
        isActive
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-purple-500" />
      )}

      <div className="p-5">
        {/* Icon + Category */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl flex-shrink-0">{icon || '🏆'}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">{category}</h3>
            {description && (
              <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
            )}
          </div>
          {isActive && (
            <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 font-medium">
              Активно
            </span>
          )}
        </div>

        {/* Winner display (for finished awards) */}
        {!isActive && hasWinner && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineTrophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                Победитель
              </span>
            </div>
            <p className="text-white font-semibold">{winner.user?.name || 'Участник'}</p>
            <p className="text-xs text-gray-400">
              {winner.votes?.length || 0} голос(ов)
            </p>
          </div>
        )}

        {/* Nominees */}
        <div>
          <button
            onClick={() => setShowNominees(!showNominees)}
            className="w-full flex items-center justify-between text-sm text-gray-300 hover:text-white transition-colors mb-2"
          >
            <span className="flex items-center gap-1.5">
              <FiAward className="w-4 h-4" />
              Номинанты ({nominees.length})
            </span>
            <motion.span
              animate={{ rotate: showNominees ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {showNominees && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {sortedNominees.map((nominee, idx) => {
                    const voted = hasUserVoted(nominee);
                    const isWinnerNominee =
                      !isActive && idx === 0 && (nominee.votes?.length || 0) > 0;

                    return (
                      <div
                        key={nominee.user?._id || idx}
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                          isWinnerNominee
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isWinnerNominee && (
                            <span className="text-lg">👑</span>
                          )}
                          <span className="text-sm text-white">
                            {nominee.user?.name || 'Участник'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.span
                            key={nominee.votes?.length}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-gray-400"
                          >
                            {nominee.votes?.length || 0} гол.
                          </motion.span>

                          {isActive && onVote && (
                            <button
                              onClick={() => onVote(_id, nominee.user?._id)}
                              className={`p-1.5 rounded-lg transition-all text-xs ${
                                voted
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-white/5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/10'
                              }`}
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nominate button */}
        {isActive && onNominate && (
          <button
            onClick={() => onNominate(_id)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/20 text-sm text-amber-300 hover:text-amber-200 hover:from-amber-500/30 hover:to-purple-500/30 transition-all duration-200"
          >
            <FiPlus className="w-4 h-4" />
            Номинировать
          </button>
        )}
      </div>
    </motion.div>
  );
}
