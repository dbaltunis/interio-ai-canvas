import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UnifiedNote {
  id: string;
  source: "project_note" | "activity";
  content: string;
  title?: string;
  type?: string;
  activity_type?: string;
  project_id?: string | null;
  project_name?: string;
  created_at: string;
  team_member?: string;
}

interface UseUnifiedClientNotesResult {
  notes: UnifiedNote[];
  projects: { id: string; name: string }[];
  notesByProject: Record<string, number>;
  isLoading: boolean;
  addNote: (projectId: string | null, content: string, type?: string) => Promise<void>;
  addActivity: (title: string, description?: string, activityType?: string) => Promise<void>;
}

export const useUnifiedClientNotes = (clientId: string | undefined): UseUnifiedClientNotesResult => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["unified-client-notes", clientId],
    queryFn: async (): Promise<{ notes: UnifiedNote[]; projects: { id: string; name: string }[]; notesByProject: Record<string, number> }> => {
      if (!clientId) return { notes: [], projects: [], notesByProject: {} };

      // 1. Get all projects for client
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", clientId);

      if (projectsError) throw projectsError;
      
      const projectIds = projects?.map((p) => p.id) || [];
      const projectMap = new Map(projects?.map(p => [p.id, p.name]) || []);

      // 2. Get project notes (if there are projects)
      let projectNotes: UnifiedNote[] = [];
      const notesByProject: Record<string, number> = {};
      
      if (projectIds.length > 0) {
        const { data: notes, error: notesError } = await supabase
          .from("project_notes")
          .select("*")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        projectNotes = (notes || []).map((note) => {
          // Count notes per project
          if (note.project_id) {
            notesByProject[note.project_id] = (notesByProject[note.project_id] || 0) + 1;
          }
          
          return {
            id: note.id,
            source: "project_note" as const,
            content: note.content,
            type: note.type,
            project_id: note.project_id,
            project_name: note.project_id ? projectMap.get(note.project_id) : undefined,
            created_at: note.created_at,
          };
        });
      }

      // 3. Get activity log entries
      const { data: activities, error: activitiesError } = await supabase
        .from("client_activity_log")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (activitiesError) throw activitiesError;

      const activityNotes: UnifiedNote[] = (activities || []).map((activity) => ({
        id: activity.id,
        source: "activity" as const,
        content: activity.description || "",
        title: activity.title,
        activity_type: activity.activity_type,
        created_at: activity.created_at,
        team_member: activity.team_member,
      }));

      // 4. Merge and sort by date
      const allNotes = [...projectNotes, ...activityNotes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        notes: allNotes,
        projects: projects || [],
        notesByProject,
      };
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ projectId, content, type }: { projectId: string | null; content: string; type?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      if (projectId) {
        // Add as project note
        const { error } = await supabase.from("project_notes").insert({
          project_id: projectId,
          user_id: userData.user.id,
          content,
          type: type || "general",
        });
        if (error) throw error;
      } else {
        // Add as client activity (general note)
        const { error } = await supabase.from("client_activity_log").insert({
          client_id: clientId,
          user_id: userData.user.id,
          activity_type: "note_added",
          title: content.substring(0, 100),
          description: content,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-client-notes", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-activities", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-project-notes", clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async ({ title, description, activityType }: { title: string; description?: string; activityType?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { error } = await supabase.from("client_activity_log").insert({
        client_id: clientId,
        user_id: userData.user.id,
        activity_type: activityType || "note_added",
        title,
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-client-notes", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-activities", clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add activity",
        variant: "destructive",
      });
    },
  });

  return {
    notes: query.data?.notes || [],
    projects: query.data?.projects || [],
    notesByProject: query.data?.notesByProject || {},
    isLoading: query.isLoading,
    addNote: async (projectId, content, type) => {
      await addNoteMutation.mutateAsync({ projectId, content, type });
    },
    addActivity: async (title, description, activityType) => {
      await addActivityMutation.mutateAsync({ title, description, activityType });
    },
  };
};
