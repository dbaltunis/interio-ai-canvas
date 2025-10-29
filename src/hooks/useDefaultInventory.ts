import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLoadDefaultHeadings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.rpc('load_default_headings_for_user', {
        target_user_id: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      toast.success("Popular headings loaded successfully", {
        description: "Wave Tape, Eyelet, Pencil Pleat, and Pinch Pleat have been added to your inventory"
      });
    },
    onError: (error) => {
      console.error("Error loading default headings:", error);
      toast.error("Failed to load default headings");
    }
  });
};
