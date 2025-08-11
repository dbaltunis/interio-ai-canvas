
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProjectNote = {
  id: string;
  project_id: string | null;
  quote_id: string | null;
  user_id: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  // Enriched at runtime
  mentions?: { mentioned_user_id: string }[];
};

interface UseProjectNotesParams {
  projectId?: string;
  quoteId?: string;
}

export const useProjectNotes = ({ projectId, quoteId }: UseProjectNotesParams) => {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mentionsByNote, setMentionsByNote] = useState<Record<string, { id: string; mentioned_user_id: string }[]>>({});

  // Bypass strict typing since Supabase types are not generated for new tables yet
  const sb: any = supabase as any;

  const filter = useMemo(() => {
    if (projectId) return { column: "project_id", value: projectId } as const;
    if (quoteId) return { column: "quote_id", value: quoteId } as const;
    return null;
  }, [projectId, quoteId]);

  const fetchNotes = async () => {
    if (!filter) return;
    setLoading(true);
    setError(null);
    try {
      const { data: notesData, error: notesErr } = await sb
        .from("project_notes")
        .select("*")
        .eq(filter.column, filter.value)
        .order("created_at", { ascending: true });

      if (notesErr) throw notesErr;
      const baseNotes = ((notesData ?? []) as unknown) as ProjectNote[];

      // Load mentions for these notes
      const ids = baseNotes.map((n) => n.id);
      if (ids.length > 0) {
        const { data: mentionsData, error: mErr } = await sb
          .from("project_note_mentions")
          .select("id, note_id, mentioned_user_id")
          .in("note_id", ids);
        if (mErr) throw mErr;
        const map: Record<string, { id: string; mentioned_user_id: string }[]> = {};
        (mentionsData || []).forEach((m: any) => {
          map[m.note_id] = map[m.note_id] || [];
          map[m.note_id].push({ id: m.id, mentioned_user_id: m.mentioned_user_id });
        });
        setMentionsByNote(map);
        setNotes(baseNotes.map(n => ({ ...n, mentions: (map[n.id] || []).map(mm => ({ mentioned_user_id: mm.mentioned_user_id })) })));
      } else {
        setMentionsByNote({});
        setNotes(baseNotes);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (content: string, type: string = "general", mentionedUserIds: string[] = []) => {
    if (!filter) throw new Error("Missing project or quote context");
    const { data: { user } } = await sb.auth.getUser();
    if (!user?.id) throw new Error("Not authenticated");

    const payload = {
      content: content.trim(),
      type,
      user_id: user.id,
      project_id: filter.column === "project_id" ? filter.value : null,
      quote_id: filter.column === "quote_id" ? filter.value : null,
    } as any;

    const { data, error } = await sb
      .from("project_notes")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    const inserted = (data as unknown) as ProjectNote;

    // Insert mentions if any
    if (mentionedUserIds.length > 0) {
      const mentionRows = mentionedUserIds.map((uid) => ({
        note_id: inserted.id,
        mentioned_user_id: uid,
        created_by: user.id,
      }));
      const { error: mErr } = await sb
        .from("project_note_mentions")
        .insert(mentionRows);
      if (mErr) {
        // Don't fail note creation if mentions fail; just log
        console.warn("Failed to insert mentions", mErr);
      } else {
        inserted.mentions = mentionedUserIds.map((uid) => ({ mentioned_user_id: uid }));
        setMentionsByNote((prev) => ({
          ...prev,
          [inserted.id]: (prev[inserted.id] || []).concat(
            mentionedUserIds.map((uid) => ({ id: crypto.randomUUID?.() || uid, mentioned_user_id: uid }))
          )
        }));
      }
    }

    // Optimistic update (realtime will also sync)
    setNotes(prev => [...prev, inserted]);
    return inserted;
  };

  const deleteNote = async (id: string) => {
    const { error } = await sb
      .from("project_notes")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.column, filter?.value]);

  useEffect(() => {
    if (!filter) return;

    const channel = sb
      .channel("project-notes-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_notes",
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload: any) => {
          setNotes(prev => [...prev, (payload.new as unknown) as ProjectNote]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "project_notes",
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload: any) => {
          setNotes(prev => prev.filter(n => n.id !== payload.old?.id));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_notes",
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload: any) => {
          setNotes(prev => prev.map(n => (n.id === payload.new?.id ? ((payload.new as unknown) as ProjectNote) : n)));
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [filter?.column, filter?.value]);

  return { notes, loading, error, fetchNotes, addNote, deleteNote };
};
