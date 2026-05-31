import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiX, FiChevronLeft, FiChevronRight, FiImage,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Modal from '../components/Modal.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

export default function AlbumDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [album, setAlbum]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUpload, setShowUpload]     = useState(false);
  const [caption, setCaption]           = useState('');
  const [uploadedUrl, setUploadedUrl]   = useState('');
  const [uploading, setUploading]       = useState(false);

  const photos = album?.photos || [];

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
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   prevPhoto();
      if (e.key === 'ArrowRight')  nextPhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevPhoto, nextPhoto]);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!uploadedUrl) return;
    setUploading(true);
    try {
      const { data } = await api.post(`/albums/${id}/photos`, {
        url: uploadedUrl,
        caption: caption.trim(),
      });
      const newPhoto = data.photo || data;
      setAlbum((prev) => ({
        ...prev,
        photos: [...(prev?.photos || []), newPhoto],
      }));
      setShowUpload(false);
      setCaption('');
      setUploadedUrl('');
      toast.success('Фото добавлено!');
    } catch {
      toast.error('Не удалось добавить фото');
    } finally {
      setUploading(false);
    }
  };

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <FiImage className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Альбом не найден</p>
            <Link to="/albums" className="text-violet-400 hover:text-violet-300 underline text-sm transition-colors">
              Вернуться к альбомам
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Album header */}
        <div className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-amber-600/10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 py-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back link */}
              <Link
                to="/albums"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors group"
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Все альбомы
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-500 mb-4 backdrop-blur-sm">
                    <FiImage className="w-3 h-3" />
                    {photos.length} {photos.length === 1 ? 'фотография' : photos.length < 5 ? 'фотографии' : 'фотографий'}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    {album.title}
                  </h1>
                  {album.description && (
                    <p className="text-gray-400 text-base max-w-xl">{album.description}</p>
                  )}
                  {album.createdBy?.name && (
                    <p className="text-gray-600 text-sm mt-2">
                      Создал:{' '}
                      <span className="text-gray-400">{album.createdBy.name}</span>
                    </p>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm shrink-0"
                  >
                    <FiPlus className="w-4 h-4" />
                    Добавить фото
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Photo grid */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {photos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <FiImage className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">В альбоме пока нет фотографий</p>
              <p className="text-gray-600 text-sm mt-2">
                {user ? 'Нажмите «Добавить фото», чтобы наполнить альбом' : 'Загляните позже'}
              </p>
            </motion.div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {photos.map((photo, i) => {
                const src = photo.url || photo;
                const alt = photo.caption || `Фото ${i + 1}`;
                return (
                  <motion.div
                    key={photo._id || photo.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i < 16 ? i * 0.03 : 0, duration: 0.4 }}
                    className="break-inside-avoid"
                  >
                    <div
                      className="relative overflow-hidden rounded-xl cursor-pointer group border border-white/5 hover:border-white/15 transition-all shadow-lg shadow-black/20"
                      onClick={() => openLightbox(i)}
                    >
                      <img
                        src={src}
                        alt={alt}
                        className="w-full h-auto object-cover group-hover:scale-105 group-hover:brightness-90 transition-all duration-500"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Add photo modal */}
      <Modal isOpen={showUpload} onClose={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Добавить фото</h2>
            <button
              onClick={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddPhoto} className="space-y-4">
            <ImageUpload
              onUpload={(url) => setUploadedUrl(url)}
              currentImage={uploadedUrl}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Подпись к фото
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Необязательно..."
                className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowUpload(false); setUploadedUrl(''); setCaption(''); }}
                className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl border border-white/10 transition-all text-sm"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={uploading || !uploadedUrl}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
                {uploading ? 'Загрузка...' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-medium backdrop-blur-sm z-10">
              {lightboxIndex + 1} / {photos.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <FiChevronLeft className="w-7 h-7" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4 px-16 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.url || currentPhoto}
                alt={currentPhoto.caption || ''}
                className="max-w-[85vw] max-h-[78vh] object-contain rounded-2xl shadow-2xl shadow-black/60"
              />
              {currentPhoto.caption && (
                <p className="text-gray-300 text-sm text-center max-w-xl px-4">
                  {currentPhoto.caption}
                </p>
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <FiChevronRight className="w-7 h-7" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
