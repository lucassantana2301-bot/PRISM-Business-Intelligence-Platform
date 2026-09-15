'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RegionInfo {
  id: string;
  name: string;
  location: string;
  flag: string;
  latencyMs: number;
  status: 'optimal' | 'operational' | 'degraded';
}

export const REGIONS: RegionInfo[] = [
  { id: 'sa-east-1', name: 'América do Sul', location: 'São Paulo', flag: '🇧🇷', latencyMs: 14, status: 'optimal' },
  { id: 'us-east-1', name: 'US East', location: 'N. Virginia', flag: '🇺🇸', latencyMs: 112, status: 'optimal' },
  { id: 'eu-central-1', name: 'Europa', location: 'Frankfurt', flag: '🇩🇪', latencyMs: 168, status: 'operational' },
];

export interface EnvironmentInfo {
  id: 'prod' | 'staging' | 'sandbox';
  name: string;
  account: string;
  accountId: string;
  color: string;
}

export const ENVIRONMENTS: EnvironmentInfo[] = [
  { id: 'prod', name: 'Produção', account: 'Acme Retail Group', accountId: '9482-1049-3321', color: 'emerald' },
  { id: 'staging', name: 'Homologação', account: 'Acme Staging Cluster', accountId: '9482-1049-0099', color: 'amber' },
  { id: 'sandbox', name: 'Sandbox Analytics', account: 'Acme Test Labs', accountId: '9482-1049-0001', color: 'indigo' },
];

interface RegionContextType {
  activeRegion: RegionInfo;
  setActiveRegion: (region: RegionInfo) => void;
  activeEnv: EnvironmentInfo;
  setActiveEnv: (env: EnvironmentInfo) => void;
  cacheHitRate: number;
  activeThreads: number;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRegion, setActiveRegion] = useState<RegionInfo>(REGIONS[0]);
  const [activeEnv, setActiveEnv] = useState<EnvironmentInfo>(ENVIRONMENTS[0]);
  const [cacheHitRate, setCacheHitRate] = useState(99.4);
  const [activeThreads] = useState(8);

  // Subtle telemetry jitter for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheHitRate((prev) => {
        const jitter = (Math.random() * 0.4 - 0.2);
        return Math.min(99.9, Math.max(98.8, +(prev + jitter).toFixed(1)));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RegionContext.Provider
      value={{
        activeRegion,
        setActiveRegion,
        activeEnv,
        setActiveEnv,
        cacheHitRate,
        activeThreads,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
