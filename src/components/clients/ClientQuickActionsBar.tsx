import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, StickyNote, Briefcase, Copy, Loader2 } from 'lucide-react';
import { QuickEmailDialog } from './QuickEmailDialog';
import { AddActivityDialog } from './AddActivityDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/hooks/useProjects';
import { useCreateQuote } from '@/hooks/useQuotes';

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
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;

  const handleCall = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`);
      toast.success(`Calling ${displayName}...`);
    } else {
      toast.error("No phone number available");
    }
  };

  const handleCopyEmail = async () => {
    if (client.email) {
      try {
        await navigator.clipboard.writeText(client.email);
        toast.success("Email copied to clipboard");
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = client.email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Email copied to clipboard");
      }
    }
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      console.log('[QuickActions] Creating new project for client:', client.id);
      
      // Create the project
      const newProject = await createProject.mutateAsync({
        name: `New Job ${new Date().toLocaleDateString()}`,
        description: "",
        status: "planning",
        client_id: client.id
      });

      console.log('[QuickActions] Project created:', newProject.id);

      // Create a quote for this project
      await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: client.id,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created",
      });

      console.log('[QuickActions] Quote created, navigating to project');

      // Navigate to the projects tab with the new job opened
      navigate(`/?tab=projects&jobId=${newProject.id}`);

      toast.success("Project created successfully");
    } catch (error) {
      console.error('[QuickActions] Failed to create project:', error);
      toast.error("Failed to create project. Please try again.");
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
          <span className="hidden sm:inline">Note</span>
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

        {/* Copy Email (if available) */}
        {client.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyEmail}
            className="gap-1.5 text-muted-foreground"
            title="Copy email to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
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
