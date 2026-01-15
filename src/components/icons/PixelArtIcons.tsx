import React from 'react';

interface PixelIconProps {
  className?: string;
  size?: number;
}

// Elegant Interior Design themed pixel art icons
// Using refined shapes with primary/accent color palette

// Jobs/Projects - Elegant clipboard with design elements
export const PixelClipboardIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Clipboard base */}
    <rect x="12" y="8" width="24" height="34" rx="2" className="fill-primary/15" />
    <rect x="14" y="12" width="20" height="28" className="fill-background" />
    
    {/* Elegant clip */}
    <rect x="18" y="4" width="12" height="10" rx="2" className="fill-primary/30" />
    <rect x="20" y="6" width="8" height="6" rx="1" className="fill-primary" />
    
    {/* Window treatment sketch lines */}
    <rect x="16" y="18" width="16" height="2" className="fill-primary/60" />
    <rect x="16" y="22" width="12" height="1" className="fill-muted-foreground/40" />
    <rect x="16" y="25" width="14" height="1" className="fill-muted-foreground/40" />
    
    {/* Curtain sketch element */}
    <rect x="16" y="30" width="4" height="8" className="fill-primary/20" />
    <rect x="21" y="30" width="4" height="8" className="fill-primary/30" />
    <rect x="26" y="30" width="4" height="8" className="fill-primary/20" />
    
    {/* Checkmark accent */}
    <rect x="28" y="18" width="2" height="2" className="fill-emerald-500" />
    <rect x="30" y="16" width="2" height="2" className="fill-emerald-500" />
  </svg>
);

// Clients/Users - Elegant person silhouette
export const PixelUserIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background glow */}
    <rect x="14" y="6" width="20" height="20" rx="10" className="fill-primary/10" />
    
    {/* Head - refined circle */}
    <rect x="18" y="8" width="12" height="4" className="fill-primary/50" />
    <rect x="16" y="12" width="16" height="8" className="fill-primary/70" />
    <rect x="18" y="20" width="12" height="4" className="fill-primary/50" />
    
    {/* Shoulders - elegant curve */}
    <rect x="10" y="28" width="28" height="4" className="fill-primary/40" />
    <rect x="8" y="32" width="32" height="10" className="fill-primary/60" />
    
    {/* Interior design element - measuring tape accent */}
    <rect x="30" y="34" width="6" height="2" className="fill-amber-400/80" />
    <rect x="32" y="36" width="4" height="4" className="fill-amber-400" />
  </svg>
);

// Messages/Email - Elegant envelope
export const PixelMessageIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Envelope body */}
    <rect x="6" y="14" width="36" height="22" rx="2" className="fill-primary/20" />
    <rect x="8" y="18" width="32" height="16" className="fill-background" />
    
    {/* Elegant flap with gradient effect */}
    <rect x="8" y="14" width="4" height="4" className="fill-primary/40" />
    <rect x="12" y="18" width="4" height="4" className="fill-primary/50" />
    <rect x="16" y="22" width="4" height="4" className="fill-primary/60" />
    <rect x="20" y="26" width="8" height="4" className="fill-primary/70" />
    <rect x="28" y="22" width="4" height="4" className="fill-primary/60" />
    <rect x="32" y="18" width="4" height="4" className="fill-primary/50" />
    <rect x="36" y="14" width="4" height="4" className="fill-primary/40" />
    
    {/* Text lines */}
    <rect x="12" y="28" width="10" height="1" className="fill-muted-foreground/30" />
    <rect x="12" y="30" width="8" height="1" className="fill-muted-foreground/30" />
  </svg>
);

