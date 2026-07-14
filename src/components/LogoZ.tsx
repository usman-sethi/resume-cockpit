import React, { useId } from 'react';

export interface LogoZProps {
  /** Size of the logo in pixels (width & height) */
  size?: number;
  /** Custom CSS classes for styling */
  className?: string;
  /**
   * Style variant for different themes and corporate use cases:
   * - `standard`: Premium Blue/Indigo Z on a dark Slate (#0F172A) container (Default)
   * - `dark`: Clean white Z on an ultra-dark Slate (#090D16) container
   * - `light`: Deep Slate (#0F172A) Z on a light Gray (#F8FAFC) container
   * - `mono-black`: Solid black Z on a pure white container (or transparent if no container)
   * - `mono-white`: Solid white Z on a transparent container
   * - `minimal`: Pure Z monogram with no background container (uses currentColor or standard Blue)
   * - `favicon`: Extra-bold, high-contrast simplified layout optimized for tiny 16px/32px viewports
   */
  variant?: 'standard' | 'dark' | 'light' | 'mono-black' | 'mono-white' | 'minimal' | 'favicon';
  /** Optional hover scale transition (defaults to true) */
  hoverEffect?: boolean;
}

/**
 * AI Resume Architect Brand Logo
 * Redesigned as a world-class, premium geometric monogram based on a strict 45° grid.
 * Employs clean mathematical symmetry and provides high legibility at all scales.
 */
export const LogoZ: React.FC<LogoZProps> = ({
  size = 36,
  className = "",
  variant = "standard",
  hoverEffect = true,
}) => {
  const uniqueId = useId();
  const gradientId = `logo-z-gradient-${uniqueId}`;

  // Container configuration based on variant choice
  let containerBg = "#0F172A";
  let containerBorder: string | null = null;
  let useContainer = true;

  switch (variant) {
    case 'dark':
      containerBg = "#090D16";
      break;
    case 'light':
      containerBg = "#F8FAFC";
      containerBorder = "#E2E8F0";
      break;
    case 'mono-black':
      containerBg = "#FFFFFF";
      containerBorder = "#000000";
      break;
    case 'mono-white':
      containerBg = "transparent";
      useContainer = false;
      break;
    case 'minimal':
    case 'favicon':
      containerBg = "transparent";
      useContainer = false;
      break;
    case 'standard':
    default:
      containerBg = "#0F172A";
      break;
  }

  // Z Path fill color/gradient definition
  let zFill = `url(#${gradientId})`;
  if (variant === 'dark' || variant === 'mono-white') {
    zFill = "#F8FAFC";
  } else if (variant === 'light') {
    zFill = "#0F172A";
  } else if (variant === 'mono-black') {
    zFill = "#000000";
  } else if (variant === 'minimal') {
    zFill = "#2563EB"; // Inheritable or clean brand blue
  }

  // Path data for Z monogram
  // Both standard and favicon paths feature 100% mathematical 180° rotational symmetry
  const standardPath = "M 26 26 H 74 V 38 L 50 62 H 74 V 74 H 26 V 62 L 50 38 H 26 Z";
  
  // Favicon path is tuned to be bolder (16px thickness instead of 12px) 
  // and sits closer to the edge for maximum pixel density and clarity at small sizes.
  const faviconPath = "M 18 18 H 82 V 34 L 50 66 H 82 V 82 H 18 V 66 L 50 34 H 18 Z";

  const pathData = (variant === 'favicon') ? faviconPath : standardPath;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-200 ${
        hoverEffect ? 'hover:scale-[1.02]' : ''
      } ${className}`}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="AI Resume Architect Logo"
    >
      <title>AI Resume Architect Brand Mark</title>
      
      {/* Definitive Gradient Configuration (only rendered when needed) */}
      {(variant === 'standard' || variant === 'minimal') && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" /> {/* Brand Blue 500 */}
            <stop offset="100%" stopColor="#1D4ED8" /> {/* Brand Deep Blue 700 */}
          </linearGradient>
        </defs>
      )}

      {/* Corporate Solid Rounded Square Container */}
      {useContainer && (
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="18"
          fill={containerBg}
          {...(containerBorder ? { stroke: containerBorder, strokeWidth: "3" } : {})}
        />
      )}

      {/* Symmetrical Geometric Z Monogram */}
      <path
        d={pathData}
        fill={zFill}
      />
    </svg>
  );
};
