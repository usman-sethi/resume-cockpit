import React from 'react';

interface LogoZProps {
  size?: number;
  className?: string;
}

export const LogoZ: React.FC<LogoZProps> = ({ size = 36, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Main background gradient */}
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Glossy overlay gradient */}
        <linearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
          <stop offset="40%" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.4} />
        </linearGradient>

        {/* Letter Z Gradient */}
        <linearGradient id="zGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" /> {/* Sky 400 */}
          <stop offset="50%" stopColor="#2563eb" /> {/* Blue 600 */}
          <stop offset="100%" stopColor="#7c3aed" /> {/* Violet 600 */}
        </linearGradient>

        {/* Glowing accent border gradient */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
          <stop offset="50%" stopColor="#4f46e5" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
        </linearGradient>

        {/* Subtle shadow filter */}
        <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Base rounded square container */}
      <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#bgGrad)" stroke="url(#borderGrad)" strokeWidth="1.5" />

      {/* Secondary Inner Shadow and Gloss */}
      <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#glossGrad)" pointerEvents="none" />

      {/* Stylized Modern Z Graphic */}
      <g filter="url(#logoGlow)">
        {/* Left back accent element */}
        <path
          d="M 28 32 L 42 32 L 64 68 L 50 68 Z"
          fill="#38bdf8"
          opacity="0.15"
        />
        
        {/* Solid ribbon Z */}
        <path
          d="M 26 28 
             H 74 
             C 76.5 28, 77.2 31.2, 75.3, 32.8 
             L 39.5 68
             H 74
             C 76.5 68, 76.5 72, 74 72
             H 26
             C 23.5 72, 22.8 68.8, 24.7, 67.2
             L 60.5 32
             H 26
             C 23.5 32, 23.5 28, 26 28 Z"
          fill="url(#zGrad)"
        />

        {/* Tech geometric notches - adding highly polished detail */}
        <circle cx="71" cy="32" r="2.5" fill="#ffffff" opacity="0.9" />
        <circle cx="29" cy="68" r="2.5" fill="#38bdf8" opacity="0.9" />
      </g>
    </svg>
  );
};
