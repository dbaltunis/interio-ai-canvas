import { Mail, MessageCircle } from "lucide-react";
import { ProjectCommunicationStats } from "@/hooks/useProjectCommunicationStats";
import { cn } from "@/lib/utils";

interface ProjectCommunicationsDisplayProps {
  stats?: ProjectCommunicationStats;
  onEmailClick?: () => void;
  onWhatsAppClick?: () => void;
}

export const ProjectCommunicationsDisplay = ({
  stats,
  onEmailClick,
  onWhatsAppClick,
}: ProjectCommunicationsDisplayProps) => {
  const emailCount = stats?.emailCount ?? 0;
  const whatsappCount = stats?.whatsappCount ?? 0;
  const totalCount = emailCount + whatsappCount;

  if (totalCount === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {emailCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEmailClick?.();
          }}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            "hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors",
            !onEmailClick && "cursor-default"
          )}
        >
          <Mail className="h-3 w-3" />
          <span>{emailCount}</span>
        </button>
      )}
      {whatsappCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWhatsAppClick?.();
          }}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            "hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors",
            !onWhatsAppClick && "cursor-default"
          )}
        >
          <MessageCircle className="h-3 w-3" />
          <span>{whatsappCount}</span>
        </button>
      )}
    </div>
  );
};
