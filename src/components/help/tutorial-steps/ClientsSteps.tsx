import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Filter, Plus, Mail, Download, Trash2, X, Check,
  Phone, MapPin, ChevronDown, MoreHorizontal, Star, Calendar,
  MessageCircle, Activity, Edit2, FileText, Folder, Briefcase,
  DollarSign, ExternalLink, PhoneCall, Sparkles
} from "lucide-react";
import { PulsingHighlight, MockCard, MockButton, MockBadge } from "../TutorialVisuals";
import { DemoCursor } from "../DemoCursor";
import { inPhase, interpolatePath, isClicking, typingProgress, phaseProgress, easeOutCubic } from "@/lib/demoAnimations";

interface StepProps {
  phase?: number;
}

// ===========================================
// MOCK COMPONENTS FOR CLIENTS PAGE DEMO
// ===========================================

// Stage badge with colors
const MockStageBadge = ({ 
  stage, 
  highlight = false,
  pulse = false,
}: { 
  stage: "Lead" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  highlight?: boolean;
  pulse?: boolean;
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
    <motion.span 
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[stage]} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {stage}
    </motion.span>
  );
};

// Client avatar
const MockAvatar = ({ name, className = "", size = "sm" }: { name: string; className?: string; size?: "sm" | "lg" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
  const colorIndex = name.length % colors.length;
  const sizeClass = size === "lg" ? "h-12 w-12 text-sm" : "h-8 w-8 text-xs";
  
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  );
};

