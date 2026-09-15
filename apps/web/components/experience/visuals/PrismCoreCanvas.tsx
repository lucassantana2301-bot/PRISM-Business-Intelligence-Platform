'use client';

import React, { useEffect, useRef } from 'react';
import { detectPerformance, PerformanceState } from '../motion/PerformanceDetector';

interface PrismCoreCanvasProps {
  currentAct: number;
  actProgress: number;
  totalProgress: number;
  velocity: number;
  isTransitioning?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  hue: number;
  targetFacet: number;
}

// Base 3D Octahedral / Double-Pyramid Prism Vertices
const BASE_VERTICES: Point3D[] = [
  { x: 0, y: -130, z: 0 },   // 0: Top Apex
  { x: 90, y: 0, z: 90 },    // 1: Base Front-Right
  { x: -90, y: 0, z: 90 },   // 2: Base Front-Left
  { x: -90, y: 0, z: -90 },  // 3: Base Back-Left
  { x: 90, y: 0, z: -90 },   // 4: Base Back-Right
  { x: 0, y: 130, z: 0 },    // 5: Bottom Apex
];

// Triangular Facets (Indices)
const FACETS: [number, number, number][] = [
  // Top Pyramid
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 1],
  // Bottom Pyramid
  [5, 2, 1],
  [5, 3, 2],
  [5, 4, 3],
  [5, 1, 4],
];

