import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TemplateHealthWarningProps {
  templateId: string;
  templateName?: string;
}

export const TemplateHealthWarning = ({ templateId, templateName }: TemplateHealthWarningProps) => {
  const navigate = useNavigate();

  // Check if template has any enabled options
  const { data: healthCheck } = useQuery({
    queryKey: ['template-health', templateId],
    queryFn: async () => {
      // Check enabled options count
      const { count: optionsCount } = await supabase
        .from('template_option_settings')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', templateId)
        .eq('is_enabled', true);

      // Check headings count - using raw query since headings is a JSON column
      const { data: template } = await supabase
        .from('curtain_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      // Cast to access the headings property which is a JSON column
      const templateData = template as Record<string, unknown> | null;
      const headingsArray = templateData?.headings;
      const headingsCount = Array.isArray(headingsArray) ? headingsArray.length : 0;

      return {
        hasOptions: (optionsCount || 0) > 0,
        hasHeadings: headingsCount > 0,
        optionsCount: optionsCount || 0,
        headingsCount,
      };
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Don't show warning if everything is configured
  if (!healthCheck || (healthCheck.hasOptions && healthCheck.hasHeadings)) {
    return null;
  }

  const issues: string[] = [];
  if (!healthCheck.hasHeadings) issues.push("no headings configured");
  if (!healthCheck.hasOptions) issues.push("no options enabled");

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Template Configuration Incomplete</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          {templateName ? `"${templateName}"` : "This template"} has {issues.join(" and ")}.
          The worksheet may appear empty or incomplete.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings?tab=treatments')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Configure Template
        </Button>
      </AlertDescription>
    </Alert>
  );
};