// Checkbox component
const MockCheckbox = ({ checked = false, highlight = false }: { checked?: boolean; highlight?: boolean }) => (
  <motion.div 
    className={`h-4 w-4 rounded border ${checked ? "bg-primary border-primary" : "border-muted-foreground/40 bg-background"} flex items-center justify-center transition-all ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
    animate={checked ? { scale: [1, 1.2, 1] } : {}}
    transition={{ duration: 0.2 }}
  >
    {checked && <Check className="h-3 w-3 text-primary-foreground" />}
  </motion.div>
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
  clickable?: boolean;
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
  clickable = false,
}: ClientRowProps) => (
  <motion.div 
    className={`flex items-center gap-3 px-3 py-2.5 border-b border-border/50 transition-all ${selected ? "bg-primary/10" : highlighted ? "bg-accent/50" : "bg-background"} ${clickable ? "cursor-pointer hover:bg-accent/30" : ""}`}
    animate={highlighted ? { x: [0, 2, 0] } : {}}
    transition={{ duration: 0.2 }}
  >
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
    {clickable && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
  </motion.div>
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
  showTooltip?: "email" | "export" | "delete" | null;
}

const MockBulkActionsBar = ({ 
  count, 
  emailHighlight = false, 
  exportHighlight = false, 
  deleteHighlight = false,
  closeHighlight = false,
  showTooltip = null,
}: BulkActionsBarProps) => (
  <motion.div 
    className="flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-lg shadow-lg"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center gap-3">
      <motion.div 
        className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <Users className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{count}</span>
      </motion.div>
      <span className="text-xs text-muted-foreground">selected</span>
    </div>
    
    <div className="flex items-center gap-2 relative">
      {/* Email button */}
      <div className="relative">
        <motion.div 
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium cursor-pointer ${emailHighlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
          animate={emailHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "email" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              Send campaign to all
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Export button */}
      <div className="relative">
        <motion.div 
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-md text-xs font-medium cursor-pointer ${exportHighlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
          animate={exportHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "export" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              Download as CSV
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Delete button */}
      <div className="relative">
        <motion.div 
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium cursor-pointer ${deleteHighlight ? "ring-2 ring-destructive ring-offset-1" : ""}`}
          animate={deleteHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "delete" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-destructive text-destructive-foreground text-[10px] rounded whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              Remove with confirmation
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <motion.div 
        className={`p-1.5 hover:bg-muted rounded cursor-pointer ${closeHighlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
        animate={closeHighlight ? { scale: 1.1 } : { scale: 1 }}
      >
        <X className="h-4 w-4" />
      </motion.div>
    </div>
  </motion.div>
);

// Stats cards
const StatsCards = ({ visible = false }: { visible?: boolean }) => (
  <motion.div 
    className="grid grid-cols-3 gap-2 mb-3"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-card border border-border rounded-lg p-2 text-center">
      <div className="text-sm font-bold text-primary">127</div>
      <div className="text-[9px] text-muted-foreground">Total Clients</div>
    </div>
    <div className="bg-card border border-border rounded-lg p-2 text-center">
      <div className="text-sm font-bold text-green-600">$45K</div>
      <div className="text-[9px] text-muted-foreground">Pipeline</div>
    </div>
    <div className="bg-card border border-border rounded-lg p-2 text-center">
      <div className="text-sm font-bold text-blue-600">12</div>
      <div className="text-[9px] text-muted-foreground">New This Week</div>
    </div>
  </motion.div>
);

// Client form mockup
const MockClientForm = ({ visible = false }: { visible?: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card border border-border rounded-lg shadow-xl p-4 w-[85%] max-w-[280px]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">New Client</h3>
            <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
          <div className="space-y-2">
            <div className="h-7 bg-muted rounded border border-border px-2 flex items-center text-xs text-muted-foreground">Name</div>
            <div className="h-7 bg-muted rounded border border-border px-2 flex items-center text-xs text-muted-foreground">Email</div>
            <div className="h-7 bg-muted rounded border border-border px-2 flex items-center text-xs text-muted-foreground">Phone</div>
            <div className="flex items-center gap-2 pt-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-primary font-medium">Lead Intelligence Active</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <div className="px-3 py-1.5 text-xs border border-border rounded">Cancel</div>
            <div className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded font-medium">Create</div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Client detail drawer mockup
const MockClientDrawer = ({ visible = false, activeTab = "activity", activeAction = null }: { 
  visible?: boolean; 
  activeTab?: string;
  activeAction?: string | null;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 flex justify-end z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <motion.div 
          className="relative bg-card border-l border-border shadow-xl w-[75%] h-full overflow-hidden"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
        >
          {/* Header */}
          <div className="p-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start gap-3">
              <MockAvatar name="Sarah Johnson" size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold">Sarah Johnson</h3>
                <p className="text-[10px] text-muted-foreground">Design Studio Owner</p>
                <MockStageBadge stage="Qualified" />
              </div>
              <X className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="p-2 border-b border-border">
            <div className="grid grid-cols-5 gap-1">
              {[
                { icon: Mail, label: "Email", id: "email" },
                { icon: Phone, label: "Call", id: "call" },
                { icon: MessageCircle, label: "WhatsApp", id: "whatsapp" },
                { icon: Activity, label: "Log", id: "log" },
                { icon: Calendar, label: "Schedule", id: "schedule" },
              ].map((action) => (
                <motion.div 
                  key={action.id}
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded cursor-pointer ${activeAction === action.id ? "bg-primary/10 ring-1 ring-primary" : "bg-muted"}`}
                  animate={activeAction === action.id ? { scale: 1.1 } : { scale: 1 }}
                >
                  <action.icon className={`h-3.5 w-3.5 ${activeAction === action.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[8px] text-muted-foreground">{action.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
            {["Activity", "Details", "Emails", "Files", "Projects"].map((tab) => (
              <motion.div 
                key={tab}
                className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap cursor-pointer ${activeTab === tab.toLowerCase() ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                animate={activeTab === tab.toLowerCase() ? { scale: 1.05 } : { scale: 1 }}
              >
                {tab}
              </motion.div>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-2 space-y-2">
            {activeTab === "activity" && (
              <>
                <div className="flex gap-2 p-2 bg-muted/30 rounded">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">Email sent: Quote #1234</p>
                    <p className="text-[9px] text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-2 p-2 bg-muted/30 rounded">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <PhoneCall className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">Call completed</p>
                    <p className="text-[9px] text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </>
            )}
            {activeTab === "emails" && (
              <>
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-[10px] font-medium">Re: Project Quote</p>
                  <p className="text-[9px] text-muted-foreground truncate">Thanks for sending over the...</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <p className="text-[10px] font-medium">Meeting Follow-up</p>
                  <p className="text-[9px] text-muted-foreground truncate">Great to meet with you...</p>
                </div>
              </>
            )}
            {activeTab === "files" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted/30 rounded text-center">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Quote.pdf</p>
                </div>
                <div className="p-2 bg-muted/30 rounded text-center">
                  <Folder className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Photos</p>
                </div>
              </div>
            )}
            {activeTab === "projects" && (
              <>
                <div className="p-2 bg-muted/30 rounded border-l-2 border-green-500">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium">Living Room Curtains</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">$4,500</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border-l-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium">Bedroom Blinds</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Quote</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">$2,800</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Stage dropdown mockup
const MockStageDropdown = ({ visible = false, selected = "Qualified" }: { visible?: boolean; selected?: string }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[100px] z-20"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
      >
        {["Lead", "Contacted", "Qualified", "Proposal", "Won"].map((stage) => (
          <motion.div 
            key={stage}
            className={`px-3 py-1.5 text-[10px] cursor-pointer ${stage === selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"}`}
            animate={stage === selected ? { x: [0, 3, 0] } : {}}
          >
            {stage}
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Sample client data
const sampleClients: ClientRowProps[] = [
  { name: "Sarah Johnson", email: "sarah@designstudio.com", stage: "Qualified", projects: 3, value: "$12,450" },
  { name: "Michael Chen", email: "m.chen@homeinteriors.au", stage: "Proposal", projects: 2, value: "$8,900" },
  { name: "Emma Williams", email: "emma.w@gmail.com", stage: "Lead", projects: 0, value: "$0" },
  { name: "James Brown", email: "james.b@corporate.com", stage: "Won", projects: 5, value: "$45,200" },
];

// ===========================================
// STREAMLINED STEP COMPONENTS (10 Action-Packed Steps)
// ===========================================

// Step 1: Quick Intro - Table + Stats (fast fade in)
export const ClientsStep1 = ({ phase = 0 }: StepProps) => {
  const statsVisible = phase > 0.1;
  const visibleRows = Math.min(4, Math.floor(phase * 8) + 1);
  
  return (
    <div className="space-y-2">
      <StatsCards visible={statsVisible} />
      <MockCard className="overflow-hidden">
        <motion.div 
          className="flex items-center justify-between p-2 border-b border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Clients</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-[10px]">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Search...</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium">
              <Plus className="h-3 w-3" />
              <span>New</span>
            </div>
          </div>
        </motion.div>
        
        <MockTableHeader />
        {sampleClients.map((client, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: i < visibleRows ? 1 : 0,
              x: i < visibleRows ? 0 : -10,
            }}
            transition={{ duration: 0.15, delay: i * 0.05 }}
          >
            <MockClientRow {...client} />
          </motion.div>
        ))}
      </MockCard>
    </div>
  );
};

// Step 2: Search + Filter in ONE fluid motion
export const ClientsStep2 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 180, y: 22, at: 0 },
    { x: 180, y: 22, at: 0.15 },  // Click search
    { x: 180, y: 22, at: 0.5 },   // Type
    { x: 260, y: 22, at: 0.7 },   // Move to filter
    { x: 260, y: 22, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  const searchActive = phase > 0.12;
  const searchText = typingProgress(phase, 0.18, 0.45, "Sarah");
  const isTyping = inPhase(phase, 0.18, 0.45);
  const filterActive = phase > 0.65;
  const clicking = isClicking(phase, [0.15, 0.68]);
  
  // Filter which clients are visible based on search
  const filteredClients = phase > 0.4 
    ? sampleClients.filter(c => c.name.toLowerCase().includes("sarah"))
    : sampleClients;

  return (
    <div className="space-y-2 relative">
      <MockCard className="overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Clients</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div 
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${
                searchActive ? "bg-background border border-primary" : "bg-muted"
              }`}
              animate={searchActive ? { width: "auto" } : {}}
            >
              <Search className={`h-3 w-3 ${searchActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={searchActive ? "text-foreground" : "text-muted-foreground"}>
                {searchText || "Search..."}
              </span>
              {isTyping && <span className="w-0.5 h-3 bg-primary animate-pulse" />}
            </motion.div>
            
            <AnimatePresence>
              {filterActive && (
                <motion.div 
                  className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Filter className="h-3 w-3" />
                  <span>Qualified</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <MockTableHeader />
        <AnimatePresence mode="popLayout">
          {filteredClients.slice(0, 3).map((client, i) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MockClientRow {...client} highlighted={phase > 0.5 && client.name === "Sarah Johnson"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </MockCard>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} isTyping={isTyping} visible={phase > 0.05} />
    </div>
  );
};

// Step 3: Add New Client (click → form → close)
export const ClientsStep3 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 100, y: 50, at: 0 },
    { x: 270, y: 22, at: 0.25 },  // Move to New button
    { x: 270, y: 22, at: 0.35 },  // Click
    { x: 200, y: 100, at: 0.5 },  // Move into form
    { x: 200, y: 100, at: 0.85 }, // Stay
    { x: 230, y: 70, at: 1 },     // Move to close
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  const showForm = phase > 0.32 && phase < 0.9;
  const buttonHover = phase > 0.2 && phase < 0.35;
  const clicking = isClicking(phase, [0.33, 0.88]);

  return (
    <div className="space-y-2 relative">
      <MockCard className="overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Clients</span>
          </div>
          <motion.div 
            className={`flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium cursor-pointer ${buttonHover ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
            animate={{ scale: buttonHover ? 1.1 : clicking && phase < 0.4 ? 0.95 : 1 }}
          >
            <Plus className="h-3 w-3" />
            <span>New Client</span>
          </motion.div>
        </div>
        
        <MockTableHeader />
        {sampleClients.slice(0, 3).map((client, i) => (
          <MockClientRow key={i} {...client} />
        ))}
      </MockCard>
      
      <MockClientForm visible={showForm} />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05} />
    </div>
  );
};

// Step 4: Power Select - Rapid checkbox selection + bulk bar
export const ClientsStep4 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 25, y: 75, at: 0 },
    { x: 25, y: 75, at: 0.12 },   // Click 1st
    { x: 25, y: 105, at: 0.25 }, // Move to 2nd
    { x: 25, y: 105, at: 0.35 }, // Click 2nd
    { x: 25, y: 135, at: 0.5 },  // Move to 3rd
    { x: 25, y: 135, at: 0.6 },  // Click 3rd
    { x: 150, y: 200, at: 0.85 }, // Move to bulk bar
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const firstChecked = phase > 0.15;
  const secondChecked = phase > 0.38;
  const thirdChecked = phase > 0.62;
  const bulkBarVisible = phase > 0.5;
  const clicking = isClicking(phase, [0.14, 0.37, 0.61]);
  
  const selectedCount = (firstChecked ? 1 : 0) + (secondChecked ? 1 : 0) + (thirdChecked ? 1 : 0);

  return (
    <div className="space-y-2 relative">
      <MockCard className="overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Clients</span>
            {selectedCount > 0 && (
              <motion.span 
                className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={selectedCount}
              >
                {selectedCount} selected
              </motion.span>
            )}
          </div>
        </div>
        
        <MockTableHeader />
        <MockClientRow {...sampleClients[0]} selected={firstChecked} />
        <MockClientRow {...sampleClients[1]} selected={secondChecked} />
        <MockClientRow {...sampleClients[2]} selected={thirdChecked} />
        <MockClientRow {...sampleClients[3]} />
      </MockCard>
      
      <AnimatePresence>
        {bulkBarVisible && <MockBulkActionsBar count={selectedCount} />}
      </AnimatePresence>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.9} />
    </div>
  );
};

// Step 5: Bulk Actions Showcase - Rapid hover tooltips
export const ClientsStep5 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 180, y: 25, at: 0 },
    { x: 180, y: 25, at: 0.15 },  // Email
    { x: 225, y: 25, at: 0.35 },  // Export
    { x: 225, y: 25, at: 0.5 },
    { x: 270, y: 25, at: 0.7 },   // Delete
    { x: 270, y: 25, at: 0.85 },
    { x: 310, y: 25, at: 1 },     // Close
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const emailHighlight = inPhase(phase, 0.1, 0.3);
  const exportHighlight = inPhase(phase, 0.35, 0.55);
  const deleteHighlight = inPhase(phase, 0.6, 0.8);
  const closeHighlight = phase > 0.85;
  
  const showTooltip = emailHighlight ? "email" : exportHighlight ? "export" : deleteHighlight ? "delete" : null;

  return (
    <div className="space-y-3 flex flex-col items-center justify-center relative pt-8">
      <MockBulkActionsBar 
        count={3} 
        emailHighlight={emailHighlight}
        exportHighlight={exportHighlight}
        deleteHighlight={deleteHighlight}
        closeHighlight={closeHighlight}
        showTooltip={showTooltip}
      />
      
      <motion.p 
        className="text-[10px] text-muted-foreground text-center mt-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Hover each action to see what it does
      </motion.p>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} visible={phase > 0.05} />
    </div>
  );
};

// Step 6: Open Client Details (click row → drawer slides in)
export const ClientsStep6 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 100, y: 75, at: 0 },
    { x: 150, y: 75, at: 0.3 },  // Move to row
    { x: 150, y: 75, at: 0.45 }, // Click
    { x: 250, y: 100, at: 0.8 }, // Move into drawer
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const rowHighlight = phase > 0.25 && phase < 0.5;
  const drawerVisible = phase > 0.48;
  const clicking = isClicking(phase, [0.47]);

  return (
    <div className="space-y-2 relative h-[260px]">
      <MockCard className="overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Clients</span>
          </div>
        </div>
        
        <MockTableHeader />
        <MockClientRow {...sampleClients[0]} highlighted={rowHighlight} clickable />
        <MockClientRow {...sampleClients[1]} />
        <MockClientRow {...sampleClients[2]} />
      </MockCard>
      
      <MockClientDrawer visible={drawerVisible} activeTab="activity" />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.75} />
    </div>
  );
};

// Step 7: Quick Actions - Rapid hover showcase
export const ClientsStep7 = ({ phase = 0 }: StepProps) => {
  const actions = ["email", "call", "whatsapp", "log", "schedule"];
  const actionPhases = [0.1, 0.25, 0.4, 0.55, 0.7];
  
  const currentAction = actions.find((_, i) => inPhase(phase, actionPhases[i], actionPhases[i] + 0.12));
  
  const cursorPath = [
    { x: 195, y: 90, at: 0 },
    { x: 195, y: 90, at: 0.15 },  // Email
    { x: 210, y: 90, at: 0.28 },  // Call
    { x: 225, y: 90, at: 0.43 },  // WhatsApp
    { x: 240, y: 90, at: 0.58 },  // Log
    { x: 255, y: 90, at: 0.73 },  // Schedule
    { x: 255, y: 90, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);

  return (
    <div className="space-y-2 relative h-[260px]">
      <MockClientDrawer visible activeTab="activity" activeAction={currentAction} />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} visible={phase > 0.05 && phase < 0.85} />
    </div>
  );
};

// Step 8: Pipeline Management - Stage dropdown
export const ClientsStep8 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 180, y: 50, at: 0 },
    { x: 120, y: 55, at: 0.25 },  // Move to stage badge
    { x: 120, y: 55, at: 0.35 },  // Click
    { x: 120, y: 95, at: 0.6 },   // Move to "Proposal"
    { x: 120, y: 95, at: 0.75 },  // Click
    { x: 120, y: 55, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const dropdownOpen = phase > 0.38 && phase < 0.78;
  const clicking = isClicking(phase, [0.37, 0.77]);
  const newStage = phase > 0.78;

  return (
    <div className="space-y-2 relative">
      <MockCard className="p-3">
        <div className="flex items-start gap-3 relative">
          <MockAvatar name="Sarah Johnson" size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold">Sarah Johnson</h3>
            <p className="text-[10px] text-muted-foreground mb-1">Design Studio Owner</p>
            <div className="relative inline-block">
              <motion.div 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer ${
                  newStage 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" 
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                } ${phase > 0.2 && phase < 0.4 ? "ring-2 ring-primary ring-offset-1" : ""}`}
                animate={newStage ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {newStage ? "Proposal" : "Qualified"}
                <ChevronDown className="h-3 w-3" />
              </motion.div>
              <MockStageDropdown visible={dropdownOpen} selected={newStage ? "Proposal" : "Qualified"} />
            </div>
          </div>
        </div>
      </MockCard>
      
      {newStage && (
        <motion.div 
          className="flex items-center justify-center gap-1.5 text-xs text-green-600"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Check className="h-3.5 w-3.5" />
          <span>Stage updated!</span>
        </motion.div>
      )}
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.9} />
    </div>
  );
};

// Step 9: Tab Switching - Rapid tab navigation
export const ClientsStep9 = ({ phase = 0 }: StepProps) => {
  const tabs = ["activity", "emails", "files", "projects"];
  const tabPhases = [0, 0.25, 0.5, 0.75];
  
  const currentTab = tabs.find((_, i) => phase >= tabPhases[i]) || "activity";
  const finalTab = tabs[Math.min(Math.floor(phase * 4), 3)];
  
  const cursorPath = [
    { x: 175, y: 115, at: 0 },
    { x: 195, y: 115, at: 0.22 },  // Emails
    { x: 215, y: 115, at: 0.47 },  // Files
    { x: 240, y: 115, at: 0.72 },  // Projects
    { x: 240, y: 115, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  const clicking = isClicking(phase, [0.24, 0.49, 0.74]);

  return (
    <div className="space-y-2 relative h-[260px]">
      <MockClientDrawer visible activeTab={finalTab} />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.95} />
    </div>
  );
};

// Step 10: Create Project - Final flourish
export const ClientsStep10 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 200, y: 60, at: 0 },
    { x: 280, y: 45, at: 0.3 },  // Move to New Project
    { x: 280, y: 45, at: 0.45 }, // Click
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const buttonHover = phase > 0.25 && phase < 0.5;
  const showSuccess = phase > 0.55;
  const clicking = isClicking(phase, [0.47]);

  return (
    <div className="space-y-2 relative">
      <MockCard className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MockAvatar name="Sarah Johnson" size="lg" />
            <div>
              <h3 className="text-xs font-semibold">Sarah Johnson</h3>
              <MockStageBadge stage="Proposal" />
            </div>
          </div>
          <motion.div 
            className={`flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium cursor-pointer ${buttonHover ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
            animate={{ scale: buttonHover ? 1.1 : clicking ? 0.95 : 1 }}
          >
            <Plus className="h-3 w-3" />
            <span>New Project</span>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="flex flex-col items-center justify-center py-6 gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div 
                className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Check className="h-7 w-7 text-green-600" />
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-semibold text-foreground">You're all set!</p>
                <p className="text-xs text-muted-foreground mt-1">Manage clients like a pro 🎉</p>
              </motion.div>
              
              {/* Confetti-like particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][i],
                    left: `${30 + i * 10}%`,
                  }}
                  initial={{ y: 80, opacity: 1 }}
                  animate={{ y: -20, opacity: 0, x: (i % 2 === 0 ? 1 : -1) * (10 + i * 5) }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </MockCard>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.55} />
    </div>
  );
};

// Legacy exports for any remaining references
export { ClientsStep10 as ClientsStep11 };
export { ClientsStep10 as ClientsStep12 };
