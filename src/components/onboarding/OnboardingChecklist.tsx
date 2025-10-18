import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingChecklistProps {
  isOpen: boolean;
  onDismiss: () => void;
  items: ChecklistItem[];
  onItemComplete: (itemId: string) => void;
}

export const OnboardingChecklist = ({ 
  isOpen, 
  onDismiss, 
  items, 
  onItemComplete 
}: OnboardingChecklistProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-[380px]"
    >
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <Badge variant="outline" className="bg-primary/10">
                {completedCount}/{items.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-3" />
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-3 pb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      item.completed
                        ? "bg-muted/50 border-border"
                        : "bg-background border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="pt-0.5">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className={`font-medium text-sm ${item.completed ? "text-muted-foreground line-through" : ""}`}>
                        {item.title}
                      </h4>
                      {!item.completed && (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {!item.completed && item.action && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={item.action}
                        >
                          {item.actionLabel || "Start"} →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {progress === 100 && (
                  <div className="text-center pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-3">
                      🎉 Great job! You're all set up.
                    </p>
                    <Button size="sm" onClick={onDismiss} className="w-full">
                      Got it!
                    </Button>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
