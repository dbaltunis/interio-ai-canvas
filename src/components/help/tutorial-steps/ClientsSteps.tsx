import React from "react";
import { motion } from "framer-motion";
import { 
  Users, Search, Filter, Plus, Mail, Download, Trash2, X, Check,
  Phone, MapPin, ChevronDown, MoreHorizontal, Star, Calendar
} from "lucide-react";
import { PulsingHighlight, MockCard, MockButton, MockBadge } from "../TutorialVisuals";

// ===========================================
// MOCK COMPONENTS FOR CLIENTS PAGE DEMO
// ===========================================

// Stage badge with colors
const MockStageBadge = ({ 
  stage, 
  highlight = false 
}: { 
  stage: "Lead" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  highlight?: boolean;
}) => {
  const colors: Record<string, string> = {
    Lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    Qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    Proposal: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    Negotiation: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    Won: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    Lost: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[stage]} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}>
      {stage}
    </span>
  );
};

// Client avatar
const MockAvatar = ({ name, className = "" }: { name: string; className?: string }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
  const colorIndex = name.length % colors.length;
  
  return (
    <div className={`h-8 w-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-medium ${className}`}>
      {initials}
    </div>
  );
};

// Checkbox component
const MockCheckbox = ({ checked = false, highlight = false }: { checked?: boolean; highlight?: boolean }) => (
  <div className={`h-4 w-4 rounded border ${checked ? "bg-primary border-primary" : "border-muted-foreground/40 bg-background"} flex items-center justify-center transition-all ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}>
    {checked && <Check className="h-3 w-3 text-primary-foreground" />}
  </div>
);

// Single client row
interface ClientRowProps {
  name: string;
  email: string;
  stage: "Lead" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  projects: number;
  value: string;
  selected?: boolean;
  highlighted?: boolean;
  checkboxHighlight?: boolean;
}

const MockClientRow = ({ 
  name, 
  email, 
  stage, 
  projects, 
  value, 
  selected = false,
  highlighted = false,
  checkboxHighlight = false,
}: ClientRowProps) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 border-b border-border/50 transition-all ${selected ? "bg-primary/5" : highlighted ? "bg-accent/50" : "bg-background"}`}>
    <MockCheckbox checked={selected} highlight={checkboxHighlight} />
    <MockAvatar name={name} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium truncate">{name}</span>
        <MockStageBadge stage={stage} />
      </div>
      <span className="text-[10px] text-muted-foreground truncate block">{email}</span>
    </div>
    <div className="text-right shrink-0">
      <div className="text-xs font-medium">{value}</div>
      <div className="text-[10px] text-muted-foreground">{projects} project{projects !== 1 ? "s" : ""}</div>
    </div>
  </div>
);

// Table header row
const MockTableHeader = ({ selectAllHighlight = false }: { selectAllHighlight?: boolean }) => (
  <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
    <MockCheckbox highlight={selectAllHighlight} />
    <span className="flex-1">Client</span>
    <span className="w-20 text-right">Value</span>
  </div>
);

// Bulk actions bar
interface BulkActionsBarProps {
  count: number;
  emailHighlight?: boolean;
  exportHighlight?: boolean;
  deleteHighlight?: boolean;
  closeHighlight?: boolean;
  zoomIn?: boolean;
}

