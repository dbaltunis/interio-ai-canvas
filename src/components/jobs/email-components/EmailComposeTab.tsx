
import { ClientSelector } from "./ClientSelector";
import { QuoteSelector } from "./QuoteSelector";
import { EmailComposer } from "./EmailComposer";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

interface EmailComposeTabProps {
  selectedClients: any[];
  setSelectedClients: (clients: any[]) => void;
  selectedQuotes: any[];
  setSelectedQuotes: (quotes: any[]) => void;
  newEmail: any;
  setNewEmail: (email: any) => void;
  onSendEmail: (attachments?: File[]) => void;
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  sendEmailMutation: any;
  emailSettings: any;
}

export const EmailComposeTab = ({
  selectedClients,
  setSelectedClients,
  selectedQuotes,
  setSelectedQuotes,
  newEmail,
  setNewEmail,
  onSendEmail,
  previewDialogOpen,
  setPreviewDialogOpen,
  sendEmailMutation,
  emailSettings
}: EmailComposeTabProps) => {
  return (
    <div className="space-y-4">
      {/* Client and Quote Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ClientSelector 
          selectedClients={selectedClients}
          onSelectionChange={setSelectedClients}
        />
        <QuoteSelector 
          selectedQuotes={selectedQuotes}
          onSelectionChange={setSelectedQuotes}
          selectedClients={selectedClients}
        />
      </div>

      {/* Email Composer with Appointment Scheduler Integration */}
      <EmailComposer
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        selectedClients={selectedClients}
        selectedQuotes={selectedQuotes}
        onSendEmail={onSendEmail}
        onPreviewEmail={() => setPreviewDialogOpen(true)}
        sendEmailMutation={sendEmailMutation}
        emailSettings={emailSettings}
      />

      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        isOpen={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        template={{
          id: 'custom',
          name: 'Custom Email',
          subject: newEmail.subject,
          content: newEmail.content,
          category: 'Custom',
          variables: []
        }}
        clientData={selectedClients[0]}
        quoteData={selectedQuotes[0]}
        senderInfo={emailSettings}
      />
    </div>
  );
};
