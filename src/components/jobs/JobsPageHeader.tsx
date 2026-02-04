import { Briefcase } from "lucide-react";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

interface JobsPageHeaderProps {
  onQuoteSelect?: (quoteId: string) => void;
}

export const JobsPageHeader = ({ onQuoteSelect }: JobsPageHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Briefcase className="h-5 w-5 text-primary" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Jobs</h1>
      <SectionHelpButton sectionId="jobs" />
    </div>
  );
};
