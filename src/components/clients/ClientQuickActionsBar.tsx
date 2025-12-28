import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, StickyNote, Briefcase, Loader2 } from 'lucide-react';
import { QuickEmailDialog } from './QuickEmailDialog';
import { AddActivityDialog } from './AddActivityDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  client_type?: string;
}

interface ClientQuickActionsBarProps {
  client: Client;
}

export const ClientQuickActionsBar = ({ client }: ClientQuickActionsBarProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;

  const handleCall = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`);
      toast.success(`Calling ${displayName}...`);
    } else {
      toast.error("No phone number available");
    }
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      console.log('[QuickActions] Creating new project for client:', client.id);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a project");
        return;
      }

      // Get account owner for team members
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();
      
      const accountOwnerId = profile?.parent_account_id || user.id;

      // Generate job number
      let jobNumber: string;
      const { data: generatedNumber, error: seqError } = await supabase.rpc("get_next_sequence_number", {
        p_user_id: accountOwnerId,
        p_entity_type: "job",
      });
      
      if (seqError) {
        console.error("Error generating job number:", seqError);
        jobNumber = `JOB-${Date.now()}`;
      } else {
        jobNumber = generatedNumber || `JOB-${Date.now()}`;
      }

      // Get first Project status using accountOwnerId
      const { data: firstStatus } = await supabase
        .from("job_statuses")
        .select("id")
        .eq("user_id", accountOwnerId)
        .eq("category", "Project")
        .eq("is_active", true)
        .order("slot_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      // Create the project
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: `New Job ${new Date().toLocaleDateString()}`,
          description: "",
          status: "planning",
          client_id: client.id,
          user_id: user.id,
          job_number: jobNumber,
          status_id: firstStatus?.id || null,
        })
        .select()
        .single();

      if (projectError) {
        console.error('[QuickActions] Failed to create project:', projectError);
        throw projectError;
      }

      console.log('[QuickActions] Project created:', newProject.id);

      // Create a quote for this project
      const { error: quoteError } = await supabase
        .from("quotes")
        .insert({
          project_id: newProject.id,
          client_id: client.id,
          user_id: user.id,
          status: "draft",
          subtotal: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 0,
          notes: "New job created",
          quote_number: `QT-${Date.now()}`,
        });

      if (quoteError) {
        console.error('[QuickActions] Failed to create quote:', quoteError);
        // Don't throw - project was created, just log the quote error
      }

      console.log('[QuickActions] Quote created, invalidating queries and navigating');

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });

      // Navigate to the projects tab with the new job opened
      navigate(`/?tab=projects&jobId=${newProject.id}`);

      toast.success("Project created successfully");
    } catch (error: any) {
      console.error('[QuickActions] Failed to create project:', error);
      toast.error(error.message || "Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Email Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmailDialogOpen(true)}
          disabled={!client.email}
          className="gap-1.5"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </Button>

        {/* Call Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCall}
          disabled={!client.phone}
          className="gap-1.5"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Call</span>
        </Button>

        {/* Add Note */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNoteDialogOpen(true)}
          className="gap-1.5"
        >
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Log Activity</span>
        </Button>

        {/* Create Project */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateProject}
          disabled={isCreatingProject}
          className="gap-1.5"
        >
          {isCreatingProject ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Briefcase className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isCreatingProject ? "Creating..." : "New Project"}
          </span>
        </Button>
      </div>

      <QuickEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        client={{
          id: client.id,
          name: displayName || client.name,
          email: client.email
        }}
      />
      
      <AddActivityDialog
        clientId={client.id}
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
      />
    </>
  );
};