// Fabrics - Elegant fabric roll with drape
export const PixelFabricIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Fabric roll core */}
    <rect x="6" y="10" width="6" height="28" className="fill-primary/30" />
    <rect x="8" y="8" width="4" height="32" className="fill-primary/50" />
    <rect x="10" y="10" width="2" height="28" className="fill-primary/70" />
    
    {/* Flowing fabric with elegant drape */}
    <rect x="12" y="12" width="28" height="3" className="fill-primary/25" />
    <rect x="12" y="15" width="26" height="3" className="fill-primary/35" />
    <rect x="12" y="18" width="24" height="3" className="fill-primary/25" />
    <rect x="12" y="21" width="22" height="3" className="fill-primary/40" />
    <rect x="12" y="24" width="20" height="3" className="fill-primary/30" />
    <rect x="12" y="27" width="18" height="3" className="fill-primary/45" />
    <rect x="12" y="30" width="16" height="3" className="fill-primary/35" />
    <rect x="12" y="33" width="14" height="3" className="fill-primary/25" />
    
    {/* Pattern accents */}
    <rect x="18" y="14" width="2" height="2" className="fill-amber-400/60" />
    <rect x="26" y="20" width="2" height="2" className="fill-amber-400/60" />
    <rect x="20" y="28" width="2" height="2" className="fill-amber-400/60" />
  </svg>
);

// Hardware - Elegant curtain track with finials
export const PixelHardwareIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Track rail */}
    <rect x="4" y="14" width="40" height="4" className="fill-primary/60" />
    <rect x="6" y="16" width="36" height="2" className="fill-primary" />
    
    {/* Decorative finials */}
    <rect x="4" y="12" width="4" height="8" className="fill-primary/80" />
    <rect x="40" y="12" width="4" height="8" className="fill-primary/80" />
    
    {/* Elegant brackets */}
    <rect x="14" y="10" width="2" height="4" className="fill-muted-foreground/60" />
    <rect x="24" y="10" width="2" height="4" className="fill-muted-foreground/60" />
    <rect x="34" y="10" width="2" height="4" className="fill-muted-foreground/60" />
    
    {/* Curtain rings */}
    <rect x="10" y="18" width="3" height="3" className="fill-primary/50" />
    <rect x="18" y="18" width="3" height="3" className="fill-primary/50" />
    <rect x="26" y="18" width="3" height="3" className="fill-primary/50" />
    <rect x="34" y="18" width="3" height="3" className="fill-primary/50" />
    
    {/* Hanging curtain suggestion */}
    <rect x="10" y="22" width="5" height="18" className="fill-primary/15" />
    <rect x="17" y="22" width="5" height="20" className="fill-primary/20" />
    <rect x="24" y="22" width="5" height="18" className="fill-primary/15" />
    <rect x="31" y="22" width="7" height="20" className="fill-primary/20" />
  </svg>
);

// Materials - Elegant blinds/slats
export const PixelMaterialIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Header box */}
    <rect x="8" y="6" width="32" height="6" rx="1" className="fill-primary/70" />
    
    {/* Elegant slats with depth */}
    <rect x="10" y="14" width="28" height="3" className="fill-primary/50" />
    <rect x="10" y="19" width="28" height="3" className="fill-primary/40" />
    <rect x="10" y="24" width="28" height="3" className="fill-primary/50" />
    <rect x="10" y="29" width="28" height="3" className="fill-primary/40" />
    <rect x="10" y="34" width="28" height="3" className="fill-primary/50" />
    <rect x="10" y="39" width="28" height="3" className="fill-primary/40" />
    
    {/* Control cord */}
    <rect x="36" y="12" width="2" height="28" className="fill-amber-400/60" />
    <rect x="34" y="40" width="6" height="4" rx="1" className="fill-amber-400" />
    
    {/* Light rays */}
    <rect x="14" y="16" width="6" height="1" className="fill-amber-300/40" />
    <rect x="18" y="26" width="6" height="1" className="fill-amber-300/40" />
    <rect x="16" y="36" width="6" height="1" className="fill-amber-300/40" />
  </svg>
);

