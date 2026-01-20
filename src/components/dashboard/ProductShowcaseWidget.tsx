import { useState } from "react";
import { motion } from "framer-motion";
import { Play, X, Sparkles } from "lucide-react";
import { CinematicShowcasePlayer } from "@/components/showcase/CinematicShowcasePlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "showcase_dismissed";

export const ProductShowcaseWidget = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <CardContent className="p-4">
          {!isExpanded ? (
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">Welcome to InterioApp!</h3>
                <p className="text-sm text-muted-foreground">
                  Watch a 1-minute tour of all features
                </p>
              </div>

              {/* CTA */}
              <Button 
                onClick={() => setIsExpanded(true)}
                className="flex-shrink-0 gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <CinematicShowcasePlayer 
                autoPlay 
                compact 
                onComplete={() => setIsExpanded(false)}
              />
            </div>
          )}
        </CardContent>

        {/* Decorative gradient */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </Card>
    </motion.div>
  );
};
