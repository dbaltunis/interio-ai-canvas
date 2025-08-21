
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Manage your window treatment projects and quotes
        </p>
      </div>
    </div>
  );
};
