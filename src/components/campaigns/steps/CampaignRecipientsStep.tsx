import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, CheckCircle2, Send, Clock, Star, Filter, Users, ChevronDown, ChevronUp, Search } from "lucide-react";
import { SelectedClient } from "@/hooks/useClientSelection";

interface CampaignRecipientsStepProps {
  recipients: SelectedClient[];
  allSelected: SelectedClient[];
  onUpdateRecipients: (recipients: SelectedClient[]) => void;
}

// Funnel stage colors and labels
const STAGE_CONFIG: Record<string, { color: string; bgColor: string; label: string; priority: number }> = {
  'lead': { color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', label: 'New Lead', priority: 1 },
  'contacted': { color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200', label: 'Contacted', priority: 2 },
  'measuring_scheduled': { color: 'text-cyan-700', bgColor: 'bg-cyan-100 border-cyan-200', label: 'Measuring', priority: 3 },
  'quoted': { color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', label: 'Quoted', priority: 4 },
  'approved': { color: 'text-green-700', bgColor: 'bg-green-100 border-green-200', label: 'Approved', priority: 5 },
  'completed': { color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-200', label: 'Completed', priority: 6 },
};

export const CampaignRecipientsStep = ({
  recipients,
  allSelected,
  onUpdateRecipients,
}: CampaignRecipientsStepProps) => {
  const [groupByStage, setGroupByStage] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['lead', 'contacted', 'quoted']));
  const [searchQuery, setSearchQuery] = useState("");
  
  const withEmail = allSelected.filter(c => c.email);
  const withoutEmail = allSelected.filter(c => !c.email);

  // Filter contacts based on search query
  const filteredWithEmail = useMemo(() => {
    if (!searchQuery.trim()) return withEmail;
    const query = searchQuery.toLowerCase();
    return withEmail.filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.company_name?.toLowerCase().includes(query)
    );
  }, [withEmail, searchQuery]);

  // Group clients by funnel stage (using filtered list)
  const groupedClients = useMemo(() => {
    const groups: Record<string, SelectedClient[]> = {};
    filteredWithEmail.forEach(client => {
      const stage = client.funnel_stage || 'unknown';
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(client);
    });
    
    // Sort groups by priority
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
      const priorityA = STAGE_CONFIG[a]?.priority || 99;
      const priorityB = STAGE_CONFIG[b]?.priority || 99;
      return priorityA - priorityB;
    });
    
    return sortedEntries;
  }, [filteredWithEmail]);

  const toggleRecipient = (client: SelectedClient) => {
    const exists = recipients.find(r => r.id === client.id);
    if (exists) {
      onUpdateRecipients(recipients.filter(r => r.id !== client.id));
    } else {
      onUpdateRecipients([...recipients, client]);
    }
  };

  const selectAll = () => onUpdateRecipients(withEmail);
  const clearAll = () => onUpdateRecipients([]);
  
  const selectGroup = (clients: SelectedClient[]) => {
    const newRecipients = [...recipients];
    clients.forEach(c => {
      if (!newRecipients.find(r => r.id === c.id)) {
        newRecipients.push(c);
      }
    });
    onUpdateRecipients(newRecipients);
  };

  const toggleGroup = (stage: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedGroups(newExpanded);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const getAvatarGradient = (stage?: string) => {
    switch (stage) {
      case 'lead': return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'contacted': return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'measuring_scheduled': return 'bg-gradient-to-br from-cyan-400 to-cyan-600';
      case 'quoted': return 'bg-gradient-to-br from-amber-400 to-amber-600';
      case 'approved': return 'bg-gradient-to-br from-green-400 to-green-600';
      case 'completed': return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const getStageLabel = (stage: string) => STAGE_CONFIG[stage]?.label || stage.replace('_', ' ');
  const getStageStyle = (stage: string) => STAGE_CONFIG[stage] || { color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200' };

  const renderClientRow = (client: SelectedClient) => {
    const isSelected = recipients.some(r => r.id === client.id);
    const stageConfig = getStageStyle(client.funnel_stage || '');
    
    return (
      <div
        key={client.id}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          isSelected 
            ? 'bg-primary/10 border-2 border-primary/30 shadow-sm' 
            : 'hover:bg-muted/70 border-2 border-transparent'
        }`}
        onClick={() => toggleRecipient(client)}
      >
        <Checkbox checked={isSelected} className="data-[state=checked]:bg-primary" />
        <Avatar className="h-9 w-9 shadow-sm">
          <AvatarFallback className={`${getAvatarGradient(client.funnel_stage)} text-white text-xs font-medium`}>
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {client.company_name || client.name}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">{client.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Last contact indicator (mock - would come from real data) */}
          <Badge variant="outline" className="text-[10px] gap-1 bg-muted/50">
            <Clock className="h-2.5 w-2.5" />
            Recent
          </Badge>
          {client.funnel_stage && (
            <Badge className={`text-[10px] border ${stageConfig.bgColor} ${stageConfig.color}`}>
              {getStageLabel(client.funnel_stage)}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Select Recipients</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{recipients.length}</span> of {withEmail.length} contacts selected
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={groupByStage ? "secondary" : "outline"}
              size="sm"
              onClick={() => setGroupByStage(!groupByStage)}
              className="gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              Group
            </Button>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <span className="text-lg font-bold text-green-700">{withEmail.length}</span>
              <span className="text-xs text-green-600 ml-1">with email</span>
            </div>
          </div>
        </div>
        {withoutEmail.length > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="text-lg font-bold text-amber-700">{withoutEmail.length}</span>
                <span className="text-xs text-amber-600 ml-1">no email</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipients List */}
      <ScrollArea className="h-[400px] rounded-xl border border-border bg-muted/20">
        <div className="p-3 space-y-2">
          {groupByStage ? (
            // Grouped View
            groupedClients.map(([stage, clients]) => {
              const isExpanded = expandedGroups.has(stage);
              const selectedInGroup = clients.filter(c => recipients.some(r => r.id === c.id)).length;
              const stageConfig = getStageStyle(stage);
              
              return (
                <div key={stage} className="space-y-1">
                  {/* Group Header */}
                  <div 
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${stageConfig.bgColor} border`}
                    onClick={() => toggleGroup(stage)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <Users className="h-4 w-4" />
                      <span className={`font-medium text-sm ${stageConfig.color}`}>
                        {getStageLabel(stage)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedInGroup}/{clients.length}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => { e.stopPropagation(); selectGroup(clients); }}
                    >
                      Select All
                    </Button>
                  </div>
                  
                  {/* Group Content */}
                  {isExpanded && (
                    <div className="pl-2 space-y-1">
                      {clients.map(renderClientRow)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Flat List View
            filteredWithEmail.map(renderClientRow)
          )}
        </div>
      </ScrollArea>

      {/* No email warning */}
      {withoutEmail.length > 0 && (
        <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span><strong>{withoutEmail.length} contacts</strong> don't have email addresses and won't receive the campaign.</span>
        </div>
      )}
    </div>
  );
};
