import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  rotation?: number;
}

export const DeviceFrame = ({ 
  children, 
  className,
  scale = 1,
  rotation = 0 
}: DeviceFrameProps) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        scale,
        rotateX: rotation,
        transformPerspective: 1000,
      }}
    >
      {/* Tablet outer frame */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-3 shadow-2xl">
        {/* Bezel reflection */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Camera notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-600 ring-1 ring-zinc-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        </div>
        
        {/* Screen bezel */}
        <div className="relative rounded-[2rem] bg-black p-0.5 overflow-hidden">
          {/* Screen content */}
          <div className="relative rounded-[1.75rem] overflow-hidden bg-background aspect-[4/3]">
            {children}
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-zinc-600" />
      </div>
      
      {/* Shadow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/30 blur-xl rounded-full" />
    </motion.div>
  );
};
