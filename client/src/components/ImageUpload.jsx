import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({ onUpload, currentImage, className = '' }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFile = (file) => {
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      onUpload?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onUpload?.(null);
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {preview ? (
          /* ── Preview state ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 group"
          >
            <img
              src={preview}
              alt="Превью изображения"
              className="w-full max-h-48 object-contain mx-auto block bg-black/20"
            />
            {/* Hover overlay with change/remove */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-3">
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20
                           text-sm text-white font-medium"
              >
                Изменить
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           p-2 rounded-xl bg-red-500/70 backdrop-blur-sm border border-red-500/30 text-white"
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          /* ── Drop zone state ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl
                        border-2 border-dashed cursor-pointer transition-all duration-250 text-center
                        ${
                          dragging
                            ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
                            : 'border-white/20 bg-white/5 hover:border-amber-500/50 hover:bg-white/8'
                        }`}
          >
            <motion.div
              animate={dragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`transition-colors duration-200 ${dragging ? 'text-amber-400' : 'text-white/30'}`}
            >
              <FiUploadCloud className="w-10 h-10" />
            </motion.div>

            <div>
              <p className="text-sm text-gray-300 font-medium">
                {dragging ? 'Отпустите для загрузки' : 'Нажмите или перетащите фото'}
              </p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG до {MAX_SIZE_MB} МБ</p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
