import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiImage, FiLock, FiGlobe } from 'react-icons/fi';

const isVideo = (url) => url && url.startsWith('data:video/');

export default function AlbumCard({ album }) {
  const id = album._id || album.id;
  const { title, coverImage, photos = [], createdBy, isPublic } = album;

  // Find the first photo/video URL for cover
  const coverSrc = coverImage || (photos[0]?.url ?? null);
  const coverIsVideo = isVideo(coverSrc);

  return (
    <Link to={`/albums/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          aspectRatio: '4/3',
          cursor: 'pointer',
          border: '1px solid rgba(201,165,85,0.12)',
          background: '#0A0A12',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(201,165,85,0.4)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,165,85,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(201,165,85,0.12)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
        }}
      >
        {/* Cover media */}
        {coverSrc ? (
          coverIsVideo ? (
            <video
              src={coverSrc}
              muted
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={coverSrc}
              alt={title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          )
        ) : (
          /* Placeholder gradient */
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,165,85,0.08) 0%, rgba(7,7,12,0.95) 60%, rgba(201,165,85,0.04) 100%)',
          }}>
            {/* Subtle grid pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'linear-gradient(rgba(201,165,85,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,165,85,0.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            <FiImage style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, color: 'rgba(201,165,85,0.15)' }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,7,12,0.92) 0%, rgba(7,7,12,0.3) 50%, rgba(7,7,12,0.05) 100%)' }} />

        {/* Badges top */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          {/* Privacy badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 100,
            background: 'rgba(7,7,12,0.75)', backdropFilter: 'blur(8px)',
            border: `1px solid ${isPublic ? 'rgba(201,165,85,0.3)' : 'rgba(255,255,255,0.12)'}`,
            color: isPublic ? '#C9A555' : 'rgba(237,224,196,0.4)',
            fontSize: '0.6rem', fontFamily: '"Jost", sans-serif', fontWeight: 600, letterSpacing: '0.1em',
          }}>
            {isPublic
              ? <FiGlobe style={{ width: 9, height: 9 }} />
              : <FiLock style={{ width: 9, height: 9 }} />
            }
            {isPublic ? 'Публичный' : 'Приватный'}
          </div>
          {/* Photo count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 100,
            background: 'rgba(7,7,12,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(237,224,196,0.5)', fontSize: '0.6rem',
            fontFamily: '"Jost", sans-serif', fontWeight: 600, letterSpacing: '0.1em',
          }}>
            <FiImage style={{ width: 9, height: 9 }} />
            {photos.length}
          </div>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
          <h3 style={{
            fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400,
            fontSize: '1.15rem', color: '#EDE0C4', margin: 0, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'color 0.25s',
          }}>
            {title}
          </h3>
          {createdBy?.name && (
            <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', color: 'rgba(201,165,85,0.5)', margin: '4px 0 0', letterSpacing: '0.05em' }}>
              {createdBy.name}
            </p>
          )}
        </div>

        {/* Gold shimmer on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(201,165,85,0) 0%, rgba(201,165,85,0.04) 50%, rgba(201,165,85,0) 100%)',
          opacity: 0, transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }} className="album-card-shimmer" />
      </motion.div>
    </Link>
  );
}
