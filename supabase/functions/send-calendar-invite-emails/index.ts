import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarInviteRequest {
  appointmentId: string;
  teamMemberIds: string[];
  creatorId: string;
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
  videoMeetingLink?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      appointmentId,
      teamMemberIds,
      creatorId,
      title,
      startTime,
      endTime,
      location,
      description,
      videoMeetingLink,
    }: CalendarInviteRequest = await req.json();

    if (!appointmentId || !teamMemberIds?.length || !creatorId) {
      throw new Error("Missing required fields: appointmentId, teamMemberIds, creatorId");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Filter out the creator - don't send email to the person who created the event
    const membersToNotify = teamMemberIds.filter((id) => id !== creatorId);
    if (membersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No team members to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get creator's name for the email
    const { data: creatorProfile } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("user_id", creatorId)
      .single();

    const creatorName = creatorProfile?.display_name || "A team member";

    // Look up team member emails via auth admin API
    const emailResults: { sent: string[]; failed: string[] } = { sent: [], failed: [] };

    for (const memberId of membersToNotify) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(memberId);

        if (userError || !user?.email) {
          console.error(`Could not get email for user ${memberId}:`, userError);
          emailResults.failed.push(memberId);
          continue;
        }

        // Format dates
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : null;
        const dateStr = start.toLocaleDateString("en-AU", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = start.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const endTimeStr = end
          ? end.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
          : null;

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; font-size: 24px; margin: 0;">Calendar Invitation</h1>
              <p style="color: #6b7280; margin: 8px 0 0;">You've been invited to an event</p>
            </div>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">${title}</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 100px; vertical-align: top;">When</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500;">
                    ${dateStr}<br/>
                    ${timeStr}${endTimeStr ? ` - ${endTimeStr}` : ""}
                  </td>
                </tr>
                ${
                  location
                    ? `<tr>
                  <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Where</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500;">${location}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Organiser</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500;">${creatorName}</td>
                </tr>
                ${
                  description
                    ? `<tr>
                  <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Notes</td>
                  <td style="padding: 8px 0; color: #111827;">${description}</td>
                </tr>`
                    : ""
                }
              </table>

              ${
                videoMeetingLink
                  ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <a href="${videoMeetingLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                    Join Video Meeting
                  </a>
                </div>`
                  : ""
              }
            </div>

            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 30px;">
              This invitation was sent from InterioApp. Log in to view your full calendar.
            </p>
          </div>
        `;

        // Send via the existing send-email edge function
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            to: user.email,
            subject: `Calendar Invite: ${title} - ${dateStr}`,
            html: emailHtml,
            user_id: creatorId,
          },
        });

        if (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          emailResults.failed.push(memberId);
        } else {
          emailResults.sent.push(memberId);
          console.log(`Calendar invite email sent to ${user.email}`);
        }
      } catch (err) {
        console.error(`Error processing member ${memberId}:`, err);
        emailResults.failed.push(memberId);
      }
    }

    console.log(
      `Calendar invite emails: ${emailResults.sent.length} sent, ${emailResults.failed.length} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sent: emailResults.sent.length,
        failed: emailResults.failed.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-calendar-invite-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send invite emails" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
