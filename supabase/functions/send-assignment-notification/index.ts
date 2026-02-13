import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AssignmentNotificationRequest {
  assignedUserId: string;
  projectId: string;
  projectName: string;
  clientName?: string;
  assignedByName: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Processing assignment notification request...");

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { assignedUserId, projectId, projectName, clientName, assignedByName }: AssignmentNotificationRequest = await req.json();

    // Validate required fields
    if (!assignedUserId || !projectId || !projectName) {
      console.error("Missing required fields:", { assignedUserId, projectId, projectName });
      return new Response(
        JSON.stringify({ error: "Missing required fields: assignedUserId, projectId, projectName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching email for user: ${assignedUserId}`);

    // Get the assigned user's email from auth.users via service role
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(assignedUserId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to fetch user email:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find user email", details: userError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = userData.user.email;
    console.log(`Sending email to: ${userEmail}`);

    // Get business settings for email branding
    const { data: businessSettings } = await supabase
      .from("business_settings")
      .select("company_name, company_logo_url, business_email")
      .limit(1)
      .maybeSingle();

    const companyName = businessSettings?.company_name || "InterioApp";
    const siteUrl = Deno.env.get("SITE_URL") || "https://interioapp-ai.lovable.app";
    const projectUrl = `${siteUrl}/?jobId=${projectId}`;

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Send email
    const emailResult = await resend.emails.send({
      from: `${companyName} <notifications@interioapp.com>`,
      to: [userEmail],
      subject: `You've been assigned to: ${projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Project Assignment</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 New Project Assignment</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-top: 0;">Hello,</p>
            
            <p style="font-size: 16px;"><strong>${assignedByName}</strong> has assigned you to the following project:</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h2 style="margin: 0 0 10px 0; color: #333; font-size: 20px;">${projectName}</h2>
              ${clientName ? `<p style="margin: 0; color: #666;">Client: <strong>${clientName}</strong></p>` : ''}
            </div>
            
            <p style="font-size: 16px;">You now have access to view and work on this project. Click the button below to open the project details:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${projectUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Project →
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">
              This email was sent by ${companyName}. If you have questions about this assignment, please contact your team administrator.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResult.error) {
      console.error("Resend email error:", emailResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailResult.data?.id);

    // Also create an in-app notification for the assigned user
    try {
      await supabase
        .from("notifications")
        .insert({
          user_id: assignedUserId,
          type: "info",
          title: "New Project Assignment",
          message: `${assignedByName} assigned you to "${projectName}"${clientName ? ` (Client: ${clientName})` : ''}`,
          category: "project",
          source_type: "project",
          source_id: projectId,
          action_url: `/?jobId=${projectId}`,
        });
      console.log("In-app notification created for assigned user");
    } catch (notifError: any) {
      // Non-fatal: email was already sent
      console.warn("Failed to create in-app notification:", notifError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.data?.id,
        sentTo: userEmail 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in send-assignment-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
