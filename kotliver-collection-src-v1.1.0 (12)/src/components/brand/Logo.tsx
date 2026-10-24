import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  light = false
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* KC Monogram Emblem */}
      <div
        className={`${iconDimensions[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#176B4D] via-[#0E4330] to-[#0A2F22] shadow-md border border-[#D4A72C]/40 p-1 shrink-0 overflow-hidden group`}
      >
        {/* Subtle golden corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4A72C]/80" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4A72C]/80" />
        
        {/* Monogram SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#D4A72C] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle outer diamond shield */}
          <polygon
            points="50,6 94,50 50,94 6,50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.6"
          />
          {/* Letter K */}
          <path
            d="M 32,24 L 32,76 M 32,50 L 52,24 M 41,39 L 55,76"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Interlocking Letter C with Golden Finish */}
          <path
            d="M 72,32 C 60,22 46,26 46,50 C 46,74 60,78 72,68"
            stroke="#D4A72C"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Center Crown / Star Accent */}
          <circle cx="50" cy="18" r="3" fill="#D4A72C" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-serif-brand font-bold tracking-tight ${titleSizes[size]} ${
              light ? 'text-white' : 'text-gray-900'
            }`}
          >
            KOTLIVER
          </span>
          <span className={`font-light tracking-widest text-[#D4A72C] ${titleSizes[size]}`}>
            COLLECTION
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] md:text-[11px] font-medium tracking-wider uppercase mt-1 ${
              light ? 'text-emerald-200/80' : 'text-emerald-800'
            }`}
          >
            Everything You Love, All in One Place
          </span>
        )}
      </div>
    </div>
  );
};
