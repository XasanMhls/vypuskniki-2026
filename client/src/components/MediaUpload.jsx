import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiFilm } from 'react-icons/fi';

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 15;

const isVideoFile = (type) => type.startsWith('video/');

export default function MediaUpload({ onUpload, currentMedia }) {
  const [preview, setPreview] = useState(currentMedia || null);
  const [mediaType, setMediaType] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFile = (file) => {
    setError('');
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isVid = isVideoFile(file.type);

    if (!isImg && !isVid) {
      setError('Выберите фото (JPG, PNG) или видео (MP4, MOV, WebM)');
      return;
    }

    const maxBytes = isVid ? MAX_VIDEO_MB * 1024 * 1024 : MAX_IMAGE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Файл слишком большой. Максимум ${isVid ? MAX_VIDEO_MB : MAX_IMAGE_MB} МБ`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setMediaType(isVid ? 'video' : 'image');
      onUpload?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  const handleRemove = () => {
    setPreview(null);
    setMediaType(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onUpload?.(null);
  };

  const inputStyle = {
    background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0,
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(201,165,85,0.2)' }}
          >
            {mediaType === 'video' ? (
              <video
                src={preview}
                controls
                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', background: '#07070C', display: 'block' }}
              />
            ) : (
              <img
                src={preview}
                alt="Превью"
                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', background: '#07070C', display: 'block' }}
              />
            )}
            <button
              onClick={handleRemove}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(7,7,12,0.85)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, padding: 6, cursor: 'pointer', color: '#EDE0C4', display: 'flex',
              }}
            >
              <FiX style={{ width: 14, height: 14 }} />
            </button>
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleChange} style={{ display: 'none' }} />
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onClick={() => inputRef.current?.click()}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '2rem 1.5rem', borderRadius: 14, cursor: 'pointer',
              border: `2px dashed ${dragging ? '#C9A555' : 'rgba(201,165,85,0.2)'}`,
              background: dragging ? 'rgba(201,165,85,0.04)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.25s', textAlign: 'center',
            }}
          >
            <motion.div animate={dragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}>
              {dragging
                ? <FiFilm style={{ width: 36, height: 36, color: '#C9A555' }} />
                : <FiUploadCloud style={{ width: 36, height: 36, color: 'rgba(201,165,85,0.35)' }} />
              }
            </motion.div>
            <div>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.85rem', color: 'rgba(237,224,196,0.7)', margin: 0 }}>
                {dragging ? 'Отпустите для загрузки' : 'Нажмите или перетащите фото / видео'}
              </p>
              <p style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.7rem', color: 'rgba(237,224,196,0.25)', margin: '4px 0 0' }}>
                Фото до {MAX_IMAGE_MB} МБ · Видео до {MAX_VIDEO_MB} МБ
              </p>
            </div>
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleChange} style={{ display: 'none' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontFamily: '"Jost", sans-serif', fontSize: '0.78rem', color: '#ef4444', marginTop: 8 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
