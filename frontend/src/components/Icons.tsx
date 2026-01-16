import React from 'react';

interface IconProps {
  className?: string;
}

export const VitaminIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="7" cy="12" rx="5" ry="8" fill="currentColor" opacity="0.8" />
    <ellipse cx="17" cy="12" rx="5" ry="8" fill="currentColor" />
    <line x1="12" y1="4" x2="12" y2="20" stroke="white" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

export const HouseIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h12a1 1 0 001-1v-10M9 21v-6h6v6" />
  </svg>
);

export const WaterIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

export const GlassIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 3h12v7c0 3.314-2.686 6-6 6s-6-2.686-6-6V3z" />
    <path d="M9 20h6" />
  </svg>
);

export const LightningIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
