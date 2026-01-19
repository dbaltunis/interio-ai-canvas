import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Filter, Plus, Mail, Download, Trash2, X, Check,
  Phone, MapPin, ChevronDown, MoreHorizontal, Star, Calendar,
  MessageSquare, Activity, Edit2, FileText, Folder, Briefcase,
  DollarSign, ExternalLink, StickyNote, Sparkles, FolderKanban, UserCheck, Edit
} from "lucide-react";
import { PulsingHighlight, MockCard, MockButton, MockBadge } from "../TutorialVisuals";
import { DemoCursor } from "../DemoCursor";
import { inPhase, interpolatePath, isClicking, typingProgress, phaseProgress, easeOutCubic } from "@/lib/demoAnimations";

interface StepProps {
  phase?: number;
}

// ===========================================
// MOCK COMPONENTS FOR CLIENTS PAGE DEMO
// Matches real app components with 95%+ accuracy
// ===========================================

// Stage badge with exact colors from ClientListView.tsx getStageColor
const MockStageBadge = ({ 
  stage, 
  highlight = false,
  pulse = false,
}: { 
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";
  highlight?: boolean;
  pulse?: boolean;
}) => {
  const colors: Record<string, string> = {
    lead: "bg-blue-100 text-blue-700 border-blue-200",
    contacted: "bg-purple-100 text-purple-700 border-purple-200",
    qualified: "bg-green-100 text-green-700 border-green-200",
    proposal: "bg-yellow-100 text-yellow-700 border-yellow-200",
    negotiation: "bg-orange-100 text-orange-700 border-orange-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    lost: "bg-red-100 text-red-700 border-red-200",
    client: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <motion.span 
      className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase border ${colors[stage]} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {stage.replace('_', ' ')}
    </motion.span>
  );
};

