import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkshopNotesHook {
  productionNotes: string;
  itemNotes: Record<string, string>;
  setProductionNotes: (notes: string) => void;
  setItemNote: (itemId: string, note: string) => void;
  saveNotes: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

export const useWorkshopNotes = (projectId?: string): WorkshopNotesHook => {
  const [productionNotes, setProductionNotes] = useState<string>("");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load production notes from project_notes table
  useEffect(() => {
    if (!projectId) return;

    const loadProductionNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("project_notes")
          .select("content")
          .eq("project_id", projectId)
          .eq("type", "production_notes")
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProductionNotes(data.content || "");
        }
      } catch (error) {
        console.error("Error loading production notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductionNotes();
  }, [projectId]);

  // Load item notes from surfaces table
  useEffect(() => {
    if (!projectId) return;

    const loadItemNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("surfaces")
          .select("id, notes")
          .eq("project_id", projectId);

        if (error) throw error;
        
        const notesMap: Record<string, string> = {};
        (data || []).forEach((surface: any) => {
          if (surface.notes) {
            notesMap[surface.id] = surface.notes;
          }
        });
        
        setItemNotes(notesMap);
      } catch (error) {
        console.error("Error loading item notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItemNotes();
  }, [projectId]);

  const setItemNote = (itemId: string, note: string) => {
    setItemNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const saveNotes = async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save production notes to project_notes table
      const { data: existingNote } = await supabase
        .from("project_notes")
        .select("id")
        .eq("project_id", projectId)
        .eq("type", "production_notes")
        .maybeSingle();

      if (existingNote) {
        // Update existing note
        await supabase
          .from("project_notes")
          .update({ content: productionNotes })
          .eq("id", existingNote.id);
      } else if (productionNotes.trim()) {
        // Insert new note
        await supabase
          .from("project_notes")
          .insert({
            project_id: projectId,
            user_id: user.id,
            content: productionNotes,
            type: "production_notes",
          });
      }

      // Save item notes to surfaces table
      const updatePromises = Object.entries(itemNotes).map(([itemId, note]) =>
        supabase
          .from("surfaces")
          .update({ notes: note } as any)
          .eq("id", itemId)
      );

      await Promise.all(updatePromises);

      toast({
        title: "Notes saved",
        description: "Your workshop notes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    productionNotes,
    itemNotes,
    setProductionNotes,
    setItemNote,
    saveNotes,
    isLoading,
    isSaving,
  };
};
