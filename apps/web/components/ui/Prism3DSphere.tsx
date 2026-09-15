'use client';

import React, { memo } from 'react';

interface Prism3DSphereProps {
  size?: number;
  className?: string;
}

export const Prism3DSphere: React.FC<Prism3DSphereProps> = memo(({ size = 34, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none overflow-visible will-change-transform ${className}`}
      style={{ width: size, height: size, transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      {/* Subtle ambient bloom (pure CSS hardware accelerated) */}
      <div
        className="absolute inset-1 rounded-full opacity-50 blur-sm pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(56, 189, 248, 0.2) 60%, transparent 100%)',
        }}
      />

      {/* 3D React-style Gyroscopic Atom / Sphere Container */}
      <svg
        viewBox="-20 -20 140 140"
        className="w-full h-full relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradient for 3D Core Sphere */}
          <radialGradient id="prismCore3D" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Clean Gradient Strokes (zero SVG blur filter overhead) */}
          <linearGradient id="orbitCyanIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="orbitIndigoPurple" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Orbit Ring 1 (Horizontal / 0 deg) */}
        <g className="origin-center animate-[spin_8s_linear_infinite] will-change-transform">
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="15"
            stroke="url(#orbitCyanIndigo)"
            strokeWidth="2.2"
          />
          {/* Orbiting Electron 1 */}
          <circle cx="92" cy="50" r="3" fill="#38bdf8" />
        </g>

        {/* Orbit Ring 2 (60 deg tilt) */}
        <g className="origin-center animate-[spin_10s_linear_infinite_reverse] will-change-transform" style={{ transform: 'rotate(60deg)' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="15"
            stroke="url(#orbitIndigoPurple)"
            strokeWidth="2.2"
          />
          {/* Orbiting Electron 2 */}
          <circle cx="8" cy="50" r="3" fill="#a855f7" />
        </g>

        {/* Orbit Ring 3 (120 deg tilt) */}
        <g className="origin-center animate-[spin_12s_linear_infinite] will-change-transform" style={{ transform: 'rotate(120deg)' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="15"
            stroke="url(#orbitCyanIndigo)"
            strokeWidth="2.2"
          />
          {/* Orbiting Electron 3 */}
          <circle cx="50" cy="65" r="3" fill="#60a5fa" />
        </g>

        {/* Central 3D Glowing Core Sphere */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="url(#prismCore3D)"
          className="transition-transform duration-200 group-hover:scale-105"
        />

        {/* Specular Highlight Glare on Sphere */}
        <ellipse
          cx="45"
          cy="43"
          rx="4"
          ry="2.2"
          fill="#ffffff"
          fillOpacity="0.9"
          transform="rotate(-25 45 43)"
        />
      </svg>
    </div>
  );
});

Prism3DSphere.displayName = 'Prism3DSphere';
