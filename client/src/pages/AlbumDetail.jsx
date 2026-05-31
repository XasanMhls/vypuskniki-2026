import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiX, FiChevronLeft, FiChevronRight, FiImage,
  FiLock, FiGlobe, FiFilm, FiTrash2,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import MediaUpload from '../components/MediaUpload.jsx';

const isVideoUrl = (url) => url && url.startsWith('data:video/');

function pluralMedia(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'файл';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'файла';
  return 'файлов';
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,165,85,0.15)',
  borderRadius: 10, color: '#EDE0C4', fontFamily: '"Jost", sans-serif', fontSize: '0.88rem',
  outline: 'none', transition: 'border-color 0.25s',
};

export default function AlbumDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [album, setAlbum]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUpload, setShowUpload]       = useState(false);
  const [caption, setCaption]             = useState('');
  const [uploadedUrl, setUploadedUrl]     = useState('');
  const [uploading, setUploading]         = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  const photos = album?.photos || [];
  const isCreator = user && album && (album.createdBy?._id || album.createdBy)?.toString() === user._id?.toString();
  const isAdmin = user?.role === 'admin';
  const canTogglePrivacy = isCreator || isAdmin;

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const { data } = await api.get(`/albums/${id}`);
        setAlbum(data.album || data);
      } catch {
        toast.error('Не удалось загрузить альбом');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const openLightbox  = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevPhoto, nextPhoto]);

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!uploadedUrl) return;
    setUploading(true);
    try {
      const { data } = await api.post(`/albums/${id}/photos`, {
        url: uploadedUrl,
        caption: caption.trim(),
      });
      setAlbum(data.album || data);
      setShowUpload(false);
      setCaption('');
      setUploadedUrl('');
      toast.success('Медиафайл добавлен!');
    } catch {
      toast.error('Не удалось добавить файл');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.delete(`/albums/${id}/photos/${photoId}`);
      setAlbum(data.album || data);
      toast.success('Файл удалён');
    } catch {
      toast.error('Не удалось удалить файл');
    }
  };

  const handleTogglePrivacy = async () => {
    setTogglingPrivacy(true);
    try {
      const { data } = await api.patch(`/albums/${id}/privacy`);
      setAlbum((prev) => ({ ...prev, isPublic: data.isPublic }));
      toast.success(data.isPublic ? 'Альбом теперь публичный' : 'Альбом теперь приватный');
    } catch {
      toast.error('Не удалось изменить видимость');
    } finally {
      setTogglingPrivacy(false);
    }
  };

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  /* ─── Shared page wrapper ─── */
  const PageWrapper = ({ children }) => (
    <div style={{ minHeight: '100vh', background: '#07070C', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Grain */}
      <div style={{ position: 'fixed', inset: '-50%', width: '200%', height: '200%', pointerEvents: 'none', zIndex: 1, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px' }} />
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,85,0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <Navbar />
      {children}
      <Footer />
    </div>
  );

  /* ─── Loading ─── */
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#C9A555', borderRightColor: 'rgba(201,165,85,0.2)' }} />
            </div>
            <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(201,165,85,0.4)', textTransform: 'uppercase' }}>Загрузка</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  /* ─── Not found ─── */
  if (!album) {
    return (
      <PageWrapper>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <FiImage style={{ width: 56, height: 56, color: 'rgba(201,165,85,0.15)', margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.5rem', color: 'rgba(237,224,196,0.4)', marginBottom: 12 }}>Альбом не найден</p>
            <Link to="/albums" style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#C9A555', textDecoration: 'none', letterSpacing: '0.1em' }}>
              ← Все альбомы
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <main style={{ flex: 1, paddingTop: '5rem', position: 'relative', zIndex: 2 }}>
        {/* ── Header ── */}
        <div style={{ borderBottom: '1px solid rgba(201,165,85,0.08)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Back link */}
              <Link to="/albums" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', textDecoration: 'none', marginBottom: '1.5rem' }}>
                <FiArrowLeft style={{ width: 12, height: 12 }} />
                Все альбомы
              </Link>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
                {/* Album info */}
                <div>
                  {/* Privacy badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${album.isPublic ? 'rgba(201,165,85,0.25)' : 'rgba(255,255,255,0.1)'}`,
                      color: album.isPublic ? '#C9A555' : 'rgba(237,224,196,0.35)',
                      fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}>
                      {album.isPublic ? <FiGlobe style={{ width: 10, height: 10 }} /> : <FiLock style={{ width: 10, height: 10 }} />}
                      {album.isPublic ? 'Публичный' : 'Приватный'}
                    </div>

                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(237,224,196,0.35)',
                      fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}>
                      <FiImage style={{ width: 10, height: 10 }} />
                      {photos.length} {pluralMedia(photos.length)}
                    </div>
                  </div>

                  <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#EDE0C4', margin: 0, lineHeight: 1.1 }}>
                    {album.title}
                  </h1>
                  {album.description && (
                    <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: 'rgba(237,224,196,0.4)', marginTop: 8, maxWidth: 560 }}>
                      {album.description}
                    </p>
                  )}
                  {album.createdBy?.name && (
                    <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', color: 'rgba(201,165,85,0.4)', marginTop: 8, letterSpacing: '0.05em' }}>
                      Создал: {album.createdBy.name}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Privacy toggle (creator/admin only) */}
                  {canTogglePrivacy && (
                    <motion.button
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleTogglePrivacy}
                      disabled={togglingPrivacy}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '0.65rem 1.25rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(201,165,85,0.2)',
                        borderRadius: 10, cursor: 'pointer',
                        fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.72rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.7)',
                        transition: 'all 0.25s',
                      }}
                    >
                      {album.isPublic
                        ? <><FiLock style={{ width: 13, height: 13 }} /> Сделать приватным</>
                        : <><FiGlobe style={{ width: 13, height: 13 }} /> Сделать публичным</>
                      }
                    </motion.button>
                  )}

                  {/* Add media (all authenticated users) */}
                  {user && (
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowUpload(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '0.65rem 1.5rem',
                        background: 'linear-gradient(135deg, #E2C87A, #C9A555)',
                        border: 'none', borderRadius: 10, cursor: 'pointer',
                        fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: '0.72rem',
                        letterSpacing: '0.12em', textTransform: 'uppercase', color: '#07070C',
                        boxShadow: '0 4px 20px rgba(201,165,85,0.25)',
                      }}
                    >
                      <FiPlus style={{ width: 14, height: 14 }} />
                      Добавить фото / видео
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Media grid ── */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          {photos.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 0' }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FiImage style={{ width: 56, height: 56, color: 'rgba(201,165,85,0.12)', margin: '0 auto 1.5rem' }} />
              </motion.div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.5rem', color: 'rgba(237,224,196,0.35)', marginBottom: 8 }}>
                В альбоме пока нет медиафайлов
              </p>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: 'rgba(237,224,196,0.2)' }}>
                {user ? 'Нажмите «Добавить фото / видео», чтобы наполнить альбом' : 'Загляните позже'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
              style={{
                columns: 'auto', columnWidth: '240px', gap: '10px',
              }}
            >
              {photos.map((photo, i) => {
                const src = photo.url || photo;
                const alt = photo.caption || `Медиафайл ${i + 1}`;
                const photoIsVideo = isVideoUrl(src);
                const photoId = photo._id || photo.id;
                const isUploader = user && photo.uploadedBy && (photo.uploadedBy._id || photo.uploadedBy)?.toString() === user._id?.toString();
                const canDelete = isUploader || isCreator || isAdmin;

                return (
                  <motion.div
                    key={photoId || i}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } } }}
                    style={{ breakInside: 'avoid', marginBottom: 10, position: 'relative' }}
                  >
                    <div
                      onClick={() => openLightbox(i)}
                      style={{
                        position: 'relative', overflow: 'hidden', borderRadius: 14, cursor: 'pointer',
                        border: '1px solid rgba(201,165,85,0.08)',
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(201,165,85,0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                        const overlay = e.currentTarget.querySelector('.media-overlay');
                        if (overlay) overlay.style.opacity = 1;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(201,165,85,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                        const overlay = e.currentTarget.querySelector('.media-overlay');
                        if (overlay) overlay.style.opacity = 0;
                      }}
                    >
                      {photoIsVideo ? (
                        <div style={{ position: 'relative' }}>
                          <video
                            src={src}
                            muted
                            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14 }}
                          />
                          {/* Video play icon overlay */}
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,7,12,0.35)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,165,85,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiFilm style={{ width: 20, height: 20, color: '#07070C' }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={src}
                          alt={alt}
                          loading="lazy"
                          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14, transition: 'transform 0.45s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      )}

                      {/* Caption + delete overlay */}
                      <div className="media-overlay" style={{
                        position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.3s',
                        background: 'linear-gradient(to top, rgba(7,7,12,0.85) 0%, transparent 50%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0.75rem',
                        borderRadius: 14,
                      }}>
                        {photo.caption && (
                          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', color: 'rgba(237,224,196,0.8)', margin: 0, lineHeight: 1.4 }}>
                            {photo.caption}
                          </p>
                        )}
                        {photo.uploadedBy?.name && (
                          <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.62rem', color: 'rgba(201,165,85,0.5)', margin: '2px 0 0' }}>
                            {photo.uploadedBy.name}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      {canDelete && (
                        <button
                          onClick={(e) => handleDeletePhoto(photoId, e)}
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'rgba(7,7,12,0.85)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8, padding: 6, cursor: 'pointer',
                            color: '#ef4444', display: 'flex', opacity: 0, transition: 'opacity 0.25s',
                          }}
                          className="delete-btn"
                          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.stopPropagation(); }}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          <FiTrash2 style={{ width: 12, height: 12 }} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Upload modal ── */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 460,
                background: '#0F0F18', border: '1px solid rgba(201,165,85,0.2)',
                borderRadius: 20, padding: '1.75rem', boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Gold top line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.5), transparent)' }} />

              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.5rem', color: '#EDE0C4', margin: 0 }}>
                  Добавить медиафайл
                </h2>
                <motion.button whileHover={{ rotate: 90 }} onClick={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(237,224,196,0.3)', cursor: 'pointer', padding: 4 }}>
                  <FiX style={{ width: 18, height: 18 }} />
                </motion.button>
              </div>

              <form onSubmit={handleAddMedia} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <MediaUpload onUpload={(url) => setUploadedUrl(url || '')} currentMedia={uploadedUrl} />

                <div>
                  <label style={{ fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,165,85,0.5)', display: 'block', marginBottom: 8 }}>
                    Подпись
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Необязательно..."
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,165,85,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,165,85,0.15)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}
                    style={{
                      flex: 1, padding: '0.85rem',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, cursor: 'pointer', color: 'rgba(237,224,196,0.5)',
                      fontFamily: '"Jost", sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}
                  >
                    Отмена
                  </button>
                  <motion.button
                    type="submit"
                    disabled={uploading || !uploadedUrl}
                    whileHover={uploadedUrl && !uploading ? { scale: 1.02 } : {}}
                    whileTap={uploadedUrl && !uploading ? { scale: 0.98 } : {}}
                    style={{
                      flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: uploading || !uploadedUrl ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #E2C87A, #C9A555)',
                      border: 'none', borderRadius: 10,
                      cursor: uploading || !uploadedUrl ? 'not-allowed' : 'pointer',
                      color: uploading || !uploadedUrl ? 'rgba(237,224,196,0.25)' : '#07070C',
                      fontFamily: '"Jost", sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}
                  >
                    {uploading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: 'rgba(237,224,196,0.5)' }} />
                    ) : <FiPlus style={{ width: 14, height: 14 }} />}
                    {uploading ? 'Загрузка...' : 'Добавить'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(7,7,12,0.97)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, padding: '0.6rem', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: '#EDE0C4', cursor: 'pointer', display: 'flex' }}>
              <FiX style={{ width: 22, height: 22 }} />
            </button>

            {/* Counter */}
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: 100, color: 'rgba(237,224,196,0.6)', fontFamily: '"Jost", sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', zIndex: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              {lightboxIndex + 1} / {photos.length}
            </div>

            {/* Prev */}
            <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              style={{ position: 'absolute', left: 16, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: '#EDE0C4', cursor: 'pointer', display: 'flex', zIndex: 10 }}>
              <FiChevronLeft style={{ width: 26, height: 26 }} />
            </button>

            {/* Media */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingInline: '5rem', maxWidth: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              {isVideoUrl(currentPhoto.url || currentPhoto) ? (
                <video
                  src={currentPhoto.url || currentPhoto}
                  controls
                  autoPlay
                  loop
                  style={{ maxWidth: '85vw', maxHeight: '78vh', borderRadius: 16, boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
                />
              ) : (
                <img
                  src={currentPhoto.url || currentPhoto}
                  alt={currentPhoto.caption || ''}
                  style={{ maxWidth: '85vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
                />
              )}
              {currentPhoto.caption && (
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.82rem', color: 'rgba(237,224,196,0.5)', textAlign: 'center', maxWidth: 560, padding: '0 1rem' }}>
                  {currentPhoto.caption}
                </p>
              )}
              {currentPhoto.uploadedBy?.name && (
                <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(201,165,85,0.4)', textTransform: 'uppercase' }}>
                  {currentPhoto.uploadedBy.name}
                </p>
              )}
            </motion.div>

            {/* Next */}
            <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              style={{ position: 'absolute', right: 16, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: '#EDE0C4', cursor: 'pointer', display: 'flex', zIndex: 10 }}>
              <FiChevronRight style={{ width: 26, height: 26 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
