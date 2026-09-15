import React from 'react';
import clsx from 'clsx';

type SpectralDimension = 'monetary' | 'behavioral' | 'structural' | 'neutral';

const dimensionClasses: Record<SpectralDimension, string> = {
  monetary: 'text-prism-indigo',
  behavioral: 'text-prism-violet',
  structural: 'text-prism-cyanDark',
  neutral: 'text-prism-muted',
};

export interface AnalyticalCoordinateProps {
  children: React.ReactNode;
  dimension?: SpectralDimension;
  className?: string;
}

export const AnalyticalCoordinate: React.FC<AnalyticalCoordinateProps> = ({
  children,
  dimension = 'neutral',
  className,
}) => (
  <span
    className={clsx(
      'font-mono text-[10px] font-semibold uppercase tracking-[0.16em]',
      dimensionClasses[dimension],
      className
    )}
  >
    {children}
  </span>
);
