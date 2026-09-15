'use client';

import React from 'react';

interface TransitionPortalProps {
  isActive: boolean;
}

export const TransitionPortal: React.FC<TransitionPortalProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden animate-fade-in"
      aria-hidden="true"
    >
      {/* Expanding Optical Light Flare */}
      <div className="absolute w-[200vw] h-[200vh] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,1)_0%,_rgba(59,130,246,0.9)_25%,_rgba(13,19,34,0.95)_70%,_#090A0F_100%)] animate-ping opacity-95 duration-1000 scale-[3]" />

      {/* Center Prism Flash */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-white shadow-[0_0_80px_rgba(255,255,255,0.9)] flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-blue-600">▲</span>
        </div>
        <div className="text-white font-mono text-sm tracking-widest uppercase font-bold">
          CARREGANDO PAINEL EXECUTIVO...
        </div>
      </div>
    </div>
  );
};