const MockBulkActionsBar = ({ 
  count, 
  emailHighlight = false, 
  exportHighlight = false, 
  deleteHighlight = false,
  closeHighlight = false,
  zoomIn = false,
}: BulkActionsBarProps) => (
  <motion.div 
    className={`flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-lg shadow-lg ${zoomIn ? "" : ""}`}
    initial={zoomIn ? { scale: 1 } : { y: 20, opacity: 0 }}
    animate={zoomIn ? { scale: 1.15 } : { y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
        <Users className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{count}</span>
      </div>
      <span className="text-xs text-muted-foreground">selected</span>
    </div>
    
    <div className="flex items-center gap-2">
      <PulsingHighlight className={emailHighlight ? "" : "hidden"}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium cursor-pointer hover:bg-secondary/80">
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
        </div>
      </PulsingHighlight>
      {!emailHighlight && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium">
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
        </div>
      )}
      
      <PulsingHighlight className={exportHighlight ? "" : "hidden"}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium cursor-pointer hover:bg-secondary/80">
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </div>
      </PulsingHighlight>
      {!exportHighlight && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium">
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </div>
      )}
      
      <PulsingHighlight className={deleteHighlight ? "" : "hidden"}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </div>
      </PulsingHighlight>
      {!deleteHighlight && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium">
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </div>
      )}
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <PulsingHighlight className={closeHighlight ? "" : "hidden"}>
        <div className="p-1.5 hover:bg-muted rounded cursor-pointer">
          <X className="h-4 w-4" />
        </div>
      </PulsingHighlight>
      {!closeHighlight && (
        <div className="p-1.5 hover:bg-muted rounded cursor-pointer">
          <X className="h-4 w-4" />
        </div>
      )}
    </div>
  </motion.div>
);

// Sample client data
const sampleClients: ClientRowProps[] = [
  { name: "Sarah Johnson", email: "sarah@designstudio.com", stage: "Qualified", projects: 3, value: "$12,450" },
  { name: "Michael Chen", email: "m.chen@homeinteriors.au", stage: "Proposal", projects: 2, value: "$8,900" },
  { name: "Emma Williams", email: "emma.w@gmail.com", stage: "Lead", projects: 0, value: "$0" },
  { name: "James Brown", email: "james.b@corporate.com", stage: "Won", projects: 5, value: "$45,200" },
  { name: "Lisa Anderson", email: "lisa@modernliving.co", stage: "Contacted", projects: 1, value: "$3,500" },
];

// ===========================================
// STEP COMPONENTS (12 Steps)
// ===========================================

// Step 1: Clients Table Overview
export const ClientsStep1 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
          <MockBadge variant="secondary">127</MockBadge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-md text-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Search...</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-md text-xs">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium">
            <Plus className="h-3.5 w-3.5" />
            <span>New Client</span>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <MockTableHeader />
      {sampleClients.slice(0, 4).map((client, i) => (
        <MockClientRow key={i} {...client} />
      ))}
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Your clients table shows all contacts with their stage, projects, and value
    </p>
  </div>
);

// Step 2: Search and Filter
export const ClientsStep2 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <PulsingHighlight>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-primary rounded-md text-xs">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground">Sarah...</span>
            </div>
          </PulsingHighlight>
          <PulsingHighlight>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
              <Filter className="h-3.5 w-3.5" />
              <span>Stage: Qualified</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </PulsingHighlight>
        </div>
      </div>
      
      <MockTableHeader />
      <MockClientRow {...sampleClients[0]} highlighted />
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Use search and filters to quickly find specific clients
    </p>
  </div>
);

// Step 3: New Client Button
export const ClientsStep3 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-md text-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Search...</span>
          </div>
          <PulsingHighlight>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span>New Client</span>
            </div>
          </PulsingHighlight>
        </div>
      </div>
      
      <MockTableHeader />
      {sampleClients.slice(0, 3).map((client, i) => (
        <MockClientRow key={i} {...client} />
      ))}
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Click "New Client" to add a new contact to your CRM
    </p>
  </div>
);

// Step 4: Header Checkbox Explanation
export const ClientsStep4 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
        </div>
      </div>
      
      <MockTableHeader selectAllHighlight />
      {sampleClients.slice(0, 4).map((client, i) => (
        <MockClientRow key={i} {...client} checkboxHighlight={i === 0} />
      ))}
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Use checkboxes to select clients for bulk actions
    </p>
  </div>
);

