import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkshopNotesHook {
  productionNotes: string;
  itemNotes: Record<string, string>;
  setProductionNotes: (notes: string) => void;
  setItemNote: (itemId: string, note: string) => void;
  saveNotes: () => Promise<void>;
  saveItemNotePublic: (itemId: string, note: string) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

interface UseWorkshopNotesOptions {
  sessionToken?: string;
}

export const useWorkshopNotes = (projectId?: string, options?: UseWorkshopNotesOptions): WorkshopNotesHook => {
  const [productionNotes, setProductionNotes] = useState<string>("");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const sessionToken = options?.sessionToken;

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

  // Save a single item note via edge function (for public/anonymous users)
  const saveItemNotePublic = async (itemId: string, note: string) => {
    if (!sessionToken) {
      console.error("❌ [NOTES SAVE PUBLIC] No session token provided");
      throw new Error("No session token - cannot save notes");
    }

    console.log("=== 📝 SAVING NOTE VIA EDGE FUNCTION ===");
    console.log("📌 Item ID:", itemId);
    console.log("📝 Note length:", note?.length);

    setIsSaving(true);
    try {
      const response = await supabase.functions.invoke('update-workshop-notes', {
        body: {
          session_token: sessionToken,
          item_id: itemId,
          notes: note,
        }
      });

      if (response.error) {
        console.error("❌ [NOTES SAVE PUBLIC] Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to save notes");
      }

      const result = response.data;
      if (!result.success) {
        console.error("❌ [NOTES SAVE PUBLIC] Failed:", result.error);
        throw new Error(result.error || "Failed to save notes");
      }

      console.log("✅ [NOTES SAVE PUBLIC] Saved successfully by:", result.updated_by);
      
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("❌ [NOTES SAVE PUBLIC] Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!projectId) {
      console.error("❌ [NOTES SAVE] No projectId provided");
      return;
    }

    console.log("=== 📝 SAVING NOTES ===");
    console.log("📌 Project ID:", projectId);
    console.log("📝 Production notes:", productionNotes);
    console.log("📝 Item notes count:", Object.keys(itemNotes).length);
    console.log("📝 Item notes:", itemNotes);
    console.log("🔑 Has session token:", !!sessionToken);

    setIsSaving(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no authenticated user but we have a session token, use edge function
      if (!user && sessionToken) {
        console.log("🔄 [NOTES SAVE] Using edge function for anonymous save");
        
        // Save each item note via edge function
        const savePromises = Object.entries(itemNotes).map(([itemId, note]) => 
          saveItemNotePublic(itemId, note)
        );
        
        await Promise.all(savePromises);
        console.log("✅ [NOTES SAVE] All notes saved via edge function");
        return;
      }

      // Otherwise, require authenticated user for direct save
      if (!user) {
        console.error("❌ [NOTES SAVE] No authenticated user and no session token");
        throw new Error("Not authenticated");
      }

      console.log("✅ [NOTES SAVE] User authenticated:", user.id);

      // Save production notes to project_notes table
      console.log("📋 [NOTES SAVE] Checking for existing production note...");
      const { data: existingNote, error: fetchError } = await supabase
        .from("project_notes")
        .select("id")
        .eq("project_id", projectId)
        .eq("type", "production_notes")
        .maybeSingle();

      if (fetchError) {
        console.error("❌ [NOTES SAVE] Error fetching existing note:", fetchError);
        throw fetchError;
      }

      console.log("🔍 [NOTES SAVE] Existing note found:", existingNote?.id || "none");

      if (existingNote) {
        console.log("🔄 [NOTES SAVE] Updating existing production note:", existingNote.id);
        const { error: updateError } = await supabase
          .from("project_notes")
          .update({ content: productionNotes })
          .eq("id", existingNote.id);
        
        if (updateError) {
          console.error("❌ [NOTES SAVE] Error updating production note:", updateError);
          throw updateError;
        }
        console.log("✅ [NOTES SAVE] Production note updated successfully");
      } else if (productionNotes.trim()) {
        console.log("➕ [NOTES SAVE] Inserting new production note");
        const { error: insertError } = await supabase
          .from("project_notes")
          .insert({
            project_id: projectId,
            user_id: user.id,
            content: productionNotes,
            type: "production_notes",
          });
        
        if (insertError) {
          console.error("❌ [NOTES SAVE] Error inserting production note:", insertError);
          throw insertError;
        }
        console.log("✅ [NOTES SAVE] Production note inserted successfully");
      }

      // Save item notes to surfaces table AND workshop_items directly
      console.log("📝 [NOTES SAVE] Saving item notes, count:", Object.keys(itemNotes).length);
      const updatePromises = Object.entries(itemNotes).map(async ([itemId, note]) => {
        console.log(`🔄 [NOTES SAVE] Updating surface ${itemId} with note:`, note.substring(0, 50));
        
        // Update surface notes
        const { error: surfaceError } = await supabase
          .from("surfaces")
          .update({ notes: note } as any)
          .eq("id", itemId);
        
        if (surfaceError) {
          console.error(`❌ [NOTES SAVE] Error updating surface ${itemId}:`, surfaceError);
          throw surfaceError;
        }
        
        // Also directly update workshop_items to ensure sync (backup for trigger)
        const { error: workshopError } = await supabase
          .from("workshop_items")
          .update({ notes: note } as any)
          .eq("window_id", itemId);
        
        if (workshopError) {
          console.warn(`⚠️ [NOTES SAVE] Could not sync to workshop_items for ${itemId}:`, workshopError);
          // Don't throw - this is a fallback sync
        }
        
        console.log(`✅ [NOTES SAVE] Surface ${itemId} updated successfully`);
        return true;
      });

      await Promise.all(updatePromises);
      console.log("✅ [NOTES SAVE] All item notes saved successfully");

      toast({
        title: "Notes saved",
        description: "Your workshop notes have been saved successfully.",
      });
      console.log("✅ [NOTES SAVE] Save complete - toast shown");
    } catch (error) {
      console.error("❌ [NOTES SAVE] === ERROR SAVING NOTES ===", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
      console.log("=== [NOTES SAVE] SAVE OPERATION COMPLETE ===");
    }
  };

  return {
    productionNotes,
    itemNotes,
    setProductionNotes,
    setItemNote,
    saveNotes,
    saveItemNotePublic,
    isLoading,
    isSaving,
  };
};
