import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Saksham AI Premium Enterprise Security Emblem
 * 3D Isometric Facet Shield + Interlocking S-Blade Geometry.
 * Designed for Fortune 500 Cyber & SOC aesthetic.
 */
export function SakshamIcon({ size = 36, className = '' }) {
  const numSize = typeof size === 'number' ? size : size === 'sm' ? 26 : size === 'lg' ? 44 : size === 'xl' ? 58 : 36;

  return (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 transition-all duration-300 hover:brightness-110 hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]', className)}
    >
      <defs>
        {/* Left Shield Facet Gradient */}
        <linearGradient id="sakshamFacetLeft" x1="10" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c1a3a" />
          <stop offset="50%" stopColor="#0a2540" />
          <stop offset="100%" stopColor="#051329" />
        </linearGradient>

        {/* Right Shield Facet Gradient */}
        <linearGradient id="sakshamFacetRight" x1="90" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#061329" />
          <stop offset="50%" stopColor="#0d1b3e" />
          <stop offset="100%" stopColor="#020b18" />
        </linearGradient>

        {/* Interlocking S-Blade Top Gradient */}
        <linearGradient id="sakshamBladeTop" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Interlocking S-Blade Bottom Gradient */}
        <linearGradient id="sakshamBladeBottom" x1="80" y1="80" x2="20" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Core Diamond Gradient */}
        <radialGradient id="sakshamCorePulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>

        {/* Outer Rim Stroke Gradient */}
        <linearGradient id="sakshamRimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#1e3a8a" />
          <stop offset="85%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="sakshamEmblemGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Glow Shield Frame */}
      <path
        d="M50 4 L90 24 V58 L50 96 L10 58 V24 L50 4 Z"
        fill="url(#sakshamRimGrad)"
        fillOpacity="0.12"
        filter="url(#sakshamEmblemGlow)"
      />

      {/* Outer Hex Shield Border */}
      <path
        d="M50 5 L89 24.5 V57.5 L50 94.5 L11 57.5 V24.5 L50 5 Z"
        stroke="url(#sakshamRimGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="#040814"
      />

      {/* Left Shield Facet */}
      <path d="M50 8 L15 26.5 V55.5 L50 90.5 V50 Z" fill="url(#sakshamFacetLeft)" opacity="0.9" />

      {/* Right Shield Facet */}
      <path d="M50 8 L85 26.5 V55.5 L50 90.5 V50 Z" fill="url(#sakshamFacetRight)" opacity="0.9" />

      {/* Inner Precision Grid Guidelines */}
      <path d="M50 12 V88 M18 28 L82 72 M18 72 L82 28" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="3 3" />

      {/* Upper Interlocking 'S' Chevron Blade */}
      <path
        d="M74 31 L50 19 L26 31 L26 41 L50 29 L74 41 Z"
        fill="url(#sakshamBladeTop)"
      />
      <path
        d="M74 31 L50 19 L26 31 L50 43 L74 31 Z"
        fill="#ffffff"
        fillOpacity="0.15"
      />

      {/* Lower Interlocking 'S' Chevron Blade */}
      <path
        d="M26 69 L50 81 L74 69 L74 59 L50 71 L26 59 Z"
        fill="url(#sakshamBladeBottom)"
      />
      <path
        d="M26 69 L50 81 L74 69 L50 57 L26 69 Z"
        fill="#ffffff"
        fillOpacity="0.1"
      />

      {/* Center Dynamic 'S' Connector Bar */}
      <path
        d="M32 46 L68 54 L68 49 L32 41 Z"
        fill="url(#sakshamBladeTop)"
        opacity="0.85"
      />

      {/* Core Diamond Node (Pulsing Quantum Core) */}
      <polygon points="50,42 58,50 50,58 42,50" fill="url(#sakshamCorePulse)" />
      <polygon points="50,45 55,50 50,55 45,50" fill="#ffffff" />
    </svg>
  );
}

export function SakshamLogo({
  size = 'md',
  variant = 'full',
  className = '',
  iconClassName = '',
  textClassName = '',
  showTag = true,
  subtitle = false,
}) {
  const iconSizes = {
    sm: 26,
    md: 36,
    lg: 44,
    xl: 58,
  };

  const actualSize = typeof size === 'number' ? size : iconSizes[size] || 36;

  if (variant === 'icon') {
    return <SakshamIcon size={actualSize} className={className} />;
  }

  return (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      <SakshamIcon size={actualSize} className={iconClassName} />
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={cn(
                'font-extrabold tracking-tight text-[#0f1f3d] dark:text-white font-sans flex items-center',
                actualSize <= 26
                  ? 'text-sm'
                  : actualSize <= 36
                  ? 'text-lg lg:text-xl'
                  : actualSize <= 44
                  ? 'text-2xl'
                  : 'text-3xl',
                textClassName
              )}
            >
              Saksham<span className="ml-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent font-black">AI</span>
            </span>
          </div>
          {subtitle && (
            <span className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
              Enterprise SOC Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SakshamLogo;
