import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserInvitation {
  id: string;
  invited_email: string;
  invited_name?: string;
  role: string;
  permissions?: any;
  status: string;
  expires_at: string;
  invited_by_name?: string;
  invited_by_email?: string;
  created_at: string;
  invitation_token?: string;
}

export const useUserInvitations = () => {
  return useQuery({
    queryKey: ["user-invitations"],
    queryFn: async (): Promise<UserInvitation[]> => {
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitation: {
      invited_email: string;
      invited_name?: string;
      role: string;
      permissions?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to send invitations. Please log in and try again.");
      }

      // Get user profile for inviter details
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("display_name, role")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        throw new Error("Unable to verify your account. Please ensure you have proper permissions.");
      }

      // Check if user already exists
      const { data: existingInvite } = await supabase
        .from("user_invitations")
        .select("id, status")
        .eq("invited_email", invitation.invited_email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        throw new Error(`An invitation has already been sent to ${invitation.invited_email}. Please cancel the existing invitation first.`);
      }

      const invitationData = {
        user_id: user.id,
        invited_email: invitation.invited_email,
        invited_name: invitation.invited_name,
        role: invitation.role,
        permissions: invitation.permissions || {},
        invited_by_name: profile?.display_name || user.email,
        invited_by_email: user.email,
      };

      const { data, error } = await supabase
        .from("user_invitations")
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("A pending invitation already exists for this email address.");
        }
        throw new Error(error.message || "Failed to create invitation. Please try again.");
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke("send-invitation", {
        body: {
          invitedEmail: invitation.invited_email,
          invitedName: invitation.invited_name || '',
          inviterName: profile?.display_name || user.email || 'Team Member',
          inviterEmail: user.email || '',
          role: invitation.role,
          invitationToken: data.invitation_token,
        },
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't throw error - invitation was created successfully
        // We'll show a warning in the success handler instead
        return { ...data, emailSent: false, emailError: emailError.message };
      }

      return { ...data, emailSent: true };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      
      if (data?.emailSent === false) {
        // Invitation created but email failed to send
        const invitationLink = `${window.location.origin}/auth?invitation=${data.invitation_token}`;
        
        // Copy link to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(invitationLink).catch(() => {
            console.error('Failed to copy invitation link');
          });
        }
        
        toast({
          title: "⚠️ Invitation created (Email not sent)",
          description: "Invitation created but email couldn't be sent. The invitation link has been copied to your clipboard. Configure SendGrid in Settings → Integrations to enable email invitations.",
          variant: "default",
          duration: 10000,
        });
      } else {
        // Email sent successfully
        toast({
          title: "✓ Invitation sent successfully",
          description: "The team member will receive an email with instructions to join.",
          importance: 'important',
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to create invitation:", error);
      
      // Check if it's a SendGrid configuration error
      if (error.message?.includes('SendGrid')) {
        toast({
          title: "❌ SendGrid not configured",
          description: "To send invitation emails, please configure SendGrid in Settings → Integrations first.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Failed to send invitation",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("user_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive",
      });
    },
  });
};

export const useResendInvitation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitation: UserInvitation) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      // Ensure we have a valid token; fetch from DB if missing
      let token = invitation.invitation_token;
      if (!token) {
        const { data: tokenRow, error: tokenError } = await supabase
          .from("user_invitations")
          .select("invitation_token")
          .eq("id", invitation.id)
          .single();
        if (tokenError) throw tokenError;
        token = tokenRow?.invitation_token;
      }

      if (!token) {
        throw new Error("Invitation token not found for this invite.");
      }

      const { error } = await supabase.functions.invoke("send-invitation", {
        body: {
          invitedEmail: invitation.invited_email,
          invitedName: invitation.invited_name || "",
          inviterName: profile?.display_name || user.email || "Team Member",
          inviterEmail: user.email || "",
          role: invitation.role,
          invitationToken: token,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invitation re-sent",
        description: "We have re-sent the invitation email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation.",
        variant: "destructive",
      });
    },
  });
};
