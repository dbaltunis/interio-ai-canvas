import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  StickyNote,
  Briefcase,
  Loader2,
  MessageSquare,
  Edit,
  Calendar,
} from 'lucide-react';
import { QuickEmailDialog } from './QuickEmailDialog';
import { AddActivityDialog } from './AddActivityDialog';
import { MessagePreviewDrawer } from '@/components/messaging/MessagePreviewDrawer';
import { UnifiedAppointmentDialog } from '@/components/calendar/UnifiedAppointmentDialog';
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
  onEdit?: () => void;
  canEditClient?: boolean;
}

export const ClientQuickActionsBar = ({
  client,
  onEdit,
  canEditClient,
}: ClientQuickActionsBarProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const displayName =
    client.client_type === 'B2B' ? client.company_name : client.name;

  const handleCall = () => {
    if (!client.phone) {
      toast.error('No phone number available');
      return;
    }

    window.open(`tel:${client.phone}`);
    toast.success(`Calling ${displayName}...`);
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();

      const accountOwnerId = profile?.parent_account_id || user.id;

      const { data: generatedNumber } = await supabase.rpc(
        'get_next_sequence_number',
        {
          p_user_id: accountOwnerId,
          p_entity_type: 'job',
        }
      );

      const jobNumber = generatedNumber || `JOB-${Date.now()}`;

      const { data: firstStatus } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('user_id', accountOwnerId)
        .eq('category', 'Project')
        .eq('is_active', true)
        .order('slot_number', { ascending: true })
        .limit(1)
        .maybeSingle();

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          name: `New Job ${new Date().toLocaleDateString()}`,
          description: '',
          status: 'planning',
          client_id: client.id,
          user_id: user.id,
          job_number: jobNumber,
          status_id: firstStatus?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('quotes').insert({
        project_id: newProject.id,
        client_id: client.id,
        user_id: user.id,
        status: 'draft',
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: 'New job created',
        quote_number: `QT-${Date.now()}`,
      });

      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });

      navigate(`/?tab=projects&jobId=${newProject.id}`);
      toast.success('Project created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Email */}
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

        {/* Call */}
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

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessageDrawerOpen(true)}
          disabled={!client.phone}
          className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        {/* Schedule Event */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScheduleDialogOpen(true)}
          className="gap-1.5"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>

        {/* Log Activity */}
        {canEditClient && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNoteDialogOpen(true)}
            className="gap-1.5"
          >
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">Log Activity</span>
          </Button>
        )}

        {/* New Project */}
        {canEditClient && (
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
              {isCreatingProject ? 'Creating...' : 'New Project'}
            </span>
          </Button>
        )}

        {/* Edit */}
        {onEdit && canEditClient && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      <QuickEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        client={{
          id: client.id,
          name: displayName || client.name,
          email: client.email,
        }}
      />

      <AddActivityDialog
        clientId={client.id}
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
      />
      <MessagePreviewDrawer
        open={messageDrawerOpen}
        onOpenChange={setMessageDrawerOpen}
        clientId={client.id}
        clientName={displayName || client.name}
        clientPhone={client.phone}
        channelFilter="whatsapp"
      />
      <UnifiedAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />
    </>
  );
};
