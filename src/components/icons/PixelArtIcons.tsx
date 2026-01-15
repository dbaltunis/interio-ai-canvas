import React from 'react';

interface PixelIconProps {
  className?: string;
  size?: number;
}

// Nokia 3310-inspired pixel art icon for Jobs/Projects (clipboard with checkmarks)
export const PixelClipboardIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Clipboard body */}
    <rect x="10" y="8" width="28" height="36" rx="2" className="fill-primary/20" />
    <rect x="12" y="10" width="24" height="32" className="fill-background" />
    
    {/* Clip at top */}
    <rect x="18" y="4" width="12" height="8" rx="1" className="fill-primary/60" />
    <rect x="20" y="6" width="8" height="4" className="fill-primary" />
    
    {/* Pixel checkmarks - task items */}
    <rect x="16" y="18" width="4" height="4" className="fill-emerald-400" />
    <rect x="20" y="22" width="2" height="2" className="fill-emerald-400" />
    <rect x="22" y="20" width="2" height="2" className="fill-emerald-400" />
    <rect x="26" y="18" width="8" height="2" className="fill-muted-foreground/60" />
    
    <rect x="16" y="26" width="4" height="4" className="fill-emerald-400" />
    <rect x="20" y="30" width="2" height="2" className="fill-emerald-400" />
    <rect x="22" y="28" width="2" height="2" className="fill-emerald-400" />
    <rect x="26" y="26" width="6" height="2" className="fill-muted-foreground/60" />
    
    {/* Pending task */}
    <rect x="16" y="34" width="4" height="4" className="fill-primary/40" stroke="currentColor" strokeWidth="1" />
    <rect x="26" y="34" width="8" height="2" className="fill-muted-foreground/40" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Clients/Users
export const PixelUserIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Head - pixelated circle */}
    <rect x="18" y="6" width="12" height="4" className="fill-primary/70" />
    <rect x="16" y="10" width="4" height="8" className="fill-primary/70" />
    <rect x="28" y="10" width="4" height="8" className="fill-primary/70" />
    <rect x="18" y="10" width="12" height="8" className="fill-primary" />
    <rect x="18" y="18" width="12" height="4" className="fill-primary/70" />
    
    {/* Eyes */}
    <rect x="19" y="12" width="3" height="3" className="fill-background" />
    <rect x="26" y="12" width="3" height="3" className="fill-background" />
    
    {/* Smile */}
    <rect x="21" y="16" width="6" height="2" className="fill-background" />
    
    {/* Body - shoulders */}
    <rect x="12" y="26" width="24" height="4" className="fill-primary/60" />
    <rect x="10" y="30" width="28" height="12" className="fill-primary/80" />
    
    {/* Star badge - indicates importance */}
    <rect x="22" y="32" width="4" height="4" className="fill-amber-400" />
    <rect x="24" y="30" width="2" height="2" className="fill-amber-400" />
    <rect x="24" y="36" width="2" height="2" className="fill-amber-400" />
    <rect x="20" y="34" width="2" height="2" className="fill-amber-400" />
    <rect x="26" y="34" width="2" height="2" className="fill-amber-400" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Messages/Email
export const PixelMessageIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Envelope body */}
    <rect x="6" y="12" width="36" height="24" rx="2" className="fill-primary/20" />
    <rect x="8" y="14" width="32" height="20" className="fill-background" />
    
    {/* Envelope flap - pixelated triangle */}
    <rect x="8" y="14" width="4" height="4" className="fill-primary/60" />
    <rect x="12" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="16" y="22" width="4" height="4" className="fill-primary/70" />
    <rect x="20" y="26" width="4" height="4" className="fill-primary/80" />
    <rect x="24" y="26" width="4" height="4" className="fill-primary/80" />
    <rect x="28" y="22" width="4" height="4" className="fill-primary/70" />
    <rect x="32" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="36" y="14" width="4" height="4" className="fill-primary/60" />
    
    {/* Center heart/star for friendly feel */}
    <rect x="22" y="18" width="4" height="4" className="fill-amber-400" />
    <rect x="20" y="20" width="2" height="2" className="fill-amber-400" />
    <rect x="26" y="20" width="2" height="2" className="fill-amber-400" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Fabrics
export const PixelFabricIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Fabric roll - cylinder side view */}
    <rect x="8" y="10" width="8" height="28" className="fill-primary/40" />
    <rect x="10" y="8" width="4" height="32" className="fill-primary/60" />
    
    {/* Unrolled fabric flowing */}
    <rect x="16" y="14" width="24" height="4" className="fill-primary/30" />
    <rect x="16" y="18" width="24" height="4" className="fill-primary/50" />
    <rect x="16" y="22" width="24" height="4" className="fill-primary/40" />
    <rect x="16" y="26" width="24" height="4" className="fill-primary/60" />
    <rect x="16" y="30" width="20" height="4" className="fill-primary/50" />
    <rect x="16" y="34" width="16" height="4" className="fill-primary/40" />
    
    {/* Fabric pattern - decorative elements */}
    <rect x="20" y="16" width="2" height="2" className="fill-amber-400" />
    <rect x="28" y="16" width="2" height="2" className="fill-amber-400" />
    <rect x="24" y="24" width="2" height="2" className="fill-amber-400" />
    <rect x="32" y="24" width="2" height="2" className="fill-amber-400" />
    <rect x="20" y="32" width="2" height="2" className="fill-amber-400" />
    <rect x="28" y="32" width="2" height="2" className="fill-amber-400" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Hardware (curtain track)
