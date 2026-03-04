import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
  phase: number;
}

export function CalmWorld({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create soft floating orbs — calm palette
    const orbs: Orb[] = [
      { x: width * 0.2, y: height * 0.3, radius: 180, dx: 0.15, dy: 0.08, hue: 30, saturation: 80, lightness: 65, opacity: 0.08, phase: 0 },
      { x: width * 0.7, y: height * 0.6, radius: 220, dx: -0.1, dy: 0.12, hue: 350, saturation: 60, lightness: 68, opacity: 0.07, phase: 1 },
      { x: width * 0.5, y: height * 0.2, radius: 160, dx: 0.08, dy: -0.1, hue: 50, saturation: 70, lightness: 70, opacity: 0.06, phase: 2 },
      { x: width * 0.8, y: height * 0.15, radius: 140, dx: -0.12, dy: 0.06, hue: 140, saturation: 50, lightness: 65, opacity: 0.05, phase: 3 },
      { x: width * 0.3, y: height * 0.75, radius: 200, dx: 0.06, dy: -0.08, hue: 270, saturation: 40, lightness: 72, opacity: 0.06, phase: 4 },
    ];

    // Small particles
    const particles: { x: number; y: number; size: number; speed: number; opacity: number; phase: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Draw orbs with radial gradients
      for (const orb of orbs) {
        orb.x += orb.dx;
        orb.y += orb.dy;

        // Soft bounce
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const breathe = Math.sin(time * 2 + orb.phase) * 0.02 + 1;
        const r = orb.radius * breathe;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        gradient.addColorStop(0, `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, ${orb.opacity * 1.5})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, ${orb.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw particles
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const twinkle = Math.sin(time * 3 + p.phase) * 0.15 + 0.85;
        ctx.fillStyle = `hsla(40, 60%, 75%, ${p.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