// Wallcoverings - Elegant wallpaper roll
export const PixelWallpaperIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Roll cylinder */}
    <rect x="30" y="4" width="10" height="40" rx="2" className="fill-primary/50" />
    <rect x="32" y="6" width="6" height="36" className="fill-primary/30" />
    <rect x="34" y="8" width="2" height="32" className="fill-primary/15" />
    
    {/* Unrolled wallpaper with pattern */}
    <rect x="8" y="8" width="22" height="32" rx="1" className="fill-primary/25" />
    <rect x="10" y="10" width="18" height="28" className="fill-background" />
    
    {/* Elegant damask pattern */}
    <rect x="16" y="14" width="6" height="6" className="fill-primary/30" />
    <rect x="18" y="12" width="2" height="2" className="fill-primary/20" />
    <rect x="18" y="20" width="2" height="2" className="fill-primary/20" />
    <rect x="14" y="16" width="2" height="2" className="fill-primary/20" />
    <rect x="22" y="16" width="2" height="2" className="fill-primary/20" />
    
    <rect x="16" y="26" width="6" height="6" className="fill-primary/30" />
    <rect x="18" y="24" width="2" height="2" className="fill-primary/20" />
    <rect x="18" y="32" width="2" height="2" className="fill-primary/20" />
    <rect x="14" y="28" width="2" height="2" className="fill-primary/20" />
    <rect x="22" y="28" width="2" height="2" className="fill-primary/20" />
  </svg>
);

// Home/Rooms - Elegant house with interior view
export const PixelHomeIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Roof - elegant pitched */}
    <rect x="22" y="4" width="4" height="4" className="fill-primary/80" />
    <rect x="18" y="8" width="12" height="4" className="fill-primary/70" />
    <rect x="14" y="12" width="20" height="4" className="fill-primary/60" />
    <rect x="10" y="16" width="28" height="4" className="fill-primary/50" />
    
    {/* House body */}
    <rect x="12" y="20" width="24" height="22" className="fill-primary/30" />
    <rect x="14" y="22" width="20" height="18" className="fill-background" />
    
    {/* Elegant window */}
    <rect x="16" y="24" width="8" height="8" className="fill-primary/20" />
    <rect x="19" y="24" width="2" height="8" className="fill-primary/40" />
    <rect x="16" y="27" width="8" height="2" className="fill-primary/40" />
    
    {/* Door */}
    <rect x="26" y="28" width="6" height="12" className="fill-primary/50" />
    <rect x="30" y="33" width="1" height="2" className="fill-amber-400" />
  </svg>
);

// Documents/Quotes - Elegant document with pricing
export const PixelDocumentIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Document base */}
    <rect x="10" y="4" width="24" height="38" rx="2" className="fill-primary/20" />
    <rect x="12" y="6" width="20" height="34" className="fill-background" />
    
    {/* Folded corner */}
    <rect x="28" y="4" width="6" height="6" className="fill-primary/30" />
    <rect x="28" y="4" width="4" height="4" className="fill-primary/50" />
    
    {/* Header line */}
    <rect x="14" y="14" width="12" height="2" className="fill-primary/60" />
    
    {/* Content lines */}
    <rect x="14" y="20" width="16" height="1" className="fill-muted-foreground/40" />
    <rect x="14" y="24" width="14" height="1" className="fill-muted-foreground/40" />
    <rect x="14" y="28" width="16" height="1" className="fill-muted-foreground/40" />
    
    {/* Price element */}
    <rect x="14" y="34" width="8" height="4" className="fill-emerald-500/20" />
    <rect x="15" y="35" width="6" height="2" className="fill-emerald-500" />
  </svg>
);

// Calendar/Events - Elegant calendar
export const PixelCalendarIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Calendar body */}
    <rect x="8" y="10" width="32" height="32" rx="2" className="fill-primary/20" />
    <rect x="10" y="18" width="28" height="22" className="fill-background" />
    
    {/* Header */}
    <rect x="8" y="10" width="32" height="8" className="fill-primary/60" />
    
    {/* Binding rings */}
    <rect x="14" y="6" width="4" height="8" rx="1" className="fill-primary/80" />
    <rect x="30" y="6" width="4" height="8" rx="1" className="fill-primary/80" />
    
    {/* Date grid */}
    <rect x="12" y="22" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="18" y="22" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="24" y="22" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="30" y="22" width="4" height="4" className="fill-muted-foreground/20" />
    
    <rect x="12" y="28" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="18" y="28" width="4" height="4" className="fill-primary/50" />
    <rect x="24" y="28" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="30" y="28" width="4" height="4" className="fill-muted-foreground/20" />
    
    <rect x="12" y="34" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="18" y="34" width="4" height="4" className="fill-muted-foreground/20" />
    <rect x="24" y="34" width="4" height="4" className="fill-amber-400/60" />
    <rect x="30" y="34" width="4" height="4" className="fill-muted-foreground/20" />
  </svg>
);

