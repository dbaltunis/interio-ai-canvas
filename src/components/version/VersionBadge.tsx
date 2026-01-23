import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { WhatsNewDialog } from "./WhatsNewDialog";
import { APP_VERSION } from "@/constants/version";

interface VersionBadgeProps {
  className?: string;
  size?: "sm" | "default";
}

export const VersionBadge = ({ className = "", size = "default" }: VersionBadgeProps) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const version = `v${APP_VERSION}`;

  return (
    <>
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-accent/50 transition-colors border-warning/50 text-warning ${
          size === "sm" ? "text-xs px-2 py-0.5" : ""
        } ${className}`}
        onClick={() => setShowWhatsNew(true)}
        title="Click to see what's new"
      >
        {version}
      </Badge>
      <WhatsNewDialog open={showWhatsNew} onOpenChange={setShowWhatsNew} />
    </>
  );
};
