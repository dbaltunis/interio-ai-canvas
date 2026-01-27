import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusInfo {
  id: string;
  name: string;
  color: string;
  action: string;
  category: string;
  description: string | null;
}

interface ProjectStatusContextValue {
  projectId: string | null;
  statusId: string | null;
  statusInfo: StatusInfo | null;
  canEdit: boolean;
  isLocked: boolean;
  isViewOnly: boolean;
  isCompleted: boolean;
  requiresReason: boolean;
  statusAction: string;
  isLoading: boolean;
  checkAndWarn: (action: string) => boolean;
}

const defaultValue: ProjectStatusContextValue = {
  projectId: null,
  statusId: null,
  statusInfo: null,
  canEdit: true,
  isLocked: false,
  isViewOnly: false,
  isCompleted: false,
  requiresReason: false,
  statusAction: "editable",
  isLoading: false,
  checkAndWarn: () => true,
};

const ProjectStatusContext = createContext<ProjectStatusContextValue>(defaultValue);

interface ProjectStatusProviderProps {
  projectId: string | null;
  children: React.ReactNode;
}

export const ProjectStatusProvider: React.FC<ProjectStatusProviderProps> = ({
  projectId,
  children,
}) => {
  const { toast } = useToast();

  // Fetch project to get status_id
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project-status-context", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("id, status, status_id")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project for status:", error);
        return null;
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });

  // Fetch status details
  const { data: statusInfo, isLoading: statusLoading } = useQuery({
    queryKey: ["status-info", project?.status_id],
    queryFn: async () => {
      if (!project?.status_id) return null;

      const { data, error } = await supabase
        .from("job_statuses")
        .select("id, name, color, action, category, description")
        .eq("id", project.status_id)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching status info:", error);
        return null;
      }

      return data as StatusInfo;
    },
    enabled: !!project?.status_id,
    staleTime: 5 * 60 * 1000,
  });

  const value = useMemo(() => {
    const action = statusInfo?.action || "editable";
    
    // Determine permissions based on status action
    const canEdit = action === "editable" || action === "progress_only";
    const isLocked = action === "locked" || action === "completed";
    const isViewOnly = action === "view_only";
    const isCompleted = action === "completed";
    const requiresReason = action === "requires_reason";

    // Function to check and warn before performing an action
    const checkAndWarn = (actionType: string): boolean => {
      if (isLocked || isViewOnly) {
        toast({
          title: `Project ${isLocked ? "Locked" : "View Only"}`,
          description: `This project is in "${statusInfo?.name || "locked"}" status and cannot be modified. ${actionType} is not allowed.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    };

    return {
      projectId,
      statusId: project?.status_id || null,
      statusInfo: statusInfo || null,
      canEdit,
      isLocked,
      isViewOnly,
      isCompleted,
      requiresReason,
      statusAction: action,
      isLoading: projectLoading || statusLoading,
      checkAndWarn,
    };
  }, [projectId, project, statusInfo, projectLoading, statusLoading, toast]);

  return (
    <ProjectStatusContext.Provider value={value}>
      {children}
    </ProjectStatusContext.Provider>
  );
};

export const useProjectStatus = () => {
  const context = useContext(ProjectStatusContext);
  if (!context) {
    // Return default value when used outside provider (for backwards compatibility)
    return defaultValue;
  }
  return context;
};

// Standalone hook for checking project status (for use in mutation hooks)
export const checkProjectStatusAsync = async (projectId: string): Promise<{
  canEdit: boolean;
  isLocked: boolean;
  isViewOnly: boolean;
  statusAction: string;
  statusName: string;
}> => {
  // Get project status_id
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("status_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project?.status_id) {
    // Default to editable if no status found
    return {
      canEdit: true,
      isLocked: false,
      isViewOnly: false,
      statusAction: "editable",
      statusName: "Unknown",
    };
  }

  // Get status details
  const { data: status, error: statusError } = await supabase
    .from("job_statuses")
    .select("name, action")
    .eq("id", project.status_id)
    .eq("is_active", true)
    .single();

  if (statusError || !status) {
    return {
      canEdit: true,
      isLocked: false,
      isViewOnly: false,
      statusAction: "editable",
      statusName: "Unknown",
    };
  }

  const action = status.action || "editable";
  
  return {
    canEdit: action === "editable" || action === "progress_only",
    isLocked: action === "locked" || action === "completed",
    isViewOnly: action === "view_only",
    statusAction: action,
    statusName: status.name,
  };
};

export default ProjectStatusContext;