// File Not Found - Elegant error state
export const PixelFileNotFoundIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Document base */}
    <rect x="10" y="4" width="24" height="38" rx="2" className="fill-muted-foreground/15" />
    <rect x="12" y="6" width="20" height="34" className="fill-background" />
    
    {/* X mark */}
    <rect x="18" y="16" width="3" height="3" className="fill-destructive/60" />
    <rect x="21" y="19" width="3" height="3" className="fill-destructive/80" />
    <rect x="24" y="22" width="3" height="3" className="fill-destructive/60" />
    
    <rect x="24" y="16" width="3" height="3" className="fill-destructive/60" />
    <rect x="21" y="19" width="3" height="3" className="fill-destructive/80" />
    <rect x="18" y="22" width="3" height="3" className="fill-destructive/60" />
    
    {/* Question mark */}
    <rect x="21" y="30" width="3" height="2" className="fill-muted-foreground/40" />
    <rect x="22" y="34" width="2" height="2" className="fill-muted-foreground/40" />
  </svg>
);

// Team/People - Multiple elegant figures
export const PixelTeamIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Center person (front) */}
    <rect x="20" y="16" width="8" height="3" className="fill-primary/60" />
    <rect x="18" y="19" width="12" height="6" className="fill-primary/70" />
    <rect x="20" y="25" width="8" height="2" className="fill-primary/50" />
    <rect x="14" y="30" width="20" height="12" className="fill-primary/60" />
    
    {/* Left person (back) */}
    <rect x="6" y="12" width="6" height="2" className="fill-primary/30" />
    <rect x="4" y="14" width="10" height="5" className="fill-primary/40" />
    <rect x="2" y="22" width="14" height="10" className="fill-primary/30" />
    
    {/* Right person (back) */}
    <rect x="36" y="12" width="6" height="2" className="fill-primary/30" />
    <rect x="34" y="14" width="10" height="5" className="fill-primary/40" />
    <rect x="32" y="22" width="14" height="10" className="fill-primary/30" />
    
    {/* Connection lines */}
    <rect x="14" y="26" width="4" height="2" className="fill-amber-400/40" />
    <rect x="30" y="26" width="4" height="2" className="fill-amber-400/40" />
  </svg>
);

// Bell/Appointments - Elegant notification bell
export const PixelBellIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bell top */}
    <rect x="22" y="4" width="4" height="4" className="fill-primary/80" />
    
    {/* Bell body */}
    <rect x="18" y="8" width="12" height="4" className="fill-primary/50" />
    <rect x="14" y="12" width="20" height="6" className="fill-primary/60" />
    <rect x="12" y="18" width="24" height="8" className="fill-primary/70" />
    <rect x="10" y="26" width="28" height="4" className="fill-primary/60" />
    
    {/* Bell rim */}
    <rect x="8" y="30" width="32" height="4" className="fill-primary/80" />
    
    {/* Clapper */}
    <rect x="22" y="34" width="4" height="4" className="fill-primary/90" />
    <rect x="21" y="38" width="6" height="3" rx="1" className="fill-primary" />
  </svg>
);

// Chart/Analytics - Elegant bar chart
export const PixelChartIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Base line */}
    <rect x="8" y="38" width="32" height="2" className="fill-muted-foreground/40" />
    
    {/* Bars with gradient effect */}
    <rect x="10" y="26" width="6" height="12" className="fill-primary/40" />
    <rect x="10" y="30" width="6" height="8" className="fill-primary/60" />
    
    <rect x="18" y="18" width="6" height="20" className="fill-primary/50" />
    <rect x="18" y="24" width="6" height="14" className="fill-primary/70" />
    
    <rect x="26" y="12" width="6" height="26" className="fill-primary/60" />
    <rect x="26" y="20" width="6" height="18" className="fill-primary/80" />
    
    <rect x="34" y="8" width="6" height="30" className="fill-primary/70" />
    <rect x="34" y="16" width="6" height="22" className="fill-primary" />
    
    {/* Trend line */}
    <rect x="12" y="24" width="2" height="2" className="fill-emerald-500" />
    <rect x="20" y="16" width="2" height="2" className="fill-emerald-500" />
    <rect x="28" y="10" width="2" height="2" className="fill-emerald-500" />
    <rect x="36" y="6" width="2" height="2" className="fill-emerald-500" />
  </svg>
);

