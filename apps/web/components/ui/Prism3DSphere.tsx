'use client';

import React from 'react';

interface Prism3DSphereProps {
  size?: number;
  className?: string;
}

export const Prism3DSphere: React.FC<Prism3DSphereProps> = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size, perspective: '600px' }}
      aria-hidden="true"
    >
      {/* Outer ambient glow bloom */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-60 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(6, 182, 212, 0.4) 60%, transparent 100%)',
        }}
      />

      {/* 3D React-style Gyroscopic Atom / Sphere Container */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradient for 3D Core Sphere */}
          <radialGradient id="prismCore3D" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Neon Ring Gradients */}
          <linearGradient id="orbitCyanIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="orbitIndigoPurple" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Ring 1 (Horizontal / 0 deg) */}
        <g className="origin-center animate-[spin_8s_linear_infinite]">
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="16"
            stroke="url(#orbitCyanIndigo)"
            strokeWidth="2.5"
            filter="url(#neonGlow)"
          />
          {/* Orbiting Electron 1 */}
          <circle cx="94" cy="50" r="3" fill="#38bdf8" className="filter drop-shadow-[0_0_4px_#38bdf8]" />
        </g>

        {/* Orbit Ring 2 (60 deg tilt) */}
        <g className="origin-center animate-[spin_10s_linear_infinite_reverse]" style={{ transform: 'rotate(60deg)' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="16"
            stroke="url(#orbitIndigoPurple)"
            strokeWidth="2.5"
            filter="url(#neonGlow)"
          />
          {/* Orbiting Electron 2 */}
          <circle cx="6" cy="50" r="3" fill="#a855f7" className="filter drop-shadow-[0_0_4px_#a855f7]" />
        </g>

        {/* Orbit Ring 3 (120 deg tilt) */}
        <g className="origin-center animate-[spin_12s_linear_infinite]" style={{ transform: 'rotate(120deg)' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="16"
            stroke="url(#orbitCyanIndigo)"
            strokeWidth="2.5"
            filter="url(#neonGlow)"
          />
          {/* Orbiting Electron 3 */}
          <circle cx="50" cy="66" r="3" fill="#60a5fa" className="filter drop-shadow-[0_0_4px_#60a5fa]" />
        </g>

        {/* Central 3D Glowing Core Sphere */}
        <circle
          cx="50"
          cy="50"
          r="16"
          fill="url(#prismCore3D)"
          className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-transform duration-300 group-hover:scale-110"
        />

        {/* Specular Highlight Glare on Sphere */}
        <ellipse
          cx="45"
          cy="43"
          rx="5"
          ry="3"
          fill="#ffffff"
          fillOpacity="0.8"
          transform="rotate(-25 45 43)"
        />
      </svg>
    </div>
  );
};
