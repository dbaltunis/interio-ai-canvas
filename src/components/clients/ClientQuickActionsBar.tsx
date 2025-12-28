import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, FileText, StickyNote, Briefcase, Copy } from 'lucide-react';
import { QuickEmailDialog } from './QuickEmailDialog';
import { AddActivityDialog } from './AddActivityDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;

  const handleCall = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`);
      toast.success(`Calling ${displayName}...`);
    } else {
      toast.error("No phone number available");
    }
  };

  const handleCopyEmail = () => {
    if (client.email) {
      navigator.clipboard.writeText(client.email);
      toast.success("Email copied to clipboard");
    }
  };

  const handleCreateQuote = () => {
    // Navigate to quotes tab with client pre-selected
    navigate(`/?tab=quotes&newQuote=true&clientId=${client.id}`);
  };

  const handleCreateProject = () => {
    // Navigate to projects tab with client pre-selected
    navigate(`/?tab=projects&newProject=true&clientId=${client.id}`);
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

        {/* Create Quote */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateQuote}
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Quote</span>
        </Button>

        {/* Create Project */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateProject}
          className="gap-1.5"
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Project</span>
        </Button>

        {/* Copy Email (if available) */}
        {client.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyEmail}
            className="gap-1.5 text-muted-foreground"
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
