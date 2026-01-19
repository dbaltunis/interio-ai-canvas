import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Filter, Plus, Mail, Download, Trash2, X, Check,
  Phone, MapPin, ChevronDown, MoreHorizontal, Star, Calendar,
  MessageSquare, Activity, Edit2, FileText, Folder, Briefcase,
  DollarSign, ExternalLink, StickyNote, Sparkles, FolderKanban, UserCheck, Edit
} from "lucide-react";
import { PulsingHighlight, MockCard, MockButton, MockBadge } from "../TutorialVisuals";
import { inPhase, typingProgress, phaseProgress, easeOutCubic } from "@/lib/demoAnimations";
import { 
  DemoClientCard, 
  DemoClientHeader, 
  DemoClientDrawer,
  DemoStageBadge,
  type DemoClientData 
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// MOBILE-OPTIMIZED DEMO COMPONENTS
// Designed for small container (~500px width)
// Uses card-based layout for better readability
// ===========================================

// Stage badge with exact colors from ClientListView.tsx getStageColor
const MockStageBadge = ({ 
  stage, 
  highlight = false,
  pulse = false,
  size = "sm",
}: { 
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";
  highlight?: boolean;
  pulse?: boolean;
  size?: "sm" | "xs";
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
      className={`px-1.5 py-0.5 rounded-md ${size === "xs" ? "text-[9px]" : "text-[10px]"} font-medium uppercase border ${colors[stage]} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {stage}
    </motion.span>
  );
};

// Client avatar - compact for demo
const MockAvatar = ({ name, className = "", size = "sm" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
  const colorIndex = name.length % colors.length;
  const sizeClass = size === "lg" ? "h-10 w-10 text-sm" : size === "md" ? "h-9 w-9 text-xs" : "h-8 w-8 text-[10px]";
  
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm ${className}`}>
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

// Client data interface
interface ClientData {
  name: string;
  shortName: string;
  email: string;
  company?: string;
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";
  projects: number;
  value: string;
  isHotLead?: boolean;
}

// Card-based client display - mobile friendly
const MockClientCard = ({ 
  client,
  selected = false,
  highlighted = false,
  checkboxHighlight = false,
  onClick,
}: { 
  client: ClientData;
  selected?: boolean;
  highlighted?: boolean;
  checkboxHighlight?: boolean;
  onClick?: () => void;
}) => {
  return (
    <motion.div 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
        selected ? "bg-primary/5 border-primary/30" : 
        highlighted ? "bg-muted/60 border-border" : 
        "bg-card border-border/60 hover:bg-muted/40"
      }`}
      animate={highlighted ? { scale: 1.01 } : {}}
      onClick={onClick}
    >
      <MockCheckbox checked={selected} highlight={checkboxHighlight} />
      
      <MockAvatar name={client.name} size="md" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold truncate">{client.shortName}</span>
          {client.isHotLead && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <MockStageBadge stage={client.stage} size="xs" />
          {client.value !== "$0" && (
            <span className="text-[10px] font-medium text-muted-foreground">{client.value}</span>
          )}
          {client.projects > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <FolderKanban className="h-3 w-3" />
              {client.projects}
            </span>
          )}
        </div>
      </div>
      
      <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
};

// Compact header for demo
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
  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/50">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-primary/10 rounded-lg">
        <Users className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold">Clients</span>
      <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">
        {totalClients}
      </span>
    </div>
    
    <div className="flex items-center gap-1.5">
      {/* Compact search */}
      <motion.div 
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] ${
          searchActive ? "bg-background border border-primary w-24" : "bg-muted w-8 justify-center"
        }`}
      >
        <Search className={`h-3.5 w-3.5 ${searchActive ? "text-primary" : "text-muted-foreground"}`} />
        {searchActive && <span className="truncate">{searchValue || "..."}</span>}
      </motion.div>
      
      {/* Filter */}
      <motion.div 
        className={`p-1.5 rounded-lg ${filterActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
        animate={filterActive ? { scale: 1.05 } : { scale: 1 }}
      >
        <Filter className="h-3.5 w-3.5" />
      </motion.div>
      
      {/* New Client */}
      <motion.div 
        className={`flex items-center gap-1 px-2 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium ${newButtonHighlight ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
        animate={newButtonHighlight ? { scale: 1.05 } : { scale: 1 }}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </motion.div>
    </div>
  </div>
);

// Bulk actions bar - compact for demo

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

// Client detail drawer mockup - FULL WIDTH for small container demo
const MockClientDrawer = ({ visible = false, activeTab = "activity", activeAction = null }: { 
  visible?: boolean; 
  activeTab?: string;
  activeAction?: string | null;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="absolute inset-0 bg-card shadow-xl overflow-hidden rounded-xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
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
            
            {/* Quick Actions - icon-only for compact demo */}
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-1">
                {[
                  { icon: Mail, label: "Email", id: "email" },
                  { icon: Phone, label: "Call", id: "call" },
                  { icon: MessageSquare, label: "WhatsApp", id: "whatsapp", className: "text-green-600" },
                  { icon: StickyNote, label: "Log", id: "log" },
                  { icon: Briefcase, label: "Project", id: "project" },
                  { icon: Edit, label: "Edit", id: "edit" },
                ].map((action) => (
                  <motion.div 
                    key={action.id}
                    className={`flex items-center gap-1 px-1.5 py-1 border border-border rounded-md cursor-pointer text-[9px] ${activeAction === action.id ? "bg-primary/10 border-primary" : "bg-background"} ${action.className || ""}`}
                    animate={activeAction === action.id ? { scale: 1.05 } : { scale: 1 }}
                  >
                    <action.icon className={`h-3 w-3 ${activeAction === action.id ? "text-primary" : ""}`} />
                    <span>{action.label}</span>
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

// Sample client data for card-based layout - using DemoClientData type
const sampleClients: DemoClientData[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@designstudio.com", stage: "qualified", projects: 3, value: "$12,450", isHotLead: true },
  { id: "2", name: "Chen Industries", email: "m.chen@homeinteriors.au", company: "Chen Industries", stage: "proposal", projects: 2, value: "$8,900" },
  { id: "3", name: "Emma Williams", email: "emma.w@gmail.com", stage: "lead", projects: 0, value: "$0" },
  { id: "4", name: "Brown Corp", email: "james.b@corporate.com", company: "Brown Corp", stage: "approved", projects: 5, value: "$45,200" },
];

// ===========================================
// STREAMLINED STEP COMPONENTS - MOBILE OPTIMIZED
// Uses card-based layout for better readability in small container
// ===========================================

// Step 1: Quick Intro - Card list overview (fast fade in)
export const ClientsStep1 = ({ phase = 0 }: StepProps) => {
  const visibleCards = Math.min(4, Math.floor(phase * 8) + 1);
  
  return (
    <div className="space-y-0">
      <MockCard className="overflow-hidden rounded-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DemoClientHeader />
        </motion.div>
        
        <div className="p-2 space-y-2">
          {sampleClients.map((client, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: i < visibleCards ? 1 : 0,
                x: i < visibleCards ? 0 : -10,
              }}
              transition={{ duration: 0.15, delay: i * 0.05 }}
            >
              <DemoClientCard client={client} />
            </motion.div>
          ))}
        </div>
      </MockCard>
    </div>
  );
};

// Step 2: Search + Filter - visual animation without cursor
export const ClientsStep2 = ({ phase = 0 }: StepProps) => {
  const searchActive = phase > 0.12;
  const searchText = typingProgress(phase, 0.18, 0.45, "Sarah");
  const filterActive = phase > 0.65;
  
  // Filter which clients are visible based on search
  const filteredClients = phase > 0.4 
    ? sampleClients.filter(c => c.name.toLowerCase().includes("sarah"))
    : sampleClients;

  return (
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <DemoClientHeader 
          searchValue={searchText} 
          searchActive={searchActive}
          filterActive={filterActive}
        />
        
        <div className="p-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredClients.slice(0, 4).map((client) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DemoClientCard client={client} highlighted={phase > 0.5 && client.name === "Sarah Johnson"} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </MockCard>
    </div>
  );
};

// Step 3: Add New Client - visual animation without cursor
export const ClientsStep3 = ({ phase = 0 }: StepProps) => {
  const showForm = phase > 0.25 && phase < 0.9;
  const buttonHover = phase > 0.15 && phase < 0.28;

  return (
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <DemoClientHeader newButtonHighlight={buttonHover} />
        
        <div className="p-2 space-y-2">
          {sampleClients.slice(0, 3).map((client, i) => (
            <DemoClientCard key={i} client={client} />
          ))}
        </div>
      </MockCard>
      
      <MockClientForm visible={showForm} />
    </div>
  );
};

// Step 4: Power Select - checkbox selection animation
export const ClientsStep4 = ({ phase = 0 }: StepProps) => {
  const firstChecked = phase > 0.15;
  const secondChecked = phase > 0.38;
  const thirdChecked = phase > 0.62;
  const bulkBarVisible = phase > 0.5;
  
  const selectedCount = (firstChecked ? 1 : 0) + (secondChecked ? 1 : 0) + (thirdChecked ? 1 : 0);

  return (
    <div className="space-y-3 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <DemoClientHeader totalClients={127} />
        
        <div className="p-2 space-y-2">
          <DemoClientCard client={sampleClients[0]} selected={firstChecked} />
          <DemoClientCard client={sampleClients[1]} selected={secondChecked} />
          <DemoClientCard client={sampleClients[2]} selected={thirdChecked} />
          <DemoClientCard client={sampleClients[3]} />
        </div>
      </MockCard>
      
      <AnimatePresence>
        {bulkBarVisible && <MockBulkActionsBar count={selectedCount} />}
      </AnimatePresence>
    </div>
  );
};

// Step 5: Bulk Actions Showcase - highlight animations
export const ClientsStep5 = ({ phase = 0 }: StepProps) => {
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
    </div>
  );
};

// Step 6: Open Client Details - card highlight → drawer
export const ClientsStep6 = ({ phase = 0 }: StepProps) => {
  const cardHighlight = phase > 0.2 && phase < 0.45;
  const drawerVisible = phase > 0.48;

  return (
    <div className="space-y-0 relative h-[340px]">
      <MockCard className="overflow-hidden rounded-xl">
        <DemoClientHeader />
        
        <div className="p-2 space-y-2">
          <DemoClientCard client={sampleClients[0]} highlighted={cardHighlight} />
          <DemoClientCard client={sampleClients[1]} />
          <DemoClientCard client={sampleClients[2]} />
        </div>
      </MockCard>
      
      <DemoClientDrawer visible={drawerVisible} client={sampleClients[0]} activeTab="activity" />
    </div>
  );
};

// Step 7: Quick Actions - action highlight showcase
export const ClientsStep7 = ({ phase = 0 }: StepProps) => {
  const actions = ["email", "call", "whatsapp", "schedule", "edit"];
  const actionPhases = [0.08, 0.2, 0.32, 0.44, 0.56];
  
  const currentAction = actions.find((_, i) => inPhase(phase, actionPhases[i], actionPhases[i] + 0.1));

  return (
    <div className="space-y-0 relative h-[340px]">
      <DemoClientDrawer visible client={sampleClients[0]} activeTab="activity" activeAction={currentAction} />
    </div>
  );
};

// Step 8: Pipeline Management - Stage dropdown animation
export const ClientsStep8 = ({ phase = 0 }: StepProps) => {
  const dropdownOpen = phase > 0.3 && phase < 0.7;
  const newStage = phase > 0.72;

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
                } ${phase > 0.15 && phase < 0.35 ? "ring-2 ring-primary ring-offset-1" : ""}`}
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
    </div>
  );
};

// Step 9: Profile Tabs - tab navigation animation
export const ClientsStep9 = ({ phase = 0 }: StepProps) => {
  const tabs: Array<"activity" | "notes" | "files" | "projects"> = ["activity", "notes", "files", "projects"];
  const tabPhases = [0, 0.25, 0.5, 0.75];
  
  const currentTab = tabs.find((_, i) => {
    const nextPhase = tabPhases[i + 1] || 1;
    return phase >= tabPhases[i] && phase < nextPhase;
  }) || "activity";

  return (
    <div className="space-y-0 relative h-[340px]">
      <DemoClientDrawer visible client={sampleClients[0]} activeTab={currentTab} />
    </div>
  );
};

// Step 10: Create Project from Client - celebration
export const ClientsStep10 = ({ phase = 0 }: StepProps) => {
  const buttonHighlight = phase > 0.2 && phase < 0.45;
  const showSuccess = phase > 0.5;

  return (
    <div className="space-y-0 relative h-[340px]">
      <DemoClientDrawer visible client={sampleClients[0]} activeTab="activity" activeAction={buttonHighlight ? "edit" : null} />
      
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
    </div>
  );
};
