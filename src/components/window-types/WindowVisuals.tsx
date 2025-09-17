import React from 'react';

interface WindowVisualProps {
  className?: string;
  size?: number;
}

export const StandardWindowVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.8} 
    viewBox="0 0 100 80" 
    className={className}
  >
    <defs>
      <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.1)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.2)" />
      </linearGradient>
    </defs>
    
    {/* Window frame */}
    <rect x="10" y="10" width="80" height="60" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="3" />
    
    {/* Glass area */}
    <rect x="15" y="15" width="70" height="50" fill="url(#glass-gradient)" stroke="#8B7355" strokeWidth="1" rx="2" />
    
    {/* Cross mullions */}
    <line x1="50" y1="15" x2="50" y2="65" stroke="#8B7355" strokeWidth="2" />
    <line x1="15" y1="40" x2="85" y2="40" stroke="#8B7355" strokeWidth="2" />
    
    {/* Glass reflection */}
    <rect x="20" y="20" width="8" height="15" fill="rgba(255,255,255,0.4)" rx="1" />
  </svg>
);

export const BayWindowVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.8} 
    viewBox="0 0 100 80" 
    className={className}
  >
    <defs>
      <linearGradient id="bay-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.4)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.1)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.3)" />
      </linearGradient>
    </defs>
    
    {/* Center panel */}
    <rect x="35" y="15" width="30" height="50" fill="#8B7355" stroke="#6B5B45" strokeWidth="1.5" rx="2" />
    <rect x="38" y="18" width="24" height="44" fill="url(#bay-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    {/* Left angled panel */}
    <polygon points="15,20 35,15 35,65 15,70" fill="#8B7355" stroke="#6B5B45" strokeWidth="1.5" />
    <polygon points="18,22 32,17 32,63 18,68" fill="url(#bay-glass)" stroke="#8B7355" strokeWidth="1" />
    
    {/* Right angled panel */}
    <polygon points="65,15 85,20 85,70 65,65" fill="#8B7355" stroke="#6B5B45" strokeWidth="1.5" />
    <polygon points="68,17 82,22 82,68 68,63" fill="url(#bay-glass)" stroke="#8B7355" strokeWidth="1" />
    
    {/* Reflections */}
    <rect x="42" y="22" width="4" height="12" fill="rgba(255,255,255,0.3)" rx="1" />
    <polygon points="22,26 28,24 28,35 22,37" fill="rgba(255,255,255,0.3)" />
  </svg>
);

export const FrenchDoorsVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 1.2} 
    viewBox="0 0 100 120" 
    className={className}
  >
    <defs>
      <linearGradient id="door-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.2)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.4)" />
      </linearGradient>
    </defs>
    
    {/* Left door */}
    <rect x="15" y="10" width="30" height="100" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="3" />
    <rect x="18" y="15" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    <rect x="18" y="45" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    <rect x="18" y="75" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    
    {/* Right door */}
    <rect x="55" y="10" width="30" height="100" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="3" />
    <rect x="58" y="15" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    <rect x="58" y="45" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    <rect x="58" y="75" width="24" height="25" fill="url(#door-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    
    {/* Door handles */}
    <circle cx="40" cy="60" r="2" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
    <circle cx="60" cy="60" r="2" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
    
    {/* Reflections */}
    <rect x="22" y="18" width="3" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
    <rect x="62" y="18" width="3" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
  </svg>
);