// Briefcase/Jobs - Elegant briefcase
export const PixelBriefcaseIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Handle */}
    <rect x="18" y="6" width="12" height="4" className="fill-primary/50" />
    <rect x="20" y="4" width="8" height="6" className="fill-background" />
    <rect x="20" y="4" width="2" height="6" className="fill-primary/50" />
    <rect x="26" y="4" width="2" height="6" className="fill-primary/50" />
    
    {/* Briefcase body */}
    <rect x="6" y="14" width="36" height="26" rx="2" className="fill-primary/50" />
    <rect x="8" y="16" width="32" height="22" className="fill-primary/30" />
    
    {/* Center clasp */}
    <rect x="20" y="24" width="8" height="6" className="fill-primary/70" />
    <rect x="22" y="26" width="4" height="2" className="fill-amber-400" />
    
    {/* Strap detail */}
    <rect x="6" y="26" width="36" height="2" className="fill-primary/60" />
  </svg>
);

// Coins/Revenue - Elegant stacked coins
export const PixelCoinsIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bottom coin */}
    <rect x="8" y="32" width="20" height="4" className="fill-amber-400/40" />
    <rect x="10" y="30" width="16" height="2" className="fill-amber-400/60" />
    <rect x="10" y="36" width="16" height="2" className="fill-amber-400/30" />
    
    {/* Middle coin */}
    <rect x="14" y="22" width="20" height="4" className="fill-amber-400/60" />
    <rect x="16" y="20" width="16" height="2" className="fill-amber-400/80" />
    <rect x="16" y="26" width="16" height="2" className="fill-amber-400/40" />
    
    {/* Top coin */}
    <rect x="20" y="12" width="20" height="4" className="fill-amber-400/80" />
    <rect x="22" y="10" width="16" height="2" className="fill-amber-400" />
    <rect x="22" y="16" width="16" height="2" className="fill-amber-400/60" />
    
    {/* Dollar sign on top coin */}
    <rect x="28" y="11" width="4" height="1" className="fill-amber-600" />
    <rect x="29" y="12" width="2" height="3" className="fill-amber-600" />
    <rect x="28" y="15" width="4" height="1" className="fill-amber-600" />
  </svg>
);

// Pie Chart - Elegant pie chart for revenue distribution
export const PixelPieChartIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pie background */}
    <rect x="10" y="8" width="28" height="4" className="fill-primary/30" />
    <rect x="6" y="12" width="36" height="4" className="fill-primary/40" />
    <rect x="4" y="16" width="40" height="16" className="fill-primary/50" />
    <rect x="6" y="32" width="36" height="4" className="fill-primary/40" />
    <rect x="10" y="36" width="28" height="4" className="fill-primary/30" />
    
    {/* Pie slice 1 */}
    <rect x="24" y="8" width="14" height="4" className="fill-emerald-500/60" />
    <rect x="24" y="12" width="18" height="4" className="fill-emerald-500/70" />
    <rect x="24" y="16" width="20" height="8" className="fill-emerald-500/80" />
    
    {/* Pie slice 2 */}
    <rect x="4" y="24" width="20" height="8" className="fill-amber-400/70" />
    <rect x="6" y="32" width="18" height="4" className="fill-amber-400/60" />
    <rect x="10" y="36" width="14" height="4" className="fill-amber-400/50" />
    
    {/* Center highlight */}
    <rect x="20" y="20" width="8" height="8" className="fill-background" />
    <rect x="22" y="22" width="4" height="4" className="fill-primary/20" />
  </svg>
);

