import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailQuoteData {
  quoteId: string;
  recipientEmail: string;
  subject?: string;
  message?: string;
  includeAttachment?: boolean;
}

export const useEmailQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EmailQuoteData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch the quote details
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", data.quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Create email record
      const { data: email, error: emailError } = await supabase
        .from("emails")
        .insert({
          user_id: user.id,
          recipient_email: data.recipientEmail,
          subject: data.subject || `Quote ${quote.quote_number}`,
          content: data.message || `Please find attached quote ${quote.quote_number}.`,
          status: "sent",
          sent_at: new Date().toISOString(),
          client_id: quote.client_id,
        })
        .select()
        .single();

      if (emailError) throw emailError;

      // Update quote status to sent if not already
      if (quote.status === "draft") {
        const { error: updateError } = await supabase
          .from("quotes")
          .update({ 
            status: "sent",
            sent_at: new Date().toISOString()
          })
          .eq("id", data.quoteId);

        if (updateError) throw updateError;
      }

      return { email, quote };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast({
        title: "Success",
        description: `Quote ${result.quote.quote_number} has been emailed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to email quote",
        variant: "destructive"
      });
    },
  });
};