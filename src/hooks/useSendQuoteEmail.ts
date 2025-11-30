import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendQuoteEmailParams {
  quoteId: string;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
  includeTerms?: boolean;
}

export const useSendQuoteEmail = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendQuoteEmailParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Get quote details with all related data
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          clients(*),
          projects(*),
          quote_items(*)
        `)
        .eq('id', params.quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }

      const clientName = params.recipientName || quote.clients?.name || 'Valued Client';
      const totalAmount = quote.total_amount || 0;

      // Build email content
      const subject = `Quote #${quote.quote_number} - ${quote.projects?.name || 'Your Project'}`;
      
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .quote-summary { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
              .total { font-size: 24px; font-weight: bold; color: #10b981; margin-top: 10px; }
              .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .terms { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 12px; color: #666; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Your Quote is Ready!</h1>
            </div>
            <div class="content">
              <p>Dear ${clientName},</p>
              <p>Thank you for your interest! We're pleased to provide you with the following quote:</p>
              
              <div class="quote-summary">
                <h3>Quote Summary</h3>
                <p><strong>Quote Number:</strong> ${quote.quote_number}</p>
                <p><strong>Project:</strong> ${quote.projects?.name || 'Your Project'}</p>
                <p><strong>Date:</strong> ${new Date(quote.created_at).toLocaleDateString()}</p>
                <p><strong>Valid Until:</strong> ${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'Contact us'}</p>
                <div class="total">Total: ${new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(totalAmount)}</div>
              </div>

              ${params.message ? `
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Message from Your Team</h3>
                  <p>${params.message}</p>
                </div>
              ` : ''}

              <p style="text-align: center;">
                <a href="${window.location.origin}/quotes/${quote.id}/view" class="cta-button">View Full Quote</a>
              </p>

              ${params.includeTerms !== false ? `
                <div class="terms">
                  <h4>Terms & Conditions</h4>
                  <p>This quote is valid for 30 days from the date of issue. A 50% deposit is required to commence work. Full payment is due upon completion. Prices include GST where applicable.</p>
                </div>
              ` : ''}

              <p>If you have any questions or would like to proceed, please don't hesitate to contact us.</p>
              <p>We look forward to working with you!</p>
              <p>Best regards,<br>Your Project Team</p>
            </div>
            <div class="footer">
              <p>This quote was generated automatically. For support, please contact us directly.</p>
            </div>
          </body>
        </html>
      `;

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.recipientEmail,
          subject: subject,
          html: content,
          user_id: session.user.id,
          client_id: quote.client_id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Quote Sent",
        description: `Quote sent successfully to ${variables.recipientEmail}`,
        importance: 'important',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send quote",
        variant: "destructive"
      });
    },
  });
};
