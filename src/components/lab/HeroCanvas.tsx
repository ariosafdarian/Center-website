'use client';
import { useEffect, useRef } from 'react';

/**
 * Hero motif: a khatam tiling (eight-point stars whose tips touch) slowly
 * turns into a neural network — star outlines fade, spokes and links between
 * shared tips appear, nodes light up — and back. Nodes near the pointer drift
 * away and brighten. Colors come from CSS custom properties on the canvas:
 * --hero-line, --hero-gold, --hero-turquoise.
 *
 * Reduced motion: one static frame. Off screen or hidden tab: paused.
 * Written from the RFP description; hero.js from v1 replaces/refines it later.
 */
type Star = { cx: number; cy: number; seed: number };

const TAU = Math.PI * 2;
const CYCLE = 14_000; // ms for knot → network → knot

export default function HeroCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: Star[] = [];
    let W = 0;
    let H = 0;
    let S = 120;
    let raf = 0;
    let visible = true;
    const pointer = { x: -1e4, y: -1e4, active: false };
    let colors = { line: '#c8a15a', gold: '#c8a15a', turq: '#3fc1b0' };

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors = {
        line: cs.getPropertyValue('--hero-line').trim() || colors.line,
        gold: cs.getPropertyValue('--hero-gold').trim() || colors.gold,
        turq: cs.getPropertyValue('--hero-turquoise').trim() || colors.turq,
      };
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = W < 640 ? 84 : 118;
      stars = [];
      for (let y = -S / 2; y < H + S; y += S) {
        for (let x = -S / 2; x < W + S; x += S) {
          stars.push({ cx: x, cy: y, seed: Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1 });
        }
      }
      readColors();
    };

    // Smooth 0→1→0 with a long hold in the middle.
    const phase = (t: number) => {
      const u = (t % CYCLE) / CYCLE;
      const tri = u < 0.5 ? u * 2 : 2 - u * 2;
      const e = Math.min(1, Math.max(0, (tri - 0.15) / 0.6));
      return e * e * (3 - 2 * e);
    };

    const pushAway = (x: number, y: number, amount: number) => {
      if (!pointer.active) return [x, y, 0] as const;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d = Math.hypot(dx, dy);
      const R = S * 1.6;
      if (d > R || d === 0) return [x, y, 0] as const;
      const k = (1 - d / R) ** 2;
      return [x + (dx / d) * k * amount, y + (dy / d) * k * amount, k] as const;
    };

    const draw = (t: number) => {
      const p = reduce ? 0.55 : phase(t);
      ctx.clearRect(0, 0, W, H);
      const r = S / 2;
      const ri = r * (Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8));

      for (const s of stars) {
        const wobble = reduce ? 0 : Math.sin(t / 2600 + s.seed * TAU) * 0.06 * p;
        const tips: [number, number, number][] = [];
        const inner: [number, number][] = [];
        for (let k = 0; k < 8; k++) {
          const a = (TAU / 8) * k - Math.PI / 2;
          const stretch = 1 + p * (0.1 + 0.12 * Math.sin(s.seed * 40 + k)) + wobble;
          const [x, y, near] = pushAway(s.cx + r * stretch * Math.cos(a), s.cy + r * stretch * Math.sin(a), 18);
          tips.push([x, y, near]);
          const b = a + Math.PI / 8;
          inner.push([s.cx + ri * (1 - p * 0.35) * Math.cos(b), s.cy + ri * (1 - p * 0.35) * Math.sin(b)]);
        }
        const [cx, cy, nearC] = pushAway(s.cx, s.cy, 10);

        // 1. Khatam outline (fades out)
        if (p < 0.98) {
          ctx.globalAlpha = 0.5 * (1 - p);
          ctx.strokeStyle = colors.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const [tx, ty] = tips[k]!;
            const [ix, iy] = inner[k]!;
            if (k === 0) ctx.moveTo(tx, ty);
            else ctx.lineTo(tx, ty);
            ctx.lineTo(ix, iy);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // 2. Network: spokes from the center to the tips (fade in)
        if (p > 0.02) {
          ctx.globalAlpha = 0.34 * p;
          ctx.strokeStyle = colors.turq;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          for (let k = 0; k < 8; k += 1 + (k % 2)) {
            const [tx, ty] = tips[k]!;
            ctx.moveTo(cx, cy);
            ctx.lineTo(tx, ty);
          }
          ctx.stroke();
        }

        // 3. Nodes on the tips (gold) and the center (turquoise)
        for (let k = 0; k < 8; k += 2) {
          const [tx, ty, near] = tips[k]!;
          ctx.globalAlpha = 0.25 + 0.6 * p + near * 0.4;
          ctx.fillStyle = colors.gold;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.2 + 1.6 * p + near * 2, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 0.2 + 0.7 * p + nearC * 0.3;
        ctx.fillStyle = colors.turq;
        ctx.beginPath();
        ctx.arc(cx, cy, 1 + 2.4 * p + nearC * 2, 0, TAU);
        ctx.fill();

        // 4. Pointer links
        if (pointer.active && nearC > 0.15) {
          ctx.globalAlpha = nearC * 0.8;
          ctx.strokeStyle = colors.gold;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    layout();
    start();
    canvas.dataset.ready = 'true';

    const ro = new ResizeObserver(() => {
      layout();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting && document.visibilityState === 'visible';
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);
    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = e.pointerType === 'mouse';
    };
    const onLeave = () => {
      pointer.active = false;
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', readColors);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      mq.removeEventListener('change', readColors);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
