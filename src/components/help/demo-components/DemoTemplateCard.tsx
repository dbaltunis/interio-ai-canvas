/**
 * DemoTemplateCard - Extracted from EmailTemplateLibrary.tsx
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Copy, Edit2, Sparkles, Mail, 
  Clock, Users, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoTemplateCardProps {
  name: string;
  category: "follow-up" | "newsletter" | "promotion" | "onboarding" | "custom";
  description: string;
  isAI?: boolean;
  usageCount?: number;
  highlighted?: boolean;
  onClick?: () => void;
}

// Category config
const getCategoryConfig = (category: string) => {
  const configs: Record<string, { label: string; className: string; icon: any }> = {
    "follow-up": { 
      label: "Follow-up", 
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Clock
    },
    newsletter: { 
      label: "Newsletter", 
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      icon: Mail
    },
    promotion: { 
      label: "Promotion", 
      className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      icon: Send
    },
    onboarding: { 
      label: "Onboarding", 
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      icon: Users
    },
    custom: { 
      label: "Custom", 
      className: "bg-muted text-muted-foreground",
      icon: FileText
    },
  };
  return configs[category] || configs.custom;
};

export const DemoTemplateCard = ({
  name,
  category,
  description,
  isAI = false,
  usageCount = 0,
  highlighted = false,
  onClick,
}: DemoTemplateCardProps) => {
  const categoryConfig = getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-all border-border/50 group",
        highlighted && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Preview placeholder */}
        <div className="h-24 bg-muted/50 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {/* Fake email preview lines */}
            <div className="p-3 space-y-2">
              <div className="h-2 bg-foreground/10 rounded w-3/4" />
              <div className="h-2 bg-foreground/10 rounded w-full" />
              <div className="h-2 bg-foreground/10 rounded w-5/6" />
              <div className="h-2 bg-foreground/10 rounded w-2/3" />
            </div>
          </div>
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          {isAI && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] gap-1 border-0">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px] gap-1 border-0", categoryConfig.className)}>
              <CategoryIcon className="h-3 w-3" />
              {categoryConfig.label}
            </Badge>
          </div>
          <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">
            Used {usageCount} times
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
