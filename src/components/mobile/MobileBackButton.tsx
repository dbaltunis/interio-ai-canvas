import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileBackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function MobileBackButton({ onClick, label, className }: MobileBackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "min-h-[44px] min-w-[44px] p-2 -ml-2 flex items-center gap-1 text-foreground hover:bg-muted/50 active:scale-95 transition-transform",
        className
      )}
    >
      <motion.div
        whileTap={{ x: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <ChevronLeft className="h-5 w-5" />
      </motion.div>
      {label && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );
}
