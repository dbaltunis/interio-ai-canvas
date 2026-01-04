import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Database, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDataSelectorProps {
  useRealData: boolean;
  onUseRealDataChange: (value: boolean) => void;
  selectedProjectId: string;
  onProjectIdChange: (value: string) => void;
}

export const ProjectDataSelector: React.FC<ProjectDataSelectorProps> = ({
  useRealData,
  onUseRealDataChange,
  selectedProjectId,
  onProjectIdChange
}) => {
  // Fetch available projects for dropdown
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-for-template'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          job_number,
          client:clients(name, company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/40">
      <div className="flex items-center gap-2">
        <Switch
          id="use-real-data"
          checked={useRealData}
          onCheckedChange={onUseRealDataChange}
        />
        <Label htmlFor="use-real-data" className="text-sm font-medium cursor-pointer">
          <span className="flex items-center gap-1.5">
            {useRealData ? (
              <Database className="h-3.5 w-3.5 text-primary" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {useRealData ? 'Real Data' : 'Sample Data'}
          </span>
        </Label>
      </div>

      {useRealData && (
        <Select value={selectedProjectId} onValueChange={onProjectIdChange}>
          <SelectTrigger className="w-[240px] h-8 text-sm">
            <SelectValue placeholder="Select project..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : projects && projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <span className="truncate">
                    {project.name || project.job_number || `Project ${project.id.slice(0, 8)}`}
                  </span>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-projects" disabled>
                No projects found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};