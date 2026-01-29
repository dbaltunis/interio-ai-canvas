import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, CheckCircle2, Search, User } from "lucide-react";
import { SelectedClient } from "@/hooks/useClientSelection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CampaignRecipientsStepProps {
  recipients: SelectedClient[];
  allSelected: SelectedClient[];
  onUpdateRecipients: (recipients: SelectedClient[]) => void;
}

// Simple stage labels for filter dropdown
const STAGE_OPTIONS = [
  { value: 'all', label: 'All Contacts' },
  { value: 'lead', label: 'New Leads' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'measuring_scheduled', label: 'Measuring' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
];

export const CampaignRecipientsStep = ({
  recipients,
  allSelected,
  onUpdateRecipients,
}: CampaignRecipientsStepProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  
  const withEmail = allSelected.filter(c => c.email);
  const withoutEmail = allSelected.filter(c => !c.email);

  // Filter contacts based on search query and stage filter
  const filteredWithEmail = useMemo(() => {
    let filtered = withEmail;
    
    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(client => client.funnel_stage === stageFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.company_name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [withEmail, searchQuery, stageFilter]);

  const toggleRecipient = (client: SelectedClient) => {
    const exists = recipients.find(r => r.id === client.id);
    if (exists) {
      onUpdateRecipients(recipients.filter(r => r.id !== client.id));
    } else {
      onUpdateRecipients([...recipients, client]);
    }
  };

  const selectAll = () => onUpdateRecipients(filteredWithEmail);
  const clearAll = () => onUpdateRecipients([]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const renderClientRow = (client: SelectedClient) => {
    const isSelected = recipients.some(r => r.id === client.id);
    
    return (
      <div
        key={client.id}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
          isSelected 
            ? 'bg-primary/5 border-primary/20' 
            : 'hover:bg-muted/50 border-transparent'
        }`}
        onClick={() => toggleRecipient(client)}
      >
        <Checkbox checked={isSelected} className="data-[state=checked]:bg-primary" />
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted text-xs font-medium">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {client.company_name || client.name}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{client.email}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-lg mb-1">Who are you emailing?</h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">{recipients.length}</span> of {withEmail.length} contacts selected
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        {/* Stage Filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-9">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="h-9">
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9">
            Clear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{withEmail.length} with email</span>
        </div>
        {withoutEmail.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span>{withoutEmail.length} without email</span>
          </div>
        )}
      </div>

      {/* Recipients List - Clean flat list */}
      <ScrollArea className="h-[350px] rounded-lg border bg-background">
        <div className="p-2 space-y-1">
          {filteredWithEmail.length > 0 ? (
            filteredWithEmail.map(renderClientRow)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || stageFilter !== 'all' 
                  ? "No contacts match your filters"
                  : "No contacts with email addresses"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* No email warning */}
      {withoutEmail.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {withoutEmail.length} contacts without email addresses won't receive this campaign.
        </p>
      )}
    </div>
  );
};
