'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScrollDirectorState {
  currentAct: number; // 1 to 8
  actProgress: number; // 0 to 1 within active act
  totalProgress: number; // 0 to 1 across entire experience
  velocity: number;
  isScrolling: boolean;
  scrollToAct: (actNumber: number) => void;
}

export const ACT_IDS = [
  'act-01-the-prism',
  'act-02-the-problem',
  'act-03-noise-to-signal',
  'act-04-ask',
  'act-05-understand',
  'act-06-decide',
  'act-07-built-different',
  'act-08-enter-prism',
];

export function useScrollDirector(): ScrollDirectorState {
  const [currentAct, setCurrentAct] = useState<number>(1);
  const [actProgress, setActProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  const lastScrollY = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollY = window.scrollY;
    const now = performance.now();
    const dt = Math.max(now - lastTime.current, 16);
    const dy = scrollY - lastScrollY.current;
    const currentVelocity = Math.min(Math.abs(dy / dt) * 10, 5);

    setVelocity(currentVelocity);
    lastScrollY.current = scrollY;
    lastTime.current = now;
    setIsScrolling(true);

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
      setVelocity(0);
    }, 150);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
    setTotalProgress(rawProgress);

    // Calculate active act (1 to 8)
    const totalActs = ACT_IDS.length;
    const actFraction = 1 / totalActs;
    const calculatedAct = Math.min(Math.floor(rawProgress / actFraction) + 1, totalActs);
    const localProg = (rawProgress - (calculatedAct - 1) * actFraction) / actFraction;

    setCurrentAct(calculatedAct);
    setActProgress(Math.min(Math.max(localProg, 0), 1));
  }, []);

  useEffect(() => {
    lastTime.current = performance.now();
    lastScrollY.current = window.scrollY;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [handleScroll]);

  // Direct programmatic jump to act
  const scrollToAct = useCallback((actNumber: number) => {
    if (typeof window === 'undefined') return;
    const targetIndex = Math.min(Math.max(actNumber - 1, 0), ACT_IDS.length - 1);
    const targetId = ACT_IDS[targetIndex];
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    currentAct,
    actProgress,
    totalProgress,
    velocity,
    isScrolling,
    scrollToAct,
  };
}
