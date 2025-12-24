import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { SelectedClient } from "@/hooks/useClientSelection";

interface CampaignRecipientsStepProps {
  recipients: SelectedClient[];
  allSelected: SelectedClient[];
  onUpdateRecipients: (recipients: SelectedClient[]) => void;
}

export const CampaignRecipientsStep = ({
  recipients,
  allSelected,
  onUpdateRecipients,
}: CampaignRecipientsStepProps) => {
  const withEmail = allSelected.filter(c => c.email);
  const withoutEmail = allSelected.filter(c => !c.email);

  const toggleRecipient = (client: SelectedClient) => {
    const exists = recipients.find(r => r.id === client.id);
    if (exists) {
      onUpdateRecipients(recipients.filter(r => r.id !== client.id));
    } else {
      onUpdateRecipients([...recipients, client]);
    }
  };

  const selectAll = () => {
    onUpdateRecipients(withEmail);
  };

  const clearAll = () => {
    onUpdateRecipients([]);
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Campaign Recipients</h3>
          <p className="text-sm text-muted-foreground">
            {recipients.length} of {withEmail.length} contacts selected
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={selectAll}
          >
            Select All
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={clearAll}
          >
            Clear
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {withEmail.length} with email
            </span>
          </div>
        </div>
        {withoutEmail.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {withoutEmail.length} without email
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recipients List */}
      <ScrollArea className="h-[280px] rounded-lg border border-border">
        <div className="p-2 space-y-1">
          {withEmail.map((client) => {
            const isSelected = recipients.some(r => r.id === client.id);
            return (
              <div
                key={client.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted'
                }`}
                onClick={() => toggleRecipient(client)}
              >
                <Checkbox checked={isSelected} />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${getAvatarColor(client.name)} text-white text-xs`}>
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {client.company_name || client.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </div>
                </div>
                {client.funnel_stage && (
                  <Badge variant="outline" className="text-xs">
                    {client.funnel_stage}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* No email warning */}
      {withoutEmail.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <strong>{withoutEmail.length} contacts</strong> don't have email addresses and won't receive the campaign.
        </div>
      )}
    </div>
  );
};
