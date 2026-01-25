import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobilePageTransitionProps {
  children: ReactNode;
  activeKey: string;
  direction: number;
}

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const pageTransition = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300,
  mass: 0.8,
};

export function MobilePageTransition({
  children,
  activeKey,
  direction,
}: MobilePageTransitionProps) {
  const isMobile = useIsMobile();

  // On desktop, no animation needed
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={activeKey}
        custom={direction}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={pageTransition}
        className="will-change-transform"
        style={{ minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