// Ruler/Measurements - Interior design measuring
export const PixelRulerIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ruler body */}
    <rect x="4" y="18" width="40" height="12" className="fill-primary/40" />
    <rect x="6" y="20" width="36" height="8" className="fill-primary/60" />
    
    {/* Measurement marks */}
    <rect x="10" y="20" width="2" height="4" className="fill-background" />
    <rect x="16" y="20" width="2" height="6" className="fill-background" />
    <rect x="22" y="20" width="2" height="4" className="fill-background" />
    <rect x="28" y="20" width="2" height="6" className="fill-background" />
    <rect x="34" y="20" width="2" height="4" className="fill-background" />
    
    {/* Numbers */}
    <rect x="14" y="24" width="4" height="2" className="fill-amber-400/80" />
    <rect x="26" y="24" width="4" height="2" className="fill-amber-400/80" />
  </svg>
);

// Window - Interior design window element
export const PixelWindowIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Window frame */}
    <rect x="8" y="6" width="32" height="36" className="fill-primary/40" />
    <rect x="10" y="8" width="28" height="32" className="fill-background" />
    
    {/* Cross bars */}
    <rect x="22" y="8" width="4" height="32" className="fill-primary/50" />
    <rect x="10" y="22" width="28" height="4" className="fill-primary/50" />
    
    {/* Glass panes */}
    <rect x="10" y="8" width="12" height="14" className="fill-primary/10" />
    <rect x="26" y="8" width="12" height="14" className="fill-primary/15" />
    <rect x="10" y="26" width="12" height="14" className="fill-primary/15" />
    <rect x="26" y="26" width="12" height="14" className="fill-primary/10" />
    
    {/* Light reflection */}
    <rect x="12" y="10" width="4" height="4" className="fill-amber-300/30" />
    <rect x="28" y="28" width="4" height="4" className="fill-amber-300/30" />
  </svg>
);

// Swatch/Color - Interior design color palette
export const PixelSwatchIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Swatch cards stacked */}
    <rect x="6" y="8" width="16" height="32" rx="2" className="fill-primary/60" />
    <rect x="8" y="10" width="12" height="28" className="fill-primary/80" />
    
    <rect x="16" y="12" width="16" height="28" rx="2" className="fill-primary/40" />
    <rect x="18" y="14" width="12" height="24" className="fill-primary/60" />
    
    <rect x="26" y="16" width="16" height="24" rx="2" className="fill-amber-400/60" />
    <rect x="28" y="18" width="12" height="20" className="fill-amber-400/80" />
    
    {/* Ring hole */}
    <rect x="12" y="6" width="4" height="4" rx="2" className="fill-muted-foreground/60" />
    <rect x="22" y="10" width="4" height="4" rx="2" className="fill-muted-foreground/60" />
    <rect x="32" y="14" width="4" height="4" rx="2" className="fill-muted-foreground/60" />
  </svg>
);

// Settings/Cog - Configuration icon
export const PixelSettingsIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer cog teeth */}
    <rect x="20" y="4" width="8" height="4" className="fill-primary/60" />
    <rect x="20" y="40" width="8" height="4" className="fill-primary/60" />
    <rect x="4" y="20" width="4" height="8" className="fill-primary/60" />
    <rect x="40" y="20" width="4" height="8" className="fill-primary/60" />
    
    {/* Diagonal teeth */}
    <rect x="8" y="8" width="6" height="6" className="fill-primary/50" />
    <rect x="34" y="8" width="6" height="6" className="fill-primary/50" />
    <rect x="8" y="34" width="6" height="6" className="fill-primary/50" />
    <rect x="34" y="34" width="6" height="6" className="fill-primary/50" />
    
    {/* Inner ring */}
    <rect x="14" y="14" width="20" height="20" className="fill-primary/40" />
    <rect x="18" y="18" width="12" height="12" className="fill-background" />
    <rect x="20" y="20" width="8" height="8" className="fill-primary/30" />
  </svg>
);

// Note/Sticky Note - Elegant note with corner fold
export const PixelNoteIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Note base */}
    <rect x="8" y="6" width="28" height="36" rx="2" className="fill-amber-400/20" />
    <rect x="10" y="8" width="24" height="32" className="fill-background" />
    
    {/* Folded corner */}
    <rect x="30" y="6" width="6" height="6" className="fill-amber-400/40" />
    <rect x="30" y="6" width="4" height="4" className="fill-amber-400/60" />
    
    {/* Lines */}
    <rect x="14" y="14" width="14" height="2" className="fill-primary/50" />
    <rect x="14" y="20" width="18" height="1" className="fill-muted-foreground/30" />
    <rect x="14" y="24" width="16" height="1" className="fill-muted-foreground/30" />
    <rect x="14" y="28" width="18" height="1" className="fill-muted-foreground/30" />
    <rect x="14" y="32" width="12" height="1" className="fill-muted-foreground/30" />
    
    {/* Pin accent */}
    <rect x="20" y="2" width="4" height="6" rx="1" className="fill-primary/70" />
    <rect x="21" y="3" width="2" height="3" className="fill-primary" />
  </svg>
);

