import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, Building2 } from "lucide-react";
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Template Data Source
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="use-real-data" className="text-base">
              Use Real Project Data
            </Label>
            <div className="text-sm text-muted-foreground">
              Toggle to use actual project data instead of sample data for template preview
            </div>
          </div>
          <Switch
            id="use-real-data"
            checked={useRealData}
            onCheckedChange={onUseRealDataChange}
          />
        </div>

        {useRealData && (
          <div className="space-y-2">
            <Label htmlFor="project-select">Select Project</Label>
            <Select value={selectedProjectId} onValueChange={onProjectIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project to use for template data" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {project.name || project.job_number || `Project ${project.id.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.client?.company_name || project.client?.name || 'No client'}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    No projects found. Create a project first.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium">Sample Data</div>
              <div className="text-muted-foreground">
                Professional mock data for preview purposes
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Database className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Real Project Data</div>
              <div className="text-muted-foreground">
                Actual client, treatment, and pricing information
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};