// Client avatar - matches real app Avatar h-10 w-10 with shadow-sm border
const MockAvatar = ({ name, className = "", size = "sm" }: { name: string; className?: string; size?: "sm" | "lg" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
  const colorIndex = name.length % colors.length;
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-xs";
  
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm border border-border/40 ${className}`}>
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

// Single client row - matches real ClientListView table row
interface ClientRowProps {
  name: string;
  email: string;
  company?: string;
  contactPerson?: string;
  clientType?: "B2C" | "B2B";
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";
  projects: number;
  value: string;
  emails?: number;
  whatsapp?: number;
  files?: number;
  isHotLead?: boolean;
  index?: number;
  selected?: boolean;
  highlighted?: boolean;
  checkboxHighlight?: boolean;
  clickable?: boolean;
}

const MockClientRow = ({ 
  name, 
  email,
  company,
  contactPerson,
  clientType = "B2C",
  stage, 
  projects, 
  value,
  emails = 0,
  whatsapp = 0,
  files = 0,
  isHotLead = false,
  index = 1,
  selected = false,
  highlighted = false,
  checkboxHighlight = false,
  clickable = false,
}: ClientRowProps) => {
  const displayName = clientType === "B2B" ? company || name : name;
  
  return (
    <motion.div 
      className={`flex items-center gap-3 px-3 py-2.5 border-b border-border/40 transition-colors ${selected ? "bg-primary/5" : highlighted ? "bg-muted/40" : "bg-background"} ${clickable ? "cursor-pointer hover:bg-muted/40" : ""}`}
      animate={highlighted ? { x: [0, 2, 0] } : {}}
      transition={{ duration: 0.2 }}
    >
      <MockCheckbox checked={selected} highlight={checkboxHighlight} />
      
      {/* Row number */}
      <span className="text-[10px] text-muted-foreground w-4">{index}</span>
      
      {/* Client column */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <MockAvatar name={displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold truncate max-w-[120px]">{displayName}</span>
            {isHotLead && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
          </div>
          {clientType === "B2B" && contactPerson && (
            <span className="text-[10px] text-muted-foreground truncate block">{contactPerson}</span>
          )}
          <span className="text-[9px] text-muted-foreground/80 truncate block">{email}</span>
        </div>
      </div>
      
      {/* Stage */}
      <MockStageBadge stage={stage} />
      
      {/* Projects */}
      <div className="flex items-center gap-1 shrink-0">
        {projects > 0 ? (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px]">
            <FolderKanban className="h-3 w-3" />
            {projects}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/60">—</span>
        )}
      </div>
      
      {/* Deal Value */}
      <div className="text-right shrink-0 w-16">
        {value !== "$0" ? (
          <span className="text-xs font-semibold">{value}</span>
        ) : (
          <span className="text-[10px] text-muted-foreground/60">—</span>
        )}
      </div>
      
      {/* Communications */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5">
          <Mail className="h-3 w-3 text-blue-500" />
          <span className="text-[9px] text-muted-foreground">{emails || "—"}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <MessageSquare className="h-3 w-3 text-green-500" />
          <span className="text-[9px] text-muted-foreground">{whatsapp || "—"}</span>
        </div>
      </div>
      
      {/* Documents */}
      <div className="shrink-0">
        {files > 0 ? (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px]">
            <FileText className="h-3 w-3" />
            {files}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/60">—</span>
        )}
      </div>
      
      {/* Actions */}
      <div className="shrink-0">
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

// Table header row - matches real app columns
const MockTableHeader = ({ selectAllHighlight = false }: { selectAllHighlight?: boolean }) => (
  <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-b border-border text-[9px] font-normal text-muted-foreground">
    <MockCheckbox highlight={selectAllHighlight} />
    <span className="w-4">#</span>
    <span className="flex-1">Client</span>
    <span className="w-16">Stage</span>
    <span className="w-12">Projects</span>
    <span className="w-16 text-right">Deal Value</span>
    <span className="w-16">Comms</span>
    <span className="w-12">Docs</span>
    <span className="w-8">Actions</span>
  </div>
);

// Header - matches real ClientManagementPage header
const MockHeader = ({ 
  totalClients = 127,
  searchValue = "",
  searchActive = false,
  filterActive = false,
  newButtonHighlight = false,
}: {
  totalClients?: number;
  searchValue?: string;
  searchActive?: boolean;
  filterActive?: boolean;
  newButtonHighlight?: boolean;
}) => (
  <div className="flex items-center justify-between p-3 border-b border-border">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-primary/10 rounded-lg">
        <Users className="h-4 w-4 text-primary" />
      </div>
      <span className="text-xs font-semibold">Clients</span>
      <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[9px] font-medium rounded">
        {totalClients} clients
      </span>
    </div>
    
    <div className="flex items-center gap-1.5">
      {/* Search */}
      <motion.div 
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] w-28 ${
          searchActive ? "bg-background border border-primary" : "bg-muted border border-transparent"
        }`}
      >
        <Search className={`h-3 w-3 ${searchActive ? "text-primary" : "text-muted-foreground"}`} />
        <span className={searchActive ? "text-foreground" : "text-muted-foreground"}>
          {searchValue || "Search..."}
        </span>
      </motion.div>
      
      {/* Filter button */}
      <motion.div 
        className={`p-1.5 rounded-lg ${filterActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} cursor-pointer`}
        animate={filterActive ? { scale: 1.05 } : { scale: 1 }}
      >
        <Filter className="h-3.5 w-3.5" />
      </motion.div>
      
      {/* Download button */}
      <div className="p-1.5 bg-muted text-muted-foreground rounded-lg cursor-pointer">
        <Download className="h-3.5 w-3.5" />
      </div>
      
      {/* New Client button */}
      <motion.div 
        className={`flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium cursor-pointer shadow-sm ${newButtonHighlight ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
        animate={newButtonHighlight ? { scale: 1.05 } : { scale: 1 }}
      >
        <Plus className="h-3 w-3" />
        <span>New Client</span>
      </motion.div>
    </div>
  </div>
);

// Bulk actions bar - matches real BulkActionsBar.tsx with UserCheck icon
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
    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border rounded-xl shadow-lg"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center gap-2">
      <motion.div 
        className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <UserCheck className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{count}</span>
      </motion.div>
      <span className="text-xs text-muted-foreground">selected</span>
    </div>
    
    <div className="flex items-center gap-1.5 relative">
      {/* Email button */}
      <div className="relative">
        <motion.div 
          className={`flex items-center gap-1 px-2 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-[10px] font-medium cursor-pointer ${emailHighlight ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
          animate={emailHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Mail className="h-3 w-3" />
          <span className="hidden sm:inline">Email</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "email" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[9px] rounded whitespace-nowrap"
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
          className={`flex items-center gap-1 px-2 py-1.5 border border-border bg-background rounded-lg text-[10px] font-medium cursor-pointer ${exportHighlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
          animate={exportHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Download className="h-3 w-3" />
          <span className="hidden sm:inline">Export</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "export" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[9px] rounded whitespace-nowrap"
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
          className={`flex items-center gap-1 px-2 py-1.5 border border-destructive/30 text-destructive rounded-lg text-[10px] font-medium cursor-pointer ${deleteHighlight ? "ring-2 ring-destructive ring-offset-1" : ""}`}
          animate={deleteHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Trash2 className="h-3 w-3" />
          <span className="hidden sm:inline">Delete</span>
        </motion.div>
        <AnimatePresence>
          {showTooltip === "delete" && (
            <motion.div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-destructive text-destructive-foreground text-[9px] rounded whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              Remove with confirmation
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="w-px h-5 bg-border mx-0.5" />
      
      <motion.div 
        className={`p-1 hover:bg-muted rounded cursor-pointer ${closeHighlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
        animate={closeHighlight ? { scale: 1.1 } : { scale: 1 }}
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </motion.div>
    </div>
  </motion.div>
);

// Client form mockup - matches DialogContent styling
const MockClientForm = ({ visible = false }: { visible?: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card border border-border rounded-xl shadow-xl p-4 w-[85%] max-w-[280px]"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Add New Client</h3>
            <X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
          
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="h-8 bg-muted rounded-lg border border-border px-2 flex items-center justify-center text-[10px] font-medium">Individual (B2C)</div>
            <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center justify-center text-[10px] text-muted-foreground">Business (B2B)</div>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Full Name *</label>
              <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center text-[10px]"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block">Email</label>
                <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center text-[10px]"></div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block">Phone</label>
                <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center text-[10px]"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <div className="px-3 py-1.5 text-[10px] border border-border rounded-lg">Cancel</div>
            <div className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Save Client
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Client detail drawer mockup - matches ClientDetailDrawer.tsx exactly
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
          {/* Header - matches real drawer header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60">
            <div className="p-3 pb-2">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base font-semibold shadow-sm">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold leading-tight">Sarah Johnson</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Design Studio Owner</p>
                  
                  {/* Stage selector + Lead source */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <motion.div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-green-100 text-green-700 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span>QUALIFIED</span>
                      <ChevronDown className="h-3 w-3" />
                    </motion.div>
                    <span className="px-1.5 py-0.5 bg-secondary text-[9px] rounded">Direct</span>
                  </div>
                  
                  <p className="text-[9px] text-muted-foreground mt-1">In this stage 3 days</p>
                </div>
                <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </div>
            
            {/* Quick Actions - horizontal layout matching real app */}
            <div className="px-3 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { icon: Mail, label: "Email", id: "email" },
                  { icon: Phone, label: "Call", id: "call" },
                  { icon: MessageSquare, label: "WhatsApp", id: "whatsapp", className: "text-green-600 hover:text-green-700 hover:bg-green-50" },
                  { icon: StickyNote, label: "Log Activity", id: "log" },
                  { icon: Briefcase, label: "New Project", id: "project" },
                  { icon: Edit, label: "Edit", id: "edit" },
                ].map((action) => (
                  <motion.div 
                    key={action.id}
                    className={`flex items-center gap-1 px-2 py-1.5 border border-border rounded-lg cursor-pointer text-[10px] ${activeAction === action.id ? "bg-primary/10 border-primary" : "bg-background"} ${action.className || ""}`}
                    animate={activeAction === action.id ? { scale: 1.05 } : { scale: 1 }}
                  >
                    <action.icon className={`h-3.5 w-3.5 ${activeAction === action.id ? "text-primary" : ""}`} />
                    <span className="hidden sm:inline">{action.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tabs - segment variant with icons */}
          <div className="px-3 pt-2">
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-lg">
              {[
                { id: "activity", icon: Activity, label: "Activity" },
                { id: "details", icon: Users, label: "Details" },
                { id: "emails", icon: Mail, label: "Emails" },
                { id: "files", icon: FileText, label: "Files" },
              ].map((tab) => (
                <motion.div 
                  key={tab.id}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer ${activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  animate={activeTab === tab.id ? { scale: 1.02 } : { scale: 1 }}
                >
                  <tab.icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-3 space-y-2">
            {activeTab === "activity" && (
              <>
                <div className="flex gap-2 p-2.5 bg-muted/30 rounded-xl">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">Email sent: Quote #1234</p>
                    <p className="text-[9px] text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-2 p-2.5 bg-muted/30 rounded-xl">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="h-3 w-3 text-green-600" />
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
                <div className="p-2.5 bg-muted/30 rounded-xl">
                  <p className="text-[10px] font-medium">Re: Project Quote</p>
                  <p className="text-[9px] text-muted-foreground truncate">Thanks for sending over the...</p>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl">
                  <p className="text-[10px] font-medium">Meeting Follow-up</p>
                  <p className="text-[9px] text-muted-foreground truncate">Great to meet with you...</p>
                </div>
              </>
            )}
            {activeTab === "files" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Quote.pdf</p>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <Folder className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Photos</p>
                </div>
              </div>
            )}
            {activeTab === "details" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-medium">Email</p>
                    <p className="text-[10px] font-medium">sarah@designstudio.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-medium">Phone</p>
                    <p className="text-[10px] font-medium">+61 400 123 456</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Stage dropdown mockup
const MockStageDropdown = ({ visible = false, selected = "qualified" }: { visible?: boolean; selected?: string }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-20"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
      >
        {["lead", "contacted", "qualified", "proposal", "approved"].map((stage) => (
          <motion.div 
            key={stage}
            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] cursor-pointer ${stage === selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"}`}
            animate={stage === selected ? { x: [0, 3, 0] } : {}}
          >
            <div className={`w-2 h-2 rounded-full ${
              stage === "lead" ? "bg-blue-500" :
              stage === "contacted" ? "bg-purple-500" :
              stage === "qualified" ? "bg-green-500" :
              stage === "proposal" ? "bg-yellow-500" :
              "bg-emerald-500"
            }`} />
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Sample client data - matches real data structure
const sampleClients: ClientRowProps[] = [
  { name: "Sarah Johnson", email: "sarah@designstudio.com", stage: "qualified", projects: 3, value: "$12,450", emails: 5, whatsapp: 2, files: 3, isHotLead: true, index: 1 },
  { name: "Chen Industries", email: "m.chen@homeinteriors.au", company: "Chen Industries", contactPerson: "Michael Chen", clientType: "B2B", stage: "proposal", projects: 2, value: "$8,900", emails: 3, index: 2 },
  { name: "Emma Williams", email: "emma.w@gmail.com", stage: "lead", projects: 0, value: "$0", index: 3 },
  { name: "Brown Corp", email: "james.b@corporate.com", company: "Brown Corp", contactPerson: "James Brown", clientType: "B2B", stage: "approved", projects: 5, value: "$45,200", emails: 12, whatsapp: 4, files: 8, index: 4 },
];

// ===========================================
// STREAMLINED STEP COMPONENTS (10 Action-Packed Steps)
// ===========================================

// Step 1: Quick Intro - Table overview (fast fade in)
export const ClientsStep1 = ({ phase = 0 }: StepProps) => {
  const visibleRows = Math.min(4, Math.floor(phase * 8) + 1);
  
  return (
    <div className="space-y-0">
      <MockCard className="overflow-hidden rounded-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <MockHeader />
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
    { x: 195, y: 28, at: 0 },
    { x: 195, y: 28, at: 0.15 },  // Click search
    { x: 195, y: 28, at: 0.5 },   // Type
    { x: 255, y: 28, at: 0.7 },   // Move to filter
    { x: 255, y: 28, at: 1 },
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
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockHeader 
          searchValue={searchText} 
          searchActive={searchActive}
          filterActive={filterActive}
        />
        
        <MockTableHeader />
        <AnimatePresence mode="popLayout">
          {filteredClients.slice(0, 4).map((client, i) => (
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
    { x: 285, y: 28, at: 0.25 },  // Move to New button
    { x: 285, y: 28, at: 0.35 },  // Click
    { x: 200, y: 120, at: 0.5 },  // Move into form
    { x: 200, y: 120, at: 0.85 }, // Stay
    { x: 250, y: 85, at: 1 },     // Move to close
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  const showForm = phase > 0.32 && phase < 0.9;
  const buttonHover = phase > 0.2 && phase < 0.35;
  const clicking = isClicking(phase, [0.33, 0.88]);

  return (
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockHeader newButtonHighlight={buttonHover} />
        
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
    { x: 18, y: 85, at: 0 },
    { x: 18, y: 85, at: 0.12 },   // Click 1st
    { x: 18, y: 120, at: 0.25 }, // Move to 2nd
    { x: 18, y: 120, at: 0.35 }, // Click 2nd
    { x: 18, y: 155, at: 0.5 },  // Move to 3rd
    { x: 18, y: 155, at: 0.6 },  // Click 3rd
    { x: 150, y: 230, at: 0.85 }, // Move to bulk bar
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const firstChecked = phase > 0.15;
  const secondChecked = phase > 0.38;
  const thirdChecked = phase > 0.62;
  const bulkBarVisible = phase > 0.5;
  const clicking = isClicking(phase, [0.14, 0.37, 0.61]);
  
  const selectedCount = (firstChecked ? 1 : 0) + (secondChecked ? 1 : 0) + (thirdChecked ? 1 : 0);

  return (
    <div className="space-y-3 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockHeader totalClients={127} />
        
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
    { x: 215, y: 25, at: 0.35 },  // Export
    { x: 215, y: 25, at: 0.5 },
    { x: 250, y: 25, at: 0.7 },   // Delete
    { x: 250, y: 25, at: 0.85 },
    { x: 290, y: 25, at: 1 },     // Close
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
    { x: 100, y: 85, at: 0 },
    { x: 150, y: 85, at: 0.3 },  // Move to row
    { x: 150, y: 85, at: 0.45 }, // Click
    { x: 250, y: 120, at: 0.8 }, // Move into drawer
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const rowHighlight = phase > 0.25 && phase < 0.5;
  const drawerVisible = phase > 0.48;
  const clicking = isClicking(phase, [0.47]);

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockCard className="overflow-hidden rounded-xl">
        <MockHeader />
        
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
  const actions = ["email", "call", "whatsapp", "log", "project", "edit"];
  const actionPhases = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68];
  
  const currentAction = actions.find((_, i) => inPhase(phase, actionPhases[i], actionPhases[i] + 0.1));
  
  const cursorPath = [
    { x: 195, y: 105, at: 0 },
    { x: 195, y: 105, at: 0.12 },  // Email
    { x: 210, y: 105, at: 0.24 },  // Call
    { x: 225, y: 105, at: 0.36 },  // WhatsApp
    { x: 240, y: 105, at: 0.48 },  // Log
    { x: 255, y: 105, at: 0.60 },  // Project
    { x: 270, y: 105, at: 0.72 },  // Edit
    { x: 270, y: 105, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockClientDrawer visible activeTab="activity" activeAction={currentAction} />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} visible={phase > 0.05 && phase < 0.85} />
    </div>
  );
};

// Step 8: Pipeline Management - Stage dropdown
export const ClientsStep8 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 180, y: 60, at: 0 },
    { x: 130, y: 65, at: 0.25 },  // Move to stage badge
    { x: 130, y: 65, at: 0.35 },  // Click
    { x: 130, y: 115, at: 0.6 },   // Move to "Proposal"
    { x: 130, y: 115, at: 0.75 },  // Click
    { x: 130, y: 65, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const dropdownOpen = phase > 0.38 && phase < 0.78;
  const clicking = isClicking(phase, [0.37, 0.77]);
  const newStage = phase > 0.78;

  return (
    <div className="space-y-0 relative">
      <MockCard className="p-3 rounded-xl">
        <div className="flex items-start gap-3 relative">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base font-semibold">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold">Sarah Johnson</h3>
            <p className="text-[10px] text-muted-foreground mb-1.5">Design Studio Owner</p>
            <div className="relative inline-block">
              <motion.div 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium uppercase cursor-pointer ${
                  newStage 
                    ? "bg-yellow-100 text-yellow-700" 
                    : "bg-green-100 text-green-700"
                } ${phase > 0.2 && phase < 0.4 ? "ring-2 ring-primary ring-offset-1" : ""}`}
                animate={newStage ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <span>{newStage ? "Proposal" : "Qualified"}</span>
                <ChevronDown className="h-3 w-3" />
              </motion.div>
              <MockStageDropdown visible={dropdownOpen} selected={newStage ? "proposal" : "qualified"} />
            </div>
          </div>
        </div>
        
        {newStage && (
          <motion.div 
            className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-lg"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-primary font-medium">Stage updated! Activity logged automatically.</span>
            </div>
          </motion.div>
        )}
      </MockCard>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.9} />
    </div>
  );
};

// Step 9: Profile Tabs - Navigate through tabs
export const ClientsStep9 = ({ phase = 0 }: StepProps) => {
  const tabs = ["activity", "details", "emails", "files"];
  const tabPhases = [0, 0.25, 0.5, 0.75];
  
  const currentTab = tabs.find((_, i) => {
    const nextPhase = tabPhases[i + 1] || 1;
    return phase >= tabPhases[i] && phase < nextPhase;
  }) || "activity";
  
  const cursorPath = [
    { x: 190, y: 150, at: 0 },
    { x: 210, y: 150, at: 0.25 },  // Details
    { x: 230, y: 150, at: 0.5 },   // Emails
    { x: 250, y: 150, at: 0.75 },  // Files
    { x: 250, y: 150, at: 1 },
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  const clicking = isClicking(phase, [0.25, 0.5, 0.75]);

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockClientDrawer visible activeTab={currentTab} />
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05} />
    </div>
  );
};

// Step 10: Create Project from Client - celebration
export const ClientsStep10 = ({ phase = 0 }: StepProps) => {
  const cursorPath = [
    { x: 200, y: 100, at: 0 },
    { x: 245, y: 105, at: 0.3 },  // Move to New Project button
    { x: 245, y: 105, at: 0.45 }, // Click
    { x: 200, y: 150, at: 0.8 },  // Move away
  ];
  const cursorPos = interpolatePath(phase, cursorPath);
  
  const buttonHighlight = phase > 0.25 && phase < 0.5;
  const clicking = isClicking(phase, [0.47]);
  const showSuccess = phase > 0.55;

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockClientDrawer visible activeTab="activity" activeAction={buttonHighlight ? "project" : null} />
      
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Briefcase className="h-8 w-8 text-green-600" />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">Project Created!</h3>
              <p className="text-[10px] text-muted-foreground">For Sarah Johnson</p>
              <motion.div 
                className="mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium inline-flex items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ExternalLink className="h-3 w-3" />
                Open Project
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <DemoCursor x={cursorPos.x} y={cursorPos.y} isClicking={clicking} visible={phase > 0.05 && phase < 0.6} />
    </div>
  );
};