export const PrismCoreCanvas: React.FC<PrismCoreCanvasProps> = ({
  currentAct,
  actProgress,
  totalProgress,
  velocity,
  isTransitioning = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const stateRef = useRef<{
    rotX: number;
    rotY: number;
    rotZ: number;
    pulse: number;
    particles: Particle[];
    perf: PerformanceState;
  }>({
    rotX: 0.2,
    rotY: 0,
    rotZ: 0,
    pulse: 0,
    particles: [],
    perf: {
      tier: 'HIGH',
      reducedMotion: false,
      maxParticles: 140,
      enableRefraction: true,
      dpr: 1,
    },
  });

  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Canvas & Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const perf = detectPerformance();
    stateRef.current.perf = perf;

    // Initialize Particles
    const particles: Particle[] = [];
    const count = perf.maxParticles;
    for (let i = 0; i < count; i++) {
      const radius = 250 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      particles.push({
        x: radius * Math.cos(phi) * Math.cos(theta),
        y: radius * Math.sin(phi),
        z: radius * Math.cos(phi) * Math.sin(theta),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.8,
        size: 1 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.6,
        hue: 210 + Math.random() * 60, // Blue-indigo-violet spectrum
        targetFacet: Math.floor(Math.random() * FACETS.length),
      });
    }
    stateRef.current.particles = particles;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * perf.dpr;
      canvas.height = height * perf.dpr;
      ctx.scale(perf.dpr, perf.dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Render Loop
    let lastTimestamp = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTimestamp) / 1000, 0.1);
      lastTimestamp = time;

      // Mouse Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Dynamic Rotation with Scroll Velocity & Parallax
      const baseSpeed = currentAct === 2 && actProgress > 0.6 ? 0.05 : 0.4; // freeze near Act 2 climax
      const rotSpeed = (baseSpeed + velocity * 0.2) * (perf.reducedMotion ? 0 : 1);
      stateRef.current.rotY += rotSpeed * dt;
      stateRef.current.rotX = 0.25 + mouseRef.current.y * 0.35;
      stateRef.current.rotZ = mouseRef.current.x * 0.2;
      stateRef.current.pulse += dt * 2;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Dynamic Scale based on Act & Transitioning
      let scaleMultiplier = 1.0;
      if (currentAct === 1) scaleMultiplier = 1.0 + Math.sin(stateRef.current.pulse) * 0.03;
      if (currentAct === 2) scaleMultiplier = 0.85;
      if (currentAct === 3) scaleMultiplier = 1.15;
      if (currentAct === 4) scaleMultiplier = 1.05;
      if (currentAct === 5) scaleMultiplier = 1.1;
      if (currentAct === 6) scaleMultiplier = 1.2;
      if (currentAct === 7) scaleMultiplier = 0.95;
      if (currentAct === 8) scaleMultiplier = 1.35 + (isTransitioning ? 6.0 : 0);

      // 3D Transformation Math
      const cosY = Math.cos(stateRef.current.rotY);
      const sinY = Math.sin(stateRef.current.rotY);
      const cosX = Math.cos(stateRef.current.rotX);
      const sinX = Math.sin(stateRef.current.rotX);
      const cosZ = Math.cos(stateRef.current.rotZ);
      const sinZ = Math.sin(stateRef.current.rotZ);

      const project = (p: Point3D): { x: number; y: number; z: number } => {
        // Apply scaling
        const px = p.x * scaleMultiplier;
        const py = p.y * scaleMultiplier;
        const pz = p.z * scaleMultiplier;

        // Rotate Y
        let x1 = px * cosY - pz * sinY;
        let y1 = py;
        let z1 = px * sinY + pz * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        // Perspective projection with focal distance
        const focal = 650;
        const distance = 400;
        const factor = focal / (z3 + distance + 200);

        return {
          x: cx + x3 * factor,
          y: cy + y3 * factor,
          z: z3,
        };
      };

      const projectedVertices = BASE_VERTICES.map(project);

      // 1. Draw Ambient Telemetry Particles
      const particles = stateRef.current.particles;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Particle attraction dynamics per Act
        if (currentAct === 3 || currentAct === 8) {
          // Accelerate convergence into center
          const distSq = pt.x * pt.x + pt.y * pt.y + pt.z * pt.z;
          const force = 1200 / (distSq + 100);
          pt.vx -= (pt.x / Math.sqrt(distSq)) * force;
          pt.vy -= (pt.y / Math.sqrt(distSq)) * force;
          pt.vz -= (pt.z / Math.sqrt(distSq)) * force;
        } else if (currentAct === 2) {
          // Chaotic turbulence
          pt.vx += (Math.random() - 0.5) * 1.5;
          pt.vy += (Math.random() - 0.5) * 1.5;
        }

        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;

        // Reset if too close or too far
        const dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
        if (dist < 30 || dist > 600) {
          const r = 350 + Math.random() * 200;
          const th = Math.random() * Math.PI * 2;
          const ph = (Math.random() - 0.5) * Math.PI;
          pt.x = r * Math.cos(ph) * Math.cos(th);
          pt.y = r * Math.sin(ph);
          pt.z = r * Math.cos(ph) * Math.sin(th);
          pt.vx = (Math.random() - 0.5) * 0.8;
          pt.vy = (Math.random() - 0.5) * 0.8;
          pt.vz = (Math.random() - 0.5) * 0.8;
        }

        const proj = project(pt);
        if (proj.z > -300) {
          const alpha = Math.max(0.1, Math.min(pt.alpha * (proj.z > 0 ? 1 : 0.4), 1));
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, pt.size * (proj.z > 0 ? 1.2 : 0.8), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${pt.hue}, 85%, 65%, ${alpha})`;
          ctx.fill();

          // Subtle connect lines to center when in Signal / Understand Act
          if ((currentAct === 3 || currentAct === 5) && i % 4 === 0) {
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = `hsla(${pt.hue}, 90%, 60%, ${alpha * 0.15})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 2. Sort Facets by Depth for Correct Translucency Sorting
      const sortedFacets = FACETS.map((f, idx) => {
        const v0 = projectedVertices[f[0]];
        const v1 = projectedVertices[f[1]];
        const v2 = projectedVertices[f[2]];
        const avgZ = (v0.z + v1.z + v2.z) / 3;
        return { indices: f, avgZ, idx };
      }).sort((a, b) => a.avgZ - b.avgZ);

      // 3. Render Refractive Prism Facets
      sortedFacets.forEach(({ indices, avgZ, idx }) => {
        const p0 = projectedVertices[indices[0]];
        const p1 = projectedVertices[indices[1]];
        const p2 = projectedVertices[indices[2]];

        // Normal Vector calculation for illumination
        const ax = p1.x - p0.x;
        const ay = p1.y - p0.y;
        const bx = p2.x - p0.x;
        const by = p2.y - p0.y;
        const cross = ax * by - ay * bx;

        const isFrontFacing = cross > 0;
        const depthAlpha = isFrontFacing ? 0.35 : 0.12;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        // Spectral Gradient Fill based on Act
        const grad = ctx.createLinearGradient(p0.x, p0.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        if (currentAct === 4) {
          // Ask Act: Electric Indigo & Violet inquiry
          grad.addColorStop(0, `rgba(99, 102, 241, ${depthAlpha * 1.3})`);
          grad.addColorStop(1, `rgba(168, 85, 247, ${depthAlpha * 0.8})`);
        } else if (currentAct === 6) {
          // Decide Act: Emerald & Blue clarity
          grad.addColorStop(0, `rgba(16, 185, 129, ${depthAlpha * 1.4})`);
          grad.addColorStop(1, `rgba(59, 130, 246, ${depthAlpha * 0.9})`);
        } else if (currentAct === 8) {
          // Enter Act: Radiant Bright Blue & White Ignition
          grad.addColorStop(0, `rgba(255, 255, 255, ${depthAlpha * 1.8})`);
          grad.addColorStop(1, `rgba(59, 130, 246, ${depthAlpha * 1.2})`);
        } else {
          // Standard: Electric Cyan, Blue & Deep Indigo
          grad.addColorStop(0, `rgba(56, 189, 248, ${depthAlpha})`);
          grad.addColorStop(0.5, `rgba(99, 102, 241, ${depthAlpha * 0.9})`);
          grad.addColorStop(1, `rgba(139, 92, 246, ${depthAlpha * 0.6})`);
        }

        ctx.fillStyle = grad;
        ctx.fill();

        // Facet Edges / Wireframe Lines
        ctx.strokeStyle = isFrontFacing
          ? `rgba(147, 197, 253, ${0.4 + (currentAct === 8 ? 0.5 : 0)})`
          : `rgba(99, 102, 241, 0.2)`;
        ctx.lineWidth = isFrontFacing ? 1.5 : 0.8;
        ctx.stroke();
      });

      // 4. Incident & Refracted Spectral Beams (Snell's Law Dispersion Simulation)
      if (perf.enableRefraction && (currentAct === 1 || currentAct === 3 || currentAct === 5 || currentAct === 6 || currentAct === 8)) {
        const beamAlpha = currentAct === 8 ? 0.85 : 0.35;

        // Incident Beam (Entering from left)
        const inGrad = ctx.createLinearGradient(cx - 380, cy - 60, cx, cy);
        inGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        inGrad.addColorStop(0.8, `rgba(255, 255, 255, ${beamAlpha * 0.6})`);
        inGrad.addColorStop(1, `rgba(255, 255, 255, ${beamAlpha * 0.9})`);

        ctx.beginPath();
        ctx.moveTo(cx - 380, cy - 60);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = inGrad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dispersed Refracted Spectral Beams (Exiting right at differing angles)
        const spectralAngles = [
          { color: 'rgba(239, 68, 68, ', dy: -45, label: 'RED' },     // Red
          { color: 'rgba(245, 158, 11, ', dy: -25, label: 'AMBER' },  // Amber
          { color: 'rgba(16, 185, 129, ', dy: 0, label: 'EMERALD' },  // Green
          { color: 'rgba(6, 182, 212, ', dy: 25, label: 'CYAN' },     // Cyan
          { color: 'rgba(59, 130, 246, ', dy: 48, label: 'BLUE' },    // Blue
          { color: 'rgba(168, 85, 247, ', dy: 72, label: 'VIOLET' },  // Violet
        ];

        spectralAngles.forEach(({ color, dy }) => {
          const outGrad = ctx.createLinearGradient(cx, cy, cx + 420, cy + dy * 2);
          outGrad.addColorStop(0, `${color}${beamAlpha * 0.9})`);
          outGrad.addColorStop(0.7, `${color}${beamAlpha * 0.5})`);
          outGrad.addColorStop(1, `${color}0)`);

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 420, cy + dy * 2);
          ctx.strokeStyle = outGrad;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // 5. Internal Core Pulse Glow
      const corePulseGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 90 * scaleMultiplier);
      const pulseBrightness = 0.25 + Math.sin(stateRef.current.pulse * 1.5) * 0.1 + (currentAct === 8 ? 0.6 : 0);
      corePulseGrad.addColorStop(0, `rgba(147, 197, 253, ${pulseBrightness})`);
      corePulseGrad.addColorStop(0.5, `rgba(99, 102, 241, ${pulseBrightness * 0.5})`);
      corePulseGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, 90 * scaleMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = corePulseGrad;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentAct, actProgress, totalProgress, velocity, isTransitioning]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Abstract Coordinates Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      {/* Deep Center Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#07090E]/60 to-[#07090E]" />

      {/* Master 60FPS Hardware-Accelerated Projection Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block transition-transform duration-700 ease-out"
        style={{
          transform: isTransitioning ? 'scale(4.5)' : 'scale(1)',
          opacity: isTransitioning ? 0.9 : 1,
        }}
        aria-hidden="true"
      />
    </div>
  );
};
