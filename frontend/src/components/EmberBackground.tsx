import React, { useEffect, useRef, useState } from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  baseSpeedX: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  flickerSpeed: number;
  flickerOffset: number;
  color: string;
  glowColor: string;
  wobble: number;
  wobbleSpeed: number;
}

export const EmberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<'cinematic' | 'sparks' | 'off'>('cinematic');
  const [showControls, setShowControls] = useState(false);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Handle Canvas Embers
  useEffect(() => {
    if (mode === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Color palettes for authentic glowing fire embers
    const emberPalette = [
      { core: '#ffffff', glow: 'rgba(255, 87, 34, 0.8)' },    // White hot core + orange glow
      { core: '#fff3c4', glow: 'rgba(255, 112, 67, 0.7)' },   // Golden yellow
      { core: '#ff8a65', glow: 'rgba(244, 81, 30, 0.6)' },    // Bright fiery orange
      { core: '#ff5722', glow: 'rgba(216, 67, 21, 0.5)' },    // Deep brand flame
      { core: '#ffab91', glow: 'rgba(255, 61, 0, 0.6)' },     // Peach ember spark
    ];

    const count = mode === 'cinematic' ? 75 : 120;
    const embers: Ember[] = [];

    const createEmber = (initialY?: number): Ember => {
      const palette = emberPalette[Math.floor(Math.random() * emberPalette.length)];
      const size = Math.random() * 2.8 + 0.8; // 0.8px - 3.6px
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : height + Math.random() * 50,
        size,
        speedY: (Math.random() * 1.5 + 0.6) * (size > 2.5 ? 1.2 : 0.9),
        speedX: (Math.random() - 0.5) * 0.8,
        baseSpeedX: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.2 + 0.1,
        maxOpacity: Math.random() * 0.5 + 0.4,
        fadeSpeed: Math.random() * 0.003 + 0.002,
        flickerSpeed: Math.random() * 0.08 + 0.03,
        flickerOffset: Math.random() * Math.PI * 2,
        color: palette.core,
        glowColor: palette.glow,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
      };
    };

    // Pre-populate so screen isn't empty on load
    for (let i = 0; i < count; i++) {
      embers.push(createEmber(Math.random() * height));
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Enable additive blending for intense fiery bloom
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];

        // Upward movement with natural sway
        p.wobble += p.wobbleSpeed;
        p.x += p.baseSpeedX + Math.sin(p.wobble) * 0.6;
        p.y -= p.speedY;

        // Interactive mouse draft effect
        if (mousePos.current.active) {
          const dx = p.x - mousePos.current.x;
          const dy = p.y - mousePos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (1 - dist / 150) * 2;
            p.x += (dx / dist) * force;
            p.y -= Math.abs(dy / dist) * force * 0.5; // updraft
          }
        }

        // Flickering luminescence
        const flicker = Math.sin(time * 5 + p.flickerOffset) * 0.25;
        const currentOpacity = Math.max(0, Math.min(1, p.opacity + flicker));

        // Draw outer glowing halo
        const glowRadius = p.size * 3.5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.3, p.glowColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw hot spark center
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.min(1, currentOpacity * 1.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Fade in / fade out lifecycle
        if (p.y < height * 0.7) {
          p.opacity -= p.fadeSpeed;
        } else if (p.opacity < p.maxOpacity) {
          p.opacity += p.fadeSpeed * 2;
        }

        // Reset ember once expired or off-screen
        if (p.y < -20 || p.x < -30 || p.x > width + 30 || p.opacity <= 0) {
          embers[i] = createEmber();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Looping Fire/Campfire Video Layer */}
      {mode === 'cinematic' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30 mix-blend-screen filter saturate-150 contrast-125">
          <video
            ref={videoRef}
            src="/videos/campfire.webm"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transform scale-105"
          />
        </div>
      )}

      {/* 2. Deep Atmospheric Vignette & Color Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/80 to-[#0c0c0e]/90" />
      
      {/* Radial Warm Glow at Bottom Hearth */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[350px] bg-gradient-to-t from-brand-600/15 via-brand-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* 3. Realtime Fire Sparks & Embers Particle Canvas */}
      {mode !== 'off' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 87, 34, 0.4))' }}
        />
      )}

      {/* Subtle Bottom Ambient Fire Line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* 4. Non-intrusive Ambient Mode Controls (Pointer events enabled for this button only) */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-auto">
        <div className="relative group">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-brand-500/50 backdrop-blur-md text-xs text-zinc-300 hover:text-white transition-all shadow-lg hover:shadow-brand-500/20"
            title="Adjust Ambient Fire Background"
          >
            <Flame className={`w-3.5 h-3.5 ${mode !== 'off' ? 'text-brand-500 animate-pulse fill-brand-500' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
              {mode === 'cinematic' ? 'Fire Embers' : mode === 'sparks' ? 'Sparks Only' : 'Background Off'}
            </span>
          </button>

          {/* Quick Selection Popover */}
          {showControls && (
            <div className="absolute bottom-10 left-0 mb-2 p-2 w-48 rounded-xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl flex flex-col gap-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-400 border-b border-zinc-800/80 mb-1">
                Atmosphere FX
              </div>
              <button
                onClick={() => { setMode('cinematic'); setShowControls(false); }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  mode === 'cinematic' ? 'bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30' : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                <span>Cinematic Video & Embers</span>
              </button>
              <button
                onClick={() => { setMode('sparks'); setShowControls(false); }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  mode === 'sparks' ? 'bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30' : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sparks Only (Performance)</span>
              </button>
              <button
                onClick={() => { setMode('off'); setShowControls(false); }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  mode === 'off' ? 'bg-zinc-800 text-zinc-200 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/80'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Turn Off Effects</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