export const PixelHardwareIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Track bar */}
    <rect x="4" y="12" width="40" height="6" className="fill-primary/70" />
    <rect x="6" y="14" width="36" height="2" className="fill-primary" />
    
    {/* Mounting brackets */}
    <rect x="8" y="8" width="4" height="4" className="fill-muted-foreground" />
    <rect x="22" y="8" width="4" height="4" className="fill-muted-foreground" />
    <rect x="36" y="8" width="4" height="4" className="fill-muted-foreground" />
    
    {/* Gliders/hooks */}
    <rect x="10" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="11" y="22" width="2" height="4" className="fill-primary/40" />
    
    <rect x="18" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="19" y="22" width="2" height="4" className="fill-primary/40" />
    
    <rect x="26" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="27" y="22" width="2" height="4" className="fill-primary/40" />
    
    <rect x="34" y="18" width="4" height="4" className="fill-primary/60" />
    <rect x="35" y="22" width="2" height="4" className="fill-primary/40" />
    
    {/* Curtain fabric hanging */}
    <rect x="10" y="28" width="6" height="12" className="fill-primary/20" />
    <rect x="18" y="28" width="6" height="14" className="fill-primary/30" />
    <rect x="26" y="28" width="6" height="12" className="fill-primary/20" />
    <rect x="34" y="28" width="6" height="14" className="fill-primary/30" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Materials (blinds/slats)
export const PixelMaterialIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Header rail */}
    <rect x="6" y="6" width="36" height="4" className="fill-primary/80" />
    
    {/* Slats */}
    <rect x="8" y="12" width="32" height="4" className="fill-primary/60" />
    <rect x="8" y="18" width="32" height="4" className="fill-primary/50" />
    <rect x="8" y="24" width="32" height="4" className="fill-primary/60" />
    <rect x="8" y="30" width="32" height="4" className="fill-primary/50" />
    <rect x="8" y="36" width="32" height="4" className="fill-primary/60" />
    
    {/* Pull cord */}
    <rect x="38" y="10" width="2" height="32" className="fill-amber-400/80" />
    <rect x="36" y="40" width="6" height="4" rx="1" className="fill-amber-400" />
    
    {/* Light rays through slats */}
    <rect x="12" y="14" width="4" height="2" className="fill-amber-300/60" />
    <rect x="20" y="26" width="4" height="2" className="fill-amber-300/60" />
    <rect x="28" y="38" width="4" height="2" className="fill-amber-300/60" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Wallcoverings
export const PixelWallpaperIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Wallpaper roll */}
    <rect x="28" y="4" width="12" height="40" rx="2" className="fill-primary/60" />
    <rect x="30" y="6" width="8" height="36" className="fill-primary/40" />
    <rect x="33" y="6" width="2" height="36" className="fill-primary/20" />
    
    {/* Unrolling section with pattern */}
    <rect x="8" y="8" width="20" height="32" className="fill-primary/30" />
    <rect x="10" y="10" width="16" height="28" className="fill-background" />
    
    {/* Decorative pattern - flowers/diamonds */}
    <rect x="14" y="14" width="4" height="4" className="fill-primary/60" />
    <rect x="16" y="12" width="2" height="2" className="fill-primary/40" />
    <rect x="16" y="18" width="2" height="2" className="fill-primary/40" />
    <rect x="12" y="16" width="2" height="2" className="fill-primary/40" />
    <rect x="18" y="16" width="2" height="2" className="fill-primary/40" />
    
    <rect x="14" y="26" width="4" height="4" className="fill-primary/60" />
    <rect x="16" y="24" width="2" height="2" className="fill-primary/40" />
    <rect x="16" y="30" width="2" height="2" className="fill-primary/40" />
    <rect x="12" y="28" width="2" height="2" className="fill-primary/40" />
    <rect x="18" y="28" width="2" height="2" className="fill-primary/40" />
    
    {/* Accent colors */}
    <rect x="16" y="16" width="2" height="2" className="fill-amber-400" />
    <rect x="16" y="28" width="2" height="2" className="fill-amber-400" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Home/Rooms
