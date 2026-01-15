/**
 * Industry-Specific Icons for Window Treatments
 * ==============================================
 * Custom SVG icons for hardware (tracks, rods) and manufacturing (sewing)
 * These replace generic icons with industry-appropriate visuals.
 */

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

/**
 * Curtain Track Icon - horizontal bar with mounting brackets
 */
export const CurtainTrackIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Track bar */}
    <line x1="3" y1="8" x2="21" y2="8" />
    {/* Mounting brackets */}
    <path d="M5 5 L5 11" />
    <path d="M12 5 L12 11" />
    <path d="M19 5 L19 11" />
    {/* Gliders/rings hanging */}
    <circle cx="7" cy="12" r="1" />
    <circle cx="11" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    {/* Curtain fabric hint */}
    <path d="M7 13 L7 19" />
    <path d="M11 13 L11 19" />
    <path d="M15 13 L15 19" />
  </svg>
);

/**
 * Curtain Rod/Pole Icon - decorative pole with finials
 */
export const CurtainRodIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Main rod */}
    <line x1="4" y1="8" x2="20" y2="8" />
    {/* Left finial */}
    <circle cx="3" cy="8" r="2" />
    {/* Right finial */}
    <circle cx="21" cy="8" r="2" />
    {/* Rings on rod */}
    <circle cx="8" cy="8" r="1.5" fill="none" />
    <circle cx="12" cy="8" r="1.5" fill="none" />
    <circle cx="16" cy="8" r="1.5" fill="none" />
    {/* Bracket */}
    <path d="M12 4 L12 6" />
  </svg>
);

/**
 * Generic Hardware Icon - for mixed hardware types
 */
export const HardwareIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Track/bar */}
    <line x1="3" y1="7" x2="21" y2="7" />
    {/* Brackets */}
    <path d="M6 4 L6 10" />
    <path d="M18 4 L18 10" />
    {/* Control mechanism */}
    <rect x="10" y="10" width="4" height="6" rx="1" />
    <line x1="12" y1="16" x2="12" y2="20" />
  </svg>
);

/**
 * Sewing/Manufacturing Icon - needle with thread
 */
export const SewingIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Needle */}
    <path d="M12 3 L12 15" />
    <path d="M10 3 L14 3" />
    {/* Needle eye */}
    <circle cx="12" cy="5" r="1" />
    {/* Needle point */}
    <path d="M11 14 L12 17 L13 14" />
    {/* Thread */}
    <path d="M12 5 Q16 8 14 12 Q12 15 16 18 Q18 20 20 19" />
  </svg>
);

/**
 * Sewing Machine Icon - simplified machine silhouette
 */
export const SewingMachineIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Machine body */}
    <rect x="4" y="10" width="16" height="8" rx="2" />
    {/* Machine arm */}
    <path d="M8 10 L8 6 L16 6 L16 10" />
    {/* Needle */}
    <line x1="14" y1="10" x2="14" y2="14" />
    {/* Wheel */}
    <circle cx="18" cy="14" r="2" />
    {/* Thread spool */}
    <rect x="10" y="4" width="2" height="3" rx="0.5" />
    {/* Fabric under needle */}
    <line x1="6" y1="14" x2="12" y2="14" />
  </svg>
);

/**
 * Thread Spool Icon - for fabric/material work
 */
export const ThreadSpoolIcon = ({ className }: IconProps) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Spool body */}
    <ellipse cx="12" cy="6" rx="6" ry="2" />
    <ellipse cx="12" cy="18" rx="6" ry="2" />
    <line x1="6" y1="6" x2="6" y2="18" />
    <line x1="18" y1="6" x2="18" y2="18" />
    {/* Thread wraps */}
    <ellipse cx="12" cy="10" rx="5" ry="1.5" />
    <ellipse cx="12" cy="14" rx="5" ry="1.5" />
  </svg>
);

/**
 * Helper to get appropriate hardware icon based on type
 */
export const getHardwareIcon = (groupName?: string): React.FC<IconProps> => {
  const name = (groupName || '').toLowerCase();
  
  if (name.includes('track')) return CurtainTrackIcon;
  if (name.includes('rod') || name.includes('pole')) return CurtainRodIcon;
  
  // Default to generic hardware icon
  return HardwareIcon;
};

/**
 * Helper to get appropriate manufacturing icon
 */
export const getManufacturingIcon = (type?: string): React.FC<IconProps> => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('machine')) return SewingMachineIcon;
  
  // Default to sewing needle icon
  return SewingIcon;
};
