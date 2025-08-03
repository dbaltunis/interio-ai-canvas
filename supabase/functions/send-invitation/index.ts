import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitedEmail: string;
  invitedName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitedEmail, invitedName, inviterName, inviterEmail, role, invitationToken }: InvitationRequest = await req.json();

    const invitationUrl = `${Deno.env.get("SITE_URL")}/accept-invitation?token=${invitationToken}`;

    const emailData = {
      personalizations: [
        {
          to: [{ email: invitedEmail, name: invitedName || invitedEmail }],
        },
      ],
      from: { email: inviterEmail, name: inviterName },
      subject: `You're invited to join our team`,
      content: [
        {
          type: "text/html",
          value: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; margin-bottom: 24px;">You're invited to join our team!</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Hi ${invitedName || 'there'},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                ${inviterName} (${inviterEmail}) has invited you to join their team as a <strong>${role}</strong>.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${invitationUrl}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-bottom: 32px;">
                ${invitationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
        },
      ],
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("SendGrid API error:", response.status, errorData);
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    console.log("Invitation email sent successfully via SendGrid");

    return new Response(JSON.stringify({ success: true, message: "Invitation sent" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);