export const PixelHomeIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Roof */}
    <rect x="22" y="6" width="4" height="4" className="fill-primary" />
    <rect x="18" y="10" width="12" height="4" className="fill-primary/90" />
    <rect x="14" y="14" width="20" height="4" className="fill-primary/80" />
    <rect x="10" y="18" width="28" height="4" className="fill-primary/70" />
    
    {/* House body */}
    <rect x="12" y="22" width="24" height="18" className="fill-primary/40" />
    <rect x="14" y="24" width="20" height="14" className="fill-background" />
    
    {/* Door */}
    <rect x="20" y="30" width="8" height="10" className="fill-primary/60" />
    <rect x="26" y="34" width="2" height="2" className="fill-amber-400" />
    
    {/* Windows */}
    <rect x="16" y="26" width="4" height="4" className="fill-primary/30" />
    <rect x="28" y="26" width="4" height="4" className="fill-primary/30" />
    
    {/* Chimney */}
    <rect x="30" y="8" width="4" height="10" className="fill-muted-foreground" />
    <rect x="31" y="6" width="2" height="2" className="fill-amber-400/60" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Documents/Quotes
export const PixelDocumentIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Document body */}
    <rect x="10" y="6" width="24" height="36" className="fill-primary/20" />
    <rect x="12" y="8" width="20" height="32" className="fill-background" />
    
    {/* Folded corner */}
    <rect x="28" y="6" width="6" height="6" className="fill-primary/40" />
    <rect x="28" y="6" width="4" height="4" className="fill-primary/60" />
    
    {/* Text lines */}
    <rect x="14" y="16" width="12" height="2" className="fill-muted-foreground/60" />
    <rect x="14" y="22" width="16" height="2" className="fill-muted-foreground/60" />
    <rect x="14" y="28" width="14" height="2" className="fill-muted-foreground/60" />
    <rect x="14" y="34" width="10" height="2" className="fill-muted-foreground/60" />
    
    {/* Dollar sign for quotes */}
    <rect x="24" y="12" width="2" height="2" className="fill-emerald-400" />
    <rect x="22" y="14" width="6" height="2" className="fill-emerald-400" />
    <rect x="22" y="14" width="2" height="2" className="fill-emerald-400" />
    <rect x="22" y="16" width="6" height="2" className="fill-emerald-400" />
    <rect x="26" y="18" width="2" height="2" className="fill-emerald-400" />
    <rect x="22" y="18" width="6" height="2" className="fill-emerald-400" />
    <rect x="24" y="20" width="2" height="2" className="fill-emerald-400" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for Calendar/Events
export const PixelCalendarIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Calendar body */}
    <rect x="8" y="10" width="32" height="32" rx="2" className="fill-primary/20" />
    <rect x="10" y="18" width="28" height="22" className="fill-background" />
    
    {/* Header */}
    <rect x="8" y="10" width="32" height="8" className="fill-primary/70" />
    
    {/* Binding rings */}
    <rect x="14" y="6" width="4" height="8" rx="1" className="fill-muted-foreground" />
    <rect x="30" y="6" width="4" height="8" rx="1" className="fill-muted-foreground" />
    
    {/* Date grid */}
    <rect x="12" y="22" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="18" y="22" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="24" y="22" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="30" y="22" width="4" height="4" className="fill-muted-foreground/30" />
    
    <rect x="12" y="28" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="18" y="28" width="4" height="4" className="fill-primary/60" />
    <rect x="24" y="28" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="30" y="28" width="4" height="4" className="fill-muted-foreground/30" />
    
    <rect x="12" y="34" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="18" y="34" width="4" height="4" className="fill-muted-foreground/30" />
    <rect x="24" y="34" width="4" height="4" className="fill-amber-400/60" />
    <rect x="30" y="34" width="4" height="4" className="fill-muted-foreground/30" />
    
    {/* Highlight on selected date */}
    <rect x="19" y="29" width="2" height="2" className="fill-primary" />
  </svg>
);

// Nokia 3310-inspired pixel art icon for File Not Found / Error
export const PixelFileNotFoundIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Document body */}
    <rect x="10" y="6" width="24" height="36" className="fill-muted-foreground/20" />
    <rect x="12" y="8" width="20" height="32" className="fill-background" />
    
    {/* Folded corner */}
    <rect x="28" y="6" width="6" height="6" className="fill-muted-foreground/40" />
    
    {/* X mark */}
    <rect x="18" y="18" width="4" height="4" className="fill-destructive/80" />
    <rect x="22" y="22" width="4" height="4" className="fill-destructive" />
    <rect x="26" y="26" width="4" height="4" className="fill-destructive/80" />
    
    <rect x="26" y="18" width="4" height="4" className="fill-destructive/80" />
    <rect x="22" y="22" width="4" height="4" className="fill-destructive" />
    <rect x="18" y="26" width="4" height="4" className="fill-destructive/80" />
    
    {/* Question mark below */}
    <rect x="22" y="32" width="4" height="2" className="fill-muted-foreground/60" />
    <rect x="24" y="34" width="2" height="2" className="fill-muted-foreground/60" />
    <rect x="24" y="38" width="2" height="2" className="fill-muted-foreground/60" />
  </svg>
);
