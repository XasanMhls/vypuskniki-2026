import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{ background: '#07070C', borderTop: '1px solid rgba(201,165,85,0.1)' }}
    >
      {/* Gold hairline accent */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,165,85,0.4), transparent)' }} />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div style={{ height: 1, width: 20, background: '#C9A555' }} />
              <span
                style={{
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: '#C9A555',
                }}
              >
                Выпуск 2025–2026
              </span>
            </div>
            <h3
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                color: 'rgba(237,224,196,0.55)',
                lineHeight: 1.2,
              }}
            >
              11 класс
            </h3>
          </motion.div>

          {/* Center quote */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center hidden md:block"
          >
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '0.95rem',
                color: 'rgba(237,224,196,0.2)',
                lineHeight: 1.6,
              }}
            >
              Школа закончилась,<br />но дружба — навсегда
            </p>
          </motion.div>

          {/* Right meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-start md:items-end gap-3"
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ border: '1px solid rgba(201,165,85,0.12)' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(201,165,85,0.4)', display: 'inline-block' }} />
              <span
                style={{
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 400,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#3A3840',
                }}
              >
                Только для участников класса
              </span>
            </div>

            <Link
              to="/"
              style={{
                fontFamily: '"Jost", sans-serif',
                fontWeight: 400,
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: '#3A3840',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6B6570')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3A3840')}
            >
              На главную →
            </Link>
          </motion.div>
        </div>

        {/* Bottom rule + year */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-5 mt-12"
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(201,165,85,0.08)' }} />
          <span
            style={{
              fontFamily: '"Jost", sans-serif',
              fontWeight: 300,
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#2A2830',
            }}
          >
            2025 – 2026
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(201,165,85,0.08)' }} />
        </motion.div>
      </div>
    </footer>
  );
}
