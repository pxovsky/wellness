// components/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Tilde wave - main element */}
    <path
      d="M 8 22 Q 12 16 16 22 T 24 22 T 32 22"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Subtle accent wave */}
    <path
      d="M 10 28 Q 14 25 18 28 T 26 28 T 34 28"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export default Logo;
