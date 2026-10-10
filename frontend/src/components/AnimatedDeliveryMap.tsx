import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, Bike } from 'lucide-react';

interface AnimatedDeliveryMapProps {
  restaurantName: string;
  deliveryAddress: string;
  orderStatus: string;
  estimatedMins?: number;
}

export const AnimatedDeliveryMap: React.FC<AnimatedDeliveryMapProps> = ({
  restaurantName,
  deliveryAddress,
  orderStatus,
  estimatedMins = 25,
}) => {
  const [progress, setProgress] = useState(0.15); // 0 to 1 along path
  const [remainingSecs, setRemainingSecs] = useState(estimatedMins * 60);

  // Set progress based on status
  useEffect(() => {
    let target = 0.15;
    if (orderStatus === 'Placed') target = 0.05;
    else if (orderStatus === 'Preparing') target = 0.25;
    else if (orderStatus === 'Ready for Pickup') target = 0.45;
    else if (orderStatus === 'Out for Delivery') target = 0.75;
    else if (orderStatus === 'Delivered') target = 1.0;

    setProgress(target);
  }, [orderStatus]);

  // ETA countdown
  useEffect(() => {
    if (orderStatus === 'Delivered' || orderStatus === 'Cancelled') {
      setRemainingSecs(0);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSecs((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [orderStatus]);

  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;

  // Cubic bezier path coordinates
  // Path starts at (80, 180) [Restaurant] and ends at (520, 70) [Customer]
  // Intermediate waypoint curve
  const bikeX = 80 + (520 - 80) * progress + Math.sin(progress * Math.PI) * 40;
  const bikeY = 180 - (180 - 70) * progress + Math.cos(progress * Math.PI) * 20;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl p-5 space-y-4">
      {/* Header with Live Status & ETA Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Live GPS Route Telemetry
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-black shadow-inner">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
            <span>
              {orderStatus === 'Delivered'
                ? 'Delivered'
                : `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Real-time Sync
          </span>
        </div>
      </div>

      {/* SVG Animated City Grid & Route */}
      <div className="relative w-full h-56 sm:h-64 bg-[#0a0a0c] rounded-2xl overflow-hidden border border-zinc-900">
        <svg
          viewBox="0 0 600 240"
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>

            {/* Glowing Linear Gradient for Route */}
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff5722" />
              <stop offset="50%" stopColor="#ff9800" />
              <stop offset="100%" stopColor="#4caf50" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#city-grid)" />

          {/* City Street Blocks (Decorative polygons) */}
          <rect x="30" y="20" width="100" height="50" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="150" y="20" width="160" height="60" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="330" y="30" width="120" height="40" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="40" y="100" width="130" height="60" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="190" y="110" width="150" height="70" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="360" y="100" width="180" height="60" rx="6" fill="#141418" stroke="#1f1f24" />
          <rect x="220" y="195" width="220" height="30" rx="6" fill="#141418" stroke="#1f1f24" />

          {/* Road Base Layer */}
          <path
            d="M 80 180 Q 220 190 300 130 T 520 70"
            fill="none"
            stroke="#26262e"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Glowing Animated Dash Route */}
          <path
            d="M 80 180 Q 220 190 300 130 T 520 70"
            fill="none"
            stroke="url(#route-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-dash"
            filter="url(#neon-glow)"
          />

          {/* Restaurant Origin Node */}
          <g transform="translate(80, 180)">
            <circle r="16" fill="rgba(255, 87, 34, 0.2)" className="animate-ping" />
            <circle r="12" fill="#ff5722" />
            <circle r="5" fill="#ffffff" />
          </g>

          {/* Destination Customer Node */}
          <g transform="translate(520, 70)">
            <circle r="18" fill="rgba(76, 175, 80, 0.2)" className="animate-ping" />
            <circle r="12" fill="#4caf50" />
            <circle r="5" fill="#ffffff" />
          </g>

          {/* Moving Delivery Bike Icon */}
          <g transform={`translate(${bikeX}, ${bikeY})`} filter="url(#neon-glow)">
            <circle r="18" fill="#18181b" stroke="#ff5722" strokeWidth="2.5" />
            <g transform="translate(-10, -10)">
              <Bike className="w-5 h-5 text-brand-400 animate-pulse" />
            </g>
          </g>
        </svg>

        {/* Floating Node Labels */}
        <div className="absolute bottom-2 left-3 bg-zinc-900/90 border border-zinc-700/60 rounded-xl px-2.5 py-1 text-[11px] text-zinc-300 backdrop-blur-md flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          <span className="font-semibold text-white truncate max-w-[140px]">{restaurantName}</span>
        </div>

        <div className="absolute top-2 right-3 bg-zinc-900/90 border border-zinc-700/60 rounded-xl px-2.5 py-1 text-[11px] text-zinc-300 backdrop-blur-md flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-white truncate max-w-[160px]">{deliveryAddress}</span>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>Order Confirmed</span>
          <span className="font-bold text-brand-400">{orderStatus}</span>
          <span>Delivered</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-amber-500 to-emerald-500 transition-all duration-700 rounded-full shadow-glow-orange"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