// Step 5: First Client Selected
export const ClientsStep5 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
        </div>
      </div>
      
      <MockTableHeader />
      <MockClientRow {...sampleClients[0]} selected />
      <MockClientRow {...sampleClients[1]} checkboxHighlight />
      {sampleClients.slice(2, 4).map((client, i) => (
        <MockClientRow key={i} {...client} />
      ))}
    </MockCard>
    <motion.div 
      className="flex items-center justify-center gap-2 text-xs text-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Check className="h-3.5 w-3.5" />
      <span>1 client selected - click another to add to selection</span>
    </motion.div>
  </div>
);

// Step 6: Two Clients Selected
export const ClientsStep6 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Clients</span>
        </div>
      </div>
      
      <MockTableHeader />
      <MockClientRow {...sampleClients[0]} selected />
      <MockClientRow {...sampleClients[1]} selected />
      {sampleClients.slice(2, 4).map((client, i) => (
        <MockClientRow key={i} {...client} />
      ))}
    </MockCard>
    <motion.div 
      className="flex items-center justify-center gap-2 text-xs text-primary font-medium"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <Users className="h-3.5 w-3.5" />
      <span>2 clients selected!</span>
    </motion.div>
  </div>
);

// Step 7: Bulk Actions Bar Appears
export const ClientsStep7 = () => (
  <div className="space-y-3">
    <MockCard className="overflow-hidden">
      <MockTableHeader />
      <MockClientRow {...sampleClients[0]} selected />
      <MockClientRow {...sampleClients[1]} selected />
      <MockClientRow {...sampleClients[2]} />
    </MockCard>
    
    <MockBulkActionsBar count={2} />
    
    <p className="text-[10px] text-muted-foreground text-center">
      The bulk actions bar appears when clients are selected
    </p>
  </div>
);

// Step 8: Zoom Into Bulk Actions Bar
export const ClientsStep8 = () => (
  <div className="space-y-3 flex flex-col items-center justify-center">
    <p className="text-xs font-medium text-foreground mb-2">Bulk Actions Available:</p>
    <MockBulkActionsBar count={2} zoomIn />
    <div className="space-y-2 mt-4 text-center">
      <p className="text-[10px] text-muted-foreground">
        Take action on all selected clients at once
      </p>
    </div>
  </div>
);

// Step 9: Email Button Highlighted
export const ClientsStep9 = () => (
  <div className="space-y-4 flex flex-col items-center justify-center">
    <MockBulkActionsBar count={2} emailHighlight zoomIn />
    
    <motion.div 
      className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg max-w-[240px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Send Email Campaign</p>
          <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5">
            Compose and send personalized emails to all selected clients
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);

// Step 10: Export Button Highlighted
export const ClientsStep10 = () => (
  <div className="space-y-4 flex flex-col items-center justify-center">
    <MockBulkActionsBar count={2} exportHighlight zoomIn />
    
    <motion.div 
      className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg max-w-[240px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Download className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-green-900 dark:text-green-100">Export to CSV</p>
          <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">
            Download selected client data as a spreadsheet for external use
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);

// Step 11: Delete Button Highlighted
export const ClientsStep11 = () => (
  <div className="space-y-4 flex flex-col items-center justify-center">
    <MockBulkActionsBar count={2} deleteHighlight zoomIn />
    
    <motion.div 
      className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg max-w-[240px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-red-900 dark:text-red-100">Delete Clients</p>
          <p className="text-[10px] text-red-700 dark:text-red-300 mt-0.5">
            Permanently remove selected clients. This action cannot be undone.
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);

// Step 12: Clear Selection
export const ClientsStep12 = () => (
  <div className="space-y-4 flex flex-col items-center justify-center">
    <MockBulkActionsBar count={2} closeHighlight zoomIn />
    
    <motion.div 
      className="p-3 bg-muted/50 border border-border rounded-lg max-w-[240px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium">Clear Selection</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Click X to deselect all clients and hide the actions bar
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);