export const SlidingDoorsVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.9} 
    viewBox="0 0 100 90" 
    className={className}
  >
    <defs>
      <linearGradient id="sliding-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.1)" />
      </linearGradient>
    </defs>
    
    {/* Track */}
    <rect x="10" y="10" width="80" height="3" fill="#666" rx="1.5" />
    <rect x="10" y="77" width="80" height="3" fill="#666" rx="1.5" />
    
    {/* Back panel */}
    <rect x="15" y="13" width="35" height="64" fill="#8B7355" stroke="#6B5B45" strokeWidth="1" rx="2" opacity="0.7" />
    <rect x="18" y="16" width="29" height="58" fill="url(#sliding-glass)" stroke="#8B7355" strokeWidth="1" rx="1" opacity="0.7" />
    
    {/* Front panel (overlapping) */}
    <rect x="45" y="13" width="35" height="64" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="2" />
    <rect x="48" y="16" width="29" height="58" fill="url(#sliding-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    {/* Handles */}
    <rect x="72" y="43" width="4" height="2" fill="#DAA520" rx="1" />
    <rect x="25" y="43" width="4" height="2" fill="#DAA520" rx="1" opacity="0.6" />
    
    {/* Reflections */}
    <rect x="52" y="20" width="4" height="12" fill="rgba(255,255,255,0.4)" rx="1" />
  </svg>
);

export const LargeWindowVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.7} 
    viewBox="0 0 100 70" 
    className={className}
  >
    <defs>
      <linearGradient id="large-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.2)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.05)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.3)" />
      </linearGradient>
    </defs>
    
    {/* Large window frame */}
    <rect x="5" y="10" width="90" height="50" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="3" />
    
    {/* Glass area */}
    <rect x="10" y="15" width="80" height="40" fill="url(#large-glass)" stroke="#8B7355" strokeWidth="1" rx="2" />
    
    {/* Minimal mullions */}
    <line x1="35" y1="15" x2="35" y2="55" stroke="#8B7355" strokeWidth="1.5" />
    <line x1="65" y1="15" x2="65" y2="55" stroke="#8B7355" strokeWidth="1.5" />
    
    {/* Reflections */}
    <rect x="15" y="20" width="6" height="15" fill="rgba(255,255,255,0.3)" rx="2" />
    <rect x="40" y="25" width="5" height="12" fill="rgba(255,255,255,0.2)" rx="1" />
  </svg>
);

export const CornerWindowVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.8} 
    viewBox="0 0 100 80" 
    className={className}
  >
    <defs>
      <linearGradient id="corner-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.1)" />
      </linearGradient>
    </defs>
    
    {/* Horizontal window */}
    <rect x="40" y="35" width="50" height="30" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="2" />
    <rect x="43" y="38" width="44" height="24" fill="url(#corner-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    {/* Vertical window */}
    <rect x="20" y="15" width="30" height="35" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="2" />
    <rect x="23" y="18" width="24" height="29" fill="url(#corner-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    {/* Corner junction */}
    <rect x="40" y="35" width="10" height="15" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" />
    
    {/* Reflections */}
    <rect x="47" y="40" width="3" height="8" fill="rgba(255,255,255,0.3)" rx="1" />
    <rect x="27" y="22" width="3" height="8" fill="rgba(255,255,255,0.3)" rx="1" />
  </svg>
);

export const TerraceDoorsVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 1.1} 
    viewBox="0 0 100 110" 
    className={className}
  >
    <defs>
      <linearGradient id="terrace-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.2)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.3)" />
      </linearGradient>
    </defs>
    
    {/* Wide terrace doors */}
    <rect x="10" y="15" width="80" height="85" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="3" />
    
    {/* Glass panels grid */}
    <rect x="15" y="20" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="36" y="20" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="57" y="20" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="78" y="20" width="7" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    <rect x="15" y="48" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="36" y="48" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="57" y="48" width="18" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="78" y="48" width="7" height="25" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    <rect x="15" y="76" width="18" height="19" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="36" y="76" width="18" height="19" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="57" y="76" width="18" height="19" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    <rect x="78" y="76" width="7" height="19" fill="url(#terrace-glass)" stroke="#8B7355" strokeWidth="1" rx="1" />
    
    {/* Door threshold */}
    <rect x="10" y="100" width="80" height="4" fill="#DAA520" rx="2" />
    
    {/* Reflections */}
    <rect x="18" y="23" width="3" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
    <rect x="60" y="23" width="3" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
  </svg>
);

