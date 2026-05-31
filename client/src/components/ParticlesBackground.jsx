import { useEffect, useRef } from 'react';

export default function ParticlesBackground({ count = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let stars = [];
    let animId;

    // Smooth mouse parallax
    let mx = 0, my = 0;   // current (lerped)
    let tx = 0, ty = 0;   // target

    const buildStars = (w, h) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        opacity: Math.random() * 0.45 + 0.08,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.004,
        depth: Math.random() * 0.85 + 0.15,  // parallax depth 0.15–1.0
      }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      stars = buildStars(width, height);
    };

    const onMouseMove = (e) => {
      // normalize to [-30, 30] range
      tx = (e.clientX / window.innerWidth  - 0.5) * 60;
      ty = (e.clientY / window.innerHeight - 0.5) * 60;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const draw = () => {
      // Smooth interpolation toward target
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;

      ctx.clearRect(0, 0, width, height);

      // Connections between nearby stars (with parallax offset)
      for (let i = 0; i < stars.length; i++) {
        const ax = stars[i].x + mx * stars[i].depth;
        const ay = stars[i].y + my * stars[i].depth;
        for (let j = i + 1; j < stars.length; j++) {
          const bx = stars[j].x + mx * stars[j].depth;
          const by = stars[j].y + my * stars[j].depth;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201,165,85,${(1 - dist / 110) * 0.055})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      // Stars (with parallax offset)
      for (const s of stars) {
        s.pulse += s.speed;
        const op = s.opacity * (0.6 + 0.4 * Math.sin(s.pulse));
        const px = s.x + mx * s.depth;
        const py = s.y + my * s.depth;

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,165,85,${op})`;
        ctx.fill();

        if (s.r > 0.7) {
          const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 4);
          g.addColorStop(0, `rgba(201,165,85,${op * 0.35})`);
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(px, py, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
