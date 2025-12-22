import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectNote {
  id: string;
  project_id: string | null;
  quote_id: string | null;
  user_id: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  projectName?: string;
}

interface ClientProjectNotesResult {
  notes: ProjectNote[];
  projects: { id: string; name: string }[];
}

export const useClientProjectNotes = (clientId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["client-project-notes", clientId],
    queryFn: async (): Promise<ClientProjectNotesResult> => {
      if (!clientId) return { notes: [], projects: [] };

      // 1. Get all projects for client
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", clientId);

      if (projectsError) throw projectsError;
      if (!projects?.length) return { notes: [], projects: [] };

      const projectIds = projects.map((p) => p.id);

      // 2. Get all notes for those projects in ONE query
      const { data: notes, error: notesError } = await supabase
        .from("project_notes")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;

      // 3. Merge project names with notes
      return {
        notes:
          notes?.map((note) => ({
            ...note,
            projectName: projects.find((p) => p.id === note.project_id)?.name,
          })) || [],
        projects,
      };
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });

  const addNote = async (projectId: string, content: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { error } = await supabase.from("project_notes").insert({
      project_id: projectId,
      user_id: userData.user.id,
      content,
      note_type: "general",
    });

    if (error) throw error;

    // Invalidate to refetch
    queryClient.invalidateQueries({ queryKey: ["client-project-notes", clientId] });
  };

  return {
    ...query,
    notes: query.data?.notes || [],
    projects: query.data?.projects || [],
    addNote,
  };
};
