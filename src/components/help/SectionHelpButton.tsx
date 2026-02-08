import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { sectionHelpContent, SectionHelpContent } from "@/config/sectionHelp";
import { TutorialCarousel } from "./TutorialCarousel";
import { tutorialMap } from "@/config/tutorialSteps";
import { useTeaching } from "@/contexts/TeachingContext";
import { motion } from "framer-motion";
interface SectionHelpButtonProps {
  sectionId: string;
  className?: string;
  size?: "sm" | "default";
}
export const SectionHelpButton = ({
  sectionId,
  className = "",
  size = "sm"
}: SectionHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const {
    hasClickedHelpButton,
    markHelpButtonClicked
  } = useTeaching();
  const content: SectionHelpContent | undefined = sectionHelpContent[sectionId];
  const showPulse = !hasClickedHelpButton(sectionId);
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      markHelpButtonClicked(sectionId);
    }
  };
  if (!content) {
    return null;
  }
  const helpButton = <Button variant="ghost" size={size === "sm" ? "icon" : "default"} className={`h-6 w-6 rounded-full hover:bg-primary/10 ${className}`} aria-label={`Help for ${content.title}`}>
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
    </Button>;
  return <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {showPulse ? <motion.div className="relative rounded-full" initial={false}>
            {/* Pulsing ring effect */}
            <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{
          scale: [1, 1.6, 1],
          opacity: [0.5, 0, 0.5]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
            {helpButton}
          </motion.div> : helpButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            {content.icon && <content.icon className="h-5 w-5 text-primary" />}
            {content.title}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Tutorial Carousel */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Quick Guide</h4>
            {tutorialMap[sectionId] && tutorialMap[sectionId].steps.length > 0 && tutorialMap[sectionId].steps[0].Visual ? (
              <TutorialCarousel steps={tutorialMap[sectionId].steps} />
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                <div className="text-muted-foreground text-sm">
                  Tutorial coming soon
                </div>
              </div>
            )}
          </div>
          
          {/* Key Points */}
          {content.keyPoints && content.keyPoints.length > 0}
          
          {/* Related Sections */}
          {content.relatedSections && content.relatedSections.length > 0}
        </div>
      </SheetContent>
    </Sheet>;
};