export const ArchedWindowVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.9} 
    viewBox="0 0 100 90" 
    className={className}
  >
    <defs>
      <linearGradient id="arched-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,235,0.3)" />
        <stop offset="50%" stopColor="rgba(135,206,235,0.1)" />
        <stop offset="100%" stopColor="rgba(135,206,235,0.2)" />
      </linearGradient>
    </defs>
    
    {/* Arched top frame */}
    <path d="M 25 35 A 25 25 0 0 1 75 35 L 75 40 A 20 20 0 0 0 25 40 Z" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" />
    
    {/* Arched glass */}
    <path d="M 28 37 A 22 22 0 0 1 72 37 L 72 38 A 21 21 0 0 0 28 38 Z" fill="url(#arched-glass)" stroke="#8B7355" strokeWidth="1" />
    
    {/* Rectangular bottom frame */}
    <rect x="25" y="35" width="50" height="45" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" rx="0" />
    
    {/* Rectangular glass */}
    <rect x="28" y="38" width="44" height="39" fill="url(#arched-glass)" stroke="#8B7355" strokeWidth="1" />
    
    {/* Mullions */}
    <line x1="41.5" y1="38" x2="41.5" y2="77" stroke="#8B7355" strokeWidth="1.5" />
    <line x1="58.5" y1="38" x2="58.5" y2="77" stroke="#8B7355" strokeWidth="1.5" />
    <line x1="28" y1="57" x2="72" y2="57" stroke="#8B7355" strokeWidth="1.5" />
    
    {/* Arched mullions */}
    <path d="M 41.5 38 A 8.5 8.5 0 0 1 58.5 38" stroke="#8B7355" strokeWidth="1.5" fill="none" />
    
    {/* Reflections */}
    <rect x="32" y="42" width="4" height="10" fill="rgba(255,255,255,0.4)" rx="1" />
    <path d="M 45 37 A 5 5 0 0 1 55 37" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
  </svg>
);

export const SkylightVisual = ({ className = "", size = 100 }: WindowVisualProps) => (
  <svg 
    width={size} 
    height={size * 0.7} 
    viewBox="0 0 100 70" 
    className={className}
  >
    <defs>
      <linearGradient id="skylight-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(135,206,250,0.4)" />
        <stop offset="50%" stopColor="rgba(135,206,250,0.2)" />
        <stop offset="100%" stopColor="rgba(135,206,250,0.5)" />
      </linearGradient>
      <radialGradient id="light-rays" cx="50%" cy="20%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,0,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,0,0)" />
      </radialGradient>
    </defs>
    
    {/* Skylight frame (angled perspective) */}
    <polygon points="20,25 80,15 85,45 25,55" fill="#8B7355" stroke="#6B5B45" strokeWidth="2" />
    
    {/* Glass area */}
    <polygon points="23,27 77,17 82,43 28,53" fill="url(#skylight-glass)" stroke="#8B7355" strokeWidth="1" />
    
    {/* Cross mullions */}
    <line x1="50" y1="21" x2="53" y2="48" stroke="#8B7355" strokeWidth="2" />
    <line x1="32" y1="34" x2="70" y2="26" stroke="#8B7355" strokeWidth="2" />
    
    {/* Light rays effect */}
    <polygon points="45,10 55,10 58,25 47,30" fill="url(#light-rays)" />
    
    {/* Reflections */}
    <polygon points="28,29 38,27 39,35 29,37" fill="rgba(255,255,255,0.4)" />
    <polygon points="65,20 72,19 73,25 66,26" fill="rgba(255,255,255,0.3)" />
  </svg>
);

// Map of visual components by key
export const windowVisualMap = {
  'standard': StandardWindowVisual,
  'bay': BayWindowVisual,
  'french_doors': FrenchDoorsVisual,
  'sliding_doors': SlidingDoorsVisual,
  'large_window': LargeWindowVisual,
  'corner_window': CornerWindowVisual,
  'terrace_doors': TerraceDoorsVisual,
  'arched_window': ArchedWindowVisual,
  'skylight': SkylightVisual,
};

export const getWindowVisual = (visualKey: string) => {
  return windowVisualMap[visualKey as keyof typeof windowVisualMap] || StandardWindowVisual;
};