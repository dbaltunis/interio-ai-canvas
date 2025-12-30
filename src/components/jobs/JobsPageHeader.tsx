
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface JobsPageHeaderProps {
  onQuoteSelect?: (quoteId: string) => void;
}

export const JobsPageHeader = ({ onQuoteSelect }: JobsPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Manage your window treatment projects and quotes
          </p>
        </div>
      </div>
    </div>
  );
};
