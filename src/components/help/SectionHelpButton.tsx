import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatedDemoPlayer } from "./AnimatedDemoPlayer";
import { sectionHelpContent, SectionHelpContent } from "@/config/sectionHelp";

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
  
  const content: SectionHelpContent | undefined = sectionHelpContent[sectionId];
  
  if (!content) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "icon" : "default"}
          className={`h-6 w-6 rounded-full hover:bg-primary/10 ${className}`}
          aria-label={`Help for ${content.title}`}
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            {content.icon && <content.icon className="h-5 w-5 text-primary" />}
            {content.title}
          </SheetTitle>
          <SheetDescription className="text-left">
            {content.briefDescription}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Animated Demo */}
          {content.demoSteps && content.demoSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">See How It Works</h4>
              <AnimatedDemoPlayer steps={content.demoSteps} />
            </div>
          )}
          
          {/* Key Points */}
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Key Points</h4>
              <ul className="space-y-2">
                {content.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Related Sections */}
          {content.relatedSections && content.relatedSections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Related Settings</h4>
              <div className="flex flex-wrap gap-2">
                {content.relatedSections.map((section) => (
                  <span 
                    key={section}
                    className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
