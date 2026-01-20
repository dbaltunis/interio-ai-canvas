import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Maximize2, X } from "lucide-react";
import { DeviceFrame } from "./DeviceFrame";
import { showcaseScenes, totalShowcaseDuration } from "./scenes";
import { cn } from "@/lib/utils";

interface CinematicShowcasePlayerProps {
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

export const CinematicShowcasePlayer = ({
  autoPlay = true,
  onComplete,
  className,
  compact = false,
}: CinematicShowcasePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = totalShowcaseDuration;
  const progress = currentTime / totalDuration;

  // Find current scene
  let accumulatedTime = 0;
  let currentSceneIndex = 0;
  let sceneProgress = 0;

  for (let i = 0; i < showcaseScenes.length; i++) {
    if (currentTime < accumulatedTime + showcaseScenes[i].duration) {
      currentSceneIndex = i;
      sceneProgress = (currentTime - accumulatedTime) / showcaseScenes[i].duration;
      break;
    }
    accumulatedTime += showcaseScenes[i].duration;
  }

  const currentScene = showcaseScenes[currentSceneIndex];
  const SceneComponent = currentScene.component;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            onComplete?.();
            return totalDuration;
          }
          return prev + 0.05;
        });
      }, 50);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalDuration, onComplete]);

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playerContent = (
    <div className={cn("relative flex flex-col", compact ? "h-full" : "")}>
      {/* Device frame with animated scene */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, rotateX: 8 }}
          animate={{ 
            scale: sceneProgress < 0.1 ? 0.85 + sceneProgress * 1.5 : 1,
            rotateX: sceneProgress < 0.1 ? 8 - sceneProgress * 80 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <DeviceFrame className={compact ? "max-w-[280px]" : "max-w-[400px]"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SceneComponent progress={sceneProgress} />
              </motion.div>
            </AnimatePresence>
          </DeviceFrame>
        </motion.div>
      </div>

      {/* Text overlay */}
      <AnimatePresence mode="wait">
        {currentScene.title && (
          <motion.div
            key={currentScene.id + "-text"}
            className="text-center px-4 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-sm font-semibold text-foreground">{currentScene.title}</h3>
            {currentScene.subtitle && (
              <p className="text-xs text-muted-foreground">{currentScene.subtitle}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="px-4 pb-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground w-8">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-muted rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickProgress = (e.clientX - rect.left) / rect.width;
              setCurrentTime(clickProgress * totalDuration);
            }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{formatTime(totalDuration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          {!compact && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={cn("bg-card rounded-xl border border-border overflow-hidden", className)}>
        {playerContent}
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full max-w-2xl">{playerContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