// Send/Campaign - Elegant paper airplane
export const PixelSendIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Paper airplane body */}
    <rect x="6" y="22" width="4" height="4" className="fill-primary/30" />
    <rect x="10" y="20" width="4" height="8" className="fill-primary/40" />
    <rect x="14" y="18" width="4" height="12" className="fill-primary/50" />
    <rect x="18" y="16" width="4" height="14" className="fill-primary/60" />
    <rect x="22" y="14" width="6" height="16" className="fill-primary/70" />
    <rect x="28" y="12" width="6" height="18" className="fill-primary/80" />
    <rect x="34" y="10" width="8" height="20" className="fill-primary" />
    
    {/* Wing highlight */}
    <rect x="34" y="12" width="6" height="4" className="fill-amber-400/60" />
    <rect x="36" y="14" width="4" height="2" className="fill-amber-400" />
    
    {/* Motion trail */}
    <rect x="4" y="30" width="8" height="2" className="fill-emerald-500/30" />
    <rect x="8" y="34" width="6" height="2" className="fill-emerald-500/20" />
  </svg>
);

// Zap/Lightning - Elegant automation symbol
export const PixelZapIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Lightning bolt */}
    <rect x="24" y="2" width="8" height="4" className="fill-amber-400/60" />
    <rect x="22" y="6" width="8" height="4" className="fill-amber-400/70" />
    <rect x="20" y="10" width="8" height="4" className="fill-amber-400/80" />
    <rect x="18" y="14" width="8" height="4" className="fill-amber-400/90" />
    <rect x="16" y="18" width="16" height="4" className="fill-amber-400" />
    
    {/* Lower bolt */}
    <rect x="22" y="22" width="8" height="4" className="fill-amber-500/90" />
    <rect x="20" y="26" width="8" height="4" className="fill-amber-500/80" />
    <rect x="18" y="30" width="8" height="4" className="fill-amber-500/70" />
    <rect x="16" y="34" width="8" height="4" className="fill-amber-500/60" />
    <rect x="14" y="38" width="8" height="4" className="fill-amber-500/50" />
    <rect x="12" y="42" width="6" height="4" className="fill-amber-500/40" />
    
    {/* Glow effect */}
    <rect x="32" y="16" width="4" height="2" className="fill-primary/30" />
    <rect x="12" y="20" width="4" height="2" className="fill-primary/30" />
  </svg>
);

// Package/Template - Elegant gift box
export const PixelPackageIcon: React.FC<PixelIconProps> = ({ className = "", size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ribbon top */}
    <rect x="20" y="4" width="8" height="8" className="fill-amber-400/70" />
    <rect x="22" y="6" width="4" height="4" className="fill-amber-400" />
    
    {/* Box lid */}
    <rect x="8" y="12" width="32" height="8" className="fill-primary/50" />
    <rect x="10" y="14" width="28" height="4" className="fill-primary/30" />
    
    {/* Vertical ribbon on lid */}
    <rect x="21" y="12" width="6" height="8" className="fill-amber-400/80" />
    
    {/* Box body */}
    <rect x="10" y="20" width="28" height="22" className="fill-primary/40" />
    <rect x="12" y="22" width="24" height="18" className="fill-primary/25" />
    
    {/* Vertical ribbon on body */}
    <rect x="21" y="20" width="6" height="22" className="fill-amber-400/60" />
    <rect x="23" y="20" width="2" height="22" className="fill-amber-400/80" />
    
    {/* Bow accent */}
    <rect x="16" y="6" width="4" height="4" className="fill-amber-400/50" />
    <rect x="28" y="6" width="4" height="4" className="fill-amber-400/50" />
  </svg>
);
