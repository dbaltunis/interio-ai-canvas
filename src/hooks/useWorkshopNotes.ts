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
    if (!projectId) {
      console.error("No projectId provided");
      return;
    }

    console.log("=== SAVING NOTES ===");
    console.log("Production notes:", productionNotes);
    console.log("Item notes:", itemNotes);

    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      console.log("User authenticated:", user.id);

      // Save production notes to project_notes table
      const { data: existingNote, error: fetchError } = await supabase
        .from("project_notes")
        .select("id")
        .eq("project_id", projectId)
        .eq("type", "production_notes")
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing note:", fetchError);
        throw fetchError;
      }

      if (existingNote) {
        console.log("Updating existing production note:", existingNote.id);
        const { error: updateError } = await supabase
          .from("project_notes")
          .update({ content: productionNotes })
          .eq("id", existingNote.id);
        
        if (updateError) {
          console.error("Error updating production note:", updateError);
          throw updateError;
        }
        console.log("Production note updated successfully");
      } else if (productionNotes.trim()) {
        console.log("Inserting new production note");
        const { error: insertError } = await supabase
          .from("project_notes")
          .insert({
            project_id: projectId,
            user_id: user.id,
            content: productionNotes,
            type: "production_notes",
          });
        
        if (insertError) {
          console.error("Error inserting production note:", insertError);
          throw insertError;
        }
        console.log("Production note inserted successfully");
      }

      // Save item notes to surfaces table
      console.log("Saving item notes, count:", Object.keys(itemNotes).length);
      const updatePromises = Object.entries(itemNotes).map(async ([itemId, note]) => {
        console.log(`Updating surface ${itemId} with note:`, note);
        const { error } = await supabase
          .from("surfaces")
          .update({ notes: note } as any)
          .eq("id", itemId);
        
        if (error) {
          console.error(`Error updating surface ${itemId}:`, error);
          throw error;
        }
        console.log(`Surface ${itemId} updated successfully`);
        return true;
      });

      await Promise.all(updatePromises);
      console.log("All item notes saved successfully");

      toast({
        title: "Notes saved",
        description: "Your workshop notes have been saved successfully.",
      });
    } catch (error) {
      console.error("=== ERROR SAVING NOTES ===", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
      console.log("=== SAVE COMPLETE ===");
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
