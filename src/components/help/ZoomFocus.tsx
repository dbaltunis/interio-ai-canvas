import React from "react";
import { motion } from "framer-motion";

interface ZoomFocusProps {
  children: React.ReactNode;
  active?: boolean;
  zoomLevel?: number;
  focusX?: number; // 0-100 percentage
  focusY?: number; // 0-100 percentage
  className?: string;
}

export const ZoomFocus: React.FC<ZoomFocusProps> = ({
  children,
  active = false,
  zoomLevel = 1.2,
  focusX = 50,
  focusY = 50,
  className = "",
}) => {
  // Calculate transform origin based on focus point
  const originX = `${focusX}%`;
  const originY = `${focusY}%`;

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      animate={{
        scale: active ? zoomLevel : 1,
      }}
      style={{
        transformOrigin: `${originX} ${originY}`,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
    >
      {children}

      {/* Vignette overlay when zoomed */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: active ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(
            ellipse at ${originX} ${originY},
            transparent 30%,
            hsl(var(--background) / 0.3) 80%,
            hsl(var(--background) / 0.6) 100%
          )`,
        }}
      />
    </motion.div>
  );
};

// Spotlight effect that dims everything except the target
interface SpotlightOverlayProps {
  active?: boolean;
  targetX?: number;
  targetY?: number;
  targetWidth?: number;
  targetHeight?: number;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  active = false,
  targetX = 50,
  targetY = 50,
  targetWidth = 100,
  targetHeight = 50,
}) => {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <ellipse
              cx={`${targetX}%`}
              cy={`${targetY}%`}
              rx={targetWidth}
              ry={targetHeight}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="hsl(var(--background) / 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>
    </motion.div>
  );
};
