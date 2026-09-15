/**
 * Performance Capability & Accessibility Detector
 * Categorizes client hardware into HIGH, MEDIUM, or LOW tiers
 * and respects prefers-reduced-motion.
 */

export type PerformanceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PerformanceState {
  tier: PerformanceTier;
  reducedMotion: boolean;
  maxParticles: number;
  enableRefraction: boolean;
  dpr: number;
}

export function detectPerformance(): PerformanceState {
  if (typeof window === 'undefined') {
    return {
      tier: 'HIGH',
      reducedMotion: false,
      maxParticles: 160,
      enableRefraction: true,
      dpr: 1,
    };
  }

  // 1. Reduced Motion Check
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = reducedMotionQuery.matches;

  // 2. Hardware concurrency & memory heuristics
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  if (reducedMotion) {
    return {
      tier: 'LOW',
      reducedMotion: true,
      maxParticles: 30,
      enableRefraction: false,
      dpr: 1,
    };
  }

  if (isMobile || cores <= 4) {
    return {
      tier: 'MEDIUM',
      reducedMotion: false,
      maxParticles: 80,
      enableRefraction: true,
      dpr: Math.min(devicePixelRatio, 1.5),
    };
  }

  return {
    tier: 'HIGH',
    reducedMotion: false,
    maxParticles: 180,
    enableRefraction: true,
    dpr: Math.min(devicePixelRatio, 2),
  };
}
