'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PrismCoreCanvas } from './visuals/PrismCoreCanvas';
import { useScrollDirector, ACT_IDS } from './motion/useScrollDirector';
import { TransitionPortal } from './motion/TransitionPortal';

// 8 Narrative Acts
import { HeroScene } from './scenes/HeroScene';
import { ProblemScene } from './scenes/ProblemScene';
import { SignalScene } from './scenes/SignalScene';
import { AskScene } from './scenes/AskScene';
import { UnderstandScene } from './scenes/UnderstandScene';
import { DecideScene } from './scenes/DecideScene';
import { ArchitectureScene } from './scenes/ArchitectureScene';
import { EnterScene } from './scenes/EnterScene';

const ACT_TITLES = [
  '01 O PRISM',
  '02 O PROBLEMA',
  '03 DO RUÍDO AO SINAL',
  '04 ASK (PERGUNTE)',
  '05 UNDERSTAND (COMPREENDA)',
  '06 DECIDE (DECIDA)',
  '07 ARQUITETURA',
  '08 ENTRAR NO PRISM',
];

export const PrismExperience: React.FC = () => {
  const router = useRouter();
  const { currentAct, actProgress, totalProgress, velocity, scrollToAct } = useScrollDirector();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleEnterDashboard = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 700);
  }, [router]);

  // Global Keyboard Listener for Narrative Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        if (currentAct < 8) {
          e.preventDefault();
          scrollToAct(currentAct + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        if (currentAct > 1) {
          e.preventDefault();
          scrollToAct(currentAct - 1);
        }
      } else if (e.key === 'Enter' && currentAct === 8) {
        e.preventDefault();
        handleEnterDashboard();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEnterDashboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAct, isTransitioning, scrollToAct, handleEnterDashboard]);

  return (
    <div className="relative bg-[#07090E] text-white min-h-screen selection:bg-blue-500/30 selection:text-white">
      {/* 1. Background Hardware-Accelerated PRISM CORE 3D Canvas */}
      <PrismCoreCanvas
        currentAct={currentAct}
        actProgress={actProgress}
        totalProgress={totalProgress}
        velocity={velocity}
        isTransitioning={isTransitioning}
      />

      {/* 2. Scroll Progress Top Line Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-40 bg-slate-900/50 backdrop-blur-xs">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-400 transition-all duration-150 ease-out"
          style={{ width: `${totalProgress * 100}%` }}
        />
      </div>

      {/* 3. Floating Sticky Narrative Act Telemetry HUD (Desktop Right) */}
      <nav
        className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-2 select-none"
        aria-label="Navegação por atos da narrativa"
      >
        {ACT_TITLES.map((title, idx) => {
          const actNumber = idx + 1;
          const isActive = currentAct === actNumber;
          return (
            <button
              key={title}
              type="button"
              onClick={() => scrollToAct(actNumber)}
              className="group flex items-center gap-3 py-1 cursor-pointer"
              title={`Navegar para ${title}`}
            >
              <span
                className={`text-[11px] font-mono transition-all duration-200 ${
                  isActive
                    ? 'text-white font-bold translate-x-0 opacity-100'
                    : 'text-slate-400 font-medium translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                {title}
              </span>
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-7 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 shadow-md shadow-blue-500/50'
                    : 'w-2 h-1.5 bg-slate-800 group-hover:bg-slate-600'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* 4. The 8 Narrative Act Sections */}
      <main className="relative z-10">
        <HeroScene
          onEnterDirectly={handleEnterDashboard}
          onScrollDown={() => scrollToAct(2)}
        />
        <ProblemScene actProgress={currentAct === 2 ? actProgress : 0} />
        <SignalScene actProgress={currentAct === 3 ? actProgress : 0} />
        <AskScene actProgress={currentAct === 4 ? actProgress : 0} />
        <UnderstandScene actProgress={currentAct === 5 ? actProgress : 0} />
        <DecideScene actProgress={currentAct === 6 ? actProgress : 0} />
        <ArchitectureScene actProgress={currentAct === 7 ? actProgress : 0} />
        <EnterScene
          onEnter={handleEnterDashboard}
          isTransitioning={isTransitioning}
        />
      </main>

      {/* 5. Warp Transition Overlay Portal */}
      <TransitionPortal isActive={isTransitioning} />
    </div>
  );
};
