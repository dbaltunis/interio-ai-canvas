import React from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, MessageSquare, Edit2, Plus, ChevronDown,
  ExternalLink, MoreHorizontal, Calendar, FileText, Folder, Clock,
  DollarSign, Briefcase, CheckCircle2, Send, Upload, X, Activity,
  PhoneCall, MessageCircle
} from "lucide-react";
import { PulsingHighlight, MockCard, MockButton, MockBadge } from "../TutorialVisuals";

// ===========================================
// MOCK COMPONENTS FOR CLIENT DETAIL DEMO
// ===========================================

// Stage badge with dropdown appearance
const MockStageDropdown = ({ 
  stage = "Contacted", 
  highlight = false,
  open = false,
}: { 
  stage?: string;
  highlight?: boolean;
  open?: boolean;
}) => {
  const stages = ["Lead", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"];
  
  return (
    <div className={`relative ${highlight ? "" : ""}`}>
      <PulsingHighlight className={highlight ? "" : "hidden"}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium cursor-pointer">
          {stage}
          <ChevronDown className="h-3 w-3" />
        </div>
      </PulsingHighlight>
      {!highlight && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
          {stage}
          <ChevronDown className="h-3 w-3" />
        </div>
      )}
      
      {open && (
        <motion.div 
          className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-10"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {stages.map((s) => (
            <div 
              key={s} 
              className={`px-3 py-1.5 text-xs ${s === stage ? "bg-accent font-medium" : "hover:bg-accent"} cursor-pointer`}
            >
              {s}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Quick action button
const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  highlight = false,
  variant = "default",
}: { 
  icon: React.ElementType;
  label: string;
  highlight?: boolean;
  variant?: "default" | "primary";
}) => (
  <PulsingHighlight className={highlight ? "" : "hidden"}>
    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors ${
      variant === "primary" 
        ? "bg-primary/10 hover:bg-primary/20" 
        : "bg-muted hover:bg-muted/80"
    }`}>
      <Icon className={`h-4 w-4 ${variant === "primary" ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  </PulsingHighlight>
);

// Client avatar large
const MockClientAvatar = ({ name = "Sarah Johnson", highlight = false }: { name?: string; highlight?: boolean }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <div className={`relative ${highlight ? "" : ""}`}>
      <PulsingHighlight className={highlight ? "" : "hidden"}>
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
          {initials}
        </div>
      </PulsingHighlight>
      {!highlight && (
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
          {initials}
        </div>
      )}
    </div>
  );
};

// Contact info field
const MockContactField = ({ 
  icon: Icon, 
  label, 
  value, 
  highlight = false,
  editing = false,
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  editing?: boolean;
}) => (
  <div className={`flex items-start gap-3 p-2 rounded-lg transition-all ${highlight ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <span className="text-[10px] text-muted-foreground block">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2 mt-1">
          <input 
            type="text" 
            defaultValue={value}
            className="flex-1 h-7 px-2 text-xs border border-primary rounded bg-background focus:outline-none"
          />
          <div className="flex gap-1">
            <div className="p-1 bg-primary text-primary-foreground rounded">
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div className="p-1 bg-muted rounded">
              <X className="h-3 w-3" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium truncate">{value}</span>
          {highlight && (
            <PulsingHighlight>
              <Edit2 className="h-3 w-3 text-muted-foreground cursor-pointer" />
            </PulsingHighlight>
          )}
        </div>
      )}
    </div>
  </div>
);

// Activity timeline item
const MockActivityItem = ({ 
  type, 
  title, 
  time, 
  highlight = false 
}: { 
  type: "call" | "email" | "meeting" | "note";
  title: string;
  time: string;
  highlight?: boolean;
}) => {
  const icons = {
    call: PhoneCall,
    email: Mail,
    meeting: Calendar,
    note: FileText,
  };
  const colors = {
    call: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    email: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    meeting: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    note: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
  };
  const Icon = icons[type];
  
  return (
    <div className={`flex gap-3 p-2 rounded-lg ${highlight ? "bg-accent" : ""}`}>
      <div className={`h-8 w-8 rounded-full ${colors[type]} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
};

// Project card
const MockProjectCard = ({ 
  name, 
  status, 
  value, 
  highlight = false 
}: { 
  name: string;
  status: "Draft" | "Sent" | "Approved" | "In Progress";
  value: string;
  highlight?: boolean;
}) => {
  const statusColors = {
    Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Sent: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    Approved: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    "In Progress": "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
  };
  
  return (
    <div className={`p-3 rounded-lg border ${highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">{name}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <DollarSign className="h-3 w-3" />
        <span>{value}</span>
      </div>
    </div>
  );
};

// Tab component
const MockTab = ({ 
  label, 
  active = false, 
  highlight = false,
  icon,
}: { 
  label: string;
  active?: boolean;
  highlight?: boolean;
  icon?: React.ElementType;
}) => {
  const Icon = icon;
  
  return (
    <PulsingHighlight className={highlight ? "" : "hidden"}>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
    </PulsingHighlight>
  );
};

// ===========================================
// STEP COMPONENTS (17 Steps)
// ===========================================

// Step 1: Click to Open Client
export const ClientDetailStep1 = () => (
  <div className="space-y-3">
    <MockCard className="p-3">
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg opacity-50">
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">JB</div>
          <div className="flex-1">
            <span className="text-xs font-medium">James Brown</span>
            <span className="text-[10px] text-muted-foreground block">james.b@corporate.com</span>
          </div>
        </div>
        
        <PulsingHighlight>
          <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg cursor-pointer border border-primary/20">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">SJ</div>
            <div className="flex-1">
              <span className="text-xs font-medium">Sarah Johnson</span>
              <span className="text-[10px] text-muted-foreground block">sarah@designstudio.com</span>
            </div>
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
        </PulsingHighlight>
        
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg opacity-50">
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">MC</div>
          <div className="flex-1">
            <span className="text-xs font-medium">Michael Chen</span>
            <span className="text-[10px] text-muted-foreground block">m.chen@homeinteriors.au</span>
          </div>
        </div>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Click on any client row to open their detail view
    </p>
  </div>
);

// Step 2: Drawer Opens
export const ClientDetailStep2 = () => (
  <div className="space-y-3">
    <motion.div 
      className="bg-card border border-border rounded-lg shadow-xl overflow-hidden"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start gap-4">
          <MockClientAvatar />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Sarah Johnson</h3>
            <p className="text-xs text-muted-foreground">Design Studio Owner</p>
            <div className="mt-2">
              <MockStageDropdown stage="Qualified" />
            </div>
          </div>
          <button className="p-1.5 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Quick preview */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>sarah@designstudio.com</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>+61 400 123 456</span>
        </div>
      </div>
    </motion.div>
    <p className="text-[10px] text-muted-foreground text-center">
      The client detail drawer slides in from the right
    </p>
  </div>
);

// Step 3: Client Header Area
export const ClientDetailStep3 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <PulsingHighlight>
        <div className="flex items-start gap-4 p-2 rounded-lg bg-primary/5">
          <MockClientAvatar highlight />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Sarah Johnson</h3>
            <p className="text-xs text-muted-foreground">Design Studio Owner</p>
            <div className="mt-2 flex items-center gap-2">
              <MockStageDropdown stage="Qualified" />
              <MockBadge variant="secondary">3 projects</MockBadge>
            </div>
          </div>
        </div>
      </PulsingHighlight>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      The header shows client name, avatar, role, and current stage
    </p>
  </div>
);

// Step 4: Stage Dropdown
export const ClientDetailStep4 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-start gap-4">
        <MockClientAvatar />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Sarah Johnson</h3>
          <p className="text-xs text-muted-foreground">Design Studio Owner</p>
          <div className="mt-2">
            <MockStageDropdown stage="Qualified" highlight open />
          </div>
        </div>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Click the stage badge to change the client's pipeline stage
    </p>
  </div>
);

// Step 5: Quick Actions
export const ClientDetailStep5 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <MockClientAvatar />
        <div>
          <h3 className="text-sm font-semibold">Sarah Johnson</h3>
          <p className="text-xs text-muted-foreground">Qualified Lead</p>
        </div>
      </div>
      
      <PulsingHighlight>
        <div className="grid grid-cols-5 gap-2 p-2 bg-muted/30 rounded-lg">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background cursor-pointer">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="text-[9px] text-muted-foreground">Email</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background cursor-pointer">
            <Phone className="h-4 w-4 text-green-500" />
            <span className="text-[9px] text-muted-foreground">Call</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background cursor-pointer">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-[9px] text-muted-foreground">WhatsApp</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background cursor-pointer">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-[9px] text-muted-foreground">Log</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background cursor-pointer">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span className="text-[9px] text-muted-foreground">Schedule</span>
          </div>
        </div>
      </PulsingHighlight>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Quick action buttons for instant communication and logging
    </p>
  </div>
);

// Step 6: New Project & Edit Buttons
export const ClientDetailStep6 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MockClientAvatar />
          <div>
            <h3 className="text-sm font-semibold">Sarah Johnson</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingHighlight>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </div>
          </PulsingHighlight>
          <PulsingHighlight>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium">
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </div>
          </PulsingHighlight>
        </div>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Create new projects or edit client details from the header
    </p>
  </div>
);

// Step 7: Contact Details Section
export const ClientDetailStep7 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        Contact Details
      </h4>
      <div className="space-y-1">
        <MockContactField icon={Mail} label="Email" value="sarah@designstudio.com" />
        <MockContactField icon={Phone} label="Phone" value="+61 400 123 456" />
        <MockContactField icon={MapPin} label="Address" value="123 Design Street, Sydney NSW" />
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      View all contact information in the Details section
    </p>
  </div>
);

// Step 8: Inline Editing
export const ClientDetailStep8 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        Contact Details
      </h4>
      <div className="space-y-1">
        <MockContactField icon={Mail} label="Email" value="sarah@designstudio.com" highlight />
        <MockContactField icon={Phone} label="Phone" value="+61 400 123 456" />
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Click the edit icon to modify any field inline
    </p>
  </div>
);

// Step 9: Edit Mode Active
export const ClientDetailStep9 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        Contact Details
      </h4>
      <div className="space-y-1">
        <MockContactField icon={Mail} label="Email" value="sarah.new@designstudio.com" editing />
        <MockContactField icon={Phone} label="Phone" value="+61 400 123 456" />
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Make changes and save or cancel with the action buttons
    </p>
  </div>
);

// Step 10: Notes Section
export const ClientDetailStep10 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Notes
        </h4>
        <PulsingHighlight>
          <div className="flex items-center gap-1 px-2 py-1 text-xs text-primary cursor-pointer">
            <Edit2 className="h-3 w-3" />
            Edit
          </div>
        </PulsingHighlight>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        Interested in custom curtains for new office renovation. Budget around $15k. 
        Prefers modern, minimalist designs. Follow up next week about fabric samples.
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Add and edit notes to keep track of important client information
    </p>
  </div>
);

// Step 11: Tabs Navigation
export const ClientDetailStep11 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <PulsingHighlight>
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <MockTab label="Activity" icon={Activity} active />
          <MockTab label="Details" icon={User} />
          <MockTab label="Emails" icon={Mail} />
          <MockTab label="Files" icon={Folder} />
        </div>
      </PulsingHighlight>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Navigate between Activity, Details, Emails, and Files tabs
    </p>
  </div>
);

// Step 12: Activity Tab
export const ClientDetailStep12 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg mb-4">
        <MockTab label="Activity" icon={Activity} active highlight />
        <MockTab label="Details" icon={User} />
        <MockTab label="Emails" icon={Mail} />
      </div>
      
      <div className="space-y-2">
        <MockActivityItem type="email" title="Sent quote for office curtains" time="Today, 2:30 PM" highlight />
        <MockActivityItem type="call" title="Phone call - discussed requirements" time="Yesterday" />
        <MockActivityItem type="meeting" title="Site visit scheduled" time="2 days ago" />
        <MockActivityItem type="note" title="Added fabric preferences" time="Last week" />
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      View all client interactions in the Activity timeline
    </p>
  </div>
);

// Step 13: Emails Tab
export const ClientDetailStep13 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg mb-4">
        <MockTab label="Activity" icon={Activity} />
        <MockTab label="Details" icon={User} />
        <MockTab label="Emails" icon={Mail} active highlight />
      </div>
      
      <div className="space-y-2">
        <div className="p-3 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Quote for Office Renovation</span>
            <span className="text-[10px] text-muted-foreground">Today</span>
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2">
            Dear Sarah, Please find attached the quote for your office curtain project...
          </p>
          <div className="flex items-center gap-2 mt-2">
            <MockBadge variant="default">Sent</MockBadge>
            <MockBadge variant="secondary">Opened</MockBadge>
          </div>
        </div>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Track email history and see read receipts
    </p>
  </div>
);

// Step 14: Files Tab
export const ClientDetailStep14 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg mb-4">
        <MockTab label="Activity" icon={Activity} />
        <MockTab label="Details" icon={User} />
        <MockTab label="Files" icon={Folder} active highlight />
      </div>
      
      <div className="space-y-2">
        <PulsingHighlight>
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 cursor-pointer">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary font-medium">Upload Files</span>
          </div>
        </PulsingHighlight>
        
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
          <FileText className="h-8 w-8 text-blue-500" />
          <div className="flex-1">
            <p className="text-xs font-medium">site_photos.zip</p>
            <p className="text-[10px] text-muted-foreground">2.4 MB • Uploaded yesterday</p>
          </div>
        </div>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Upload and manage client-related files and documents
    </p>
  </div>
);

// Step 15: Projects Section
export const ClientDetailStep15 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Projects
        </h4>
        <MockBadge variant="secondary">3 total</MockBadge>
      </div>
      
      <div className="space-y-2">
        <MockProjectCard name="Office Curtains" status="Sent" value="$12,450" highlight />
        <MockProjectCard name="Meeting Room Blinds" status="Draft" value="$3,200" />
        <MockProjectCard name="Reception Drapes" status="Approved" value="$8,900" />
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      View all projects associated with this client
    </p>
  </div>
);

// Step 16: Project Card Details
export const ClientDetailStep16 = () => (
  <div className="space-y-3 flex flex-col items-center justify-center">
    <motion.div 
      className="w-full max-w-[260px]"
      initial={{ scale: 1 }}
      animate={{ scale: 1.1 }}
    >
      <PulsingHighlight>
        <div className="p-4 rounded-lg border border-primary bg-card shadow-lg">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Office Curtains</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              Sent
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quote Value</span>
              <span className="font-medium">$12,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Windows</span>
              <span className="font-medium">8 items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">Jan 15, 2026</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <div className="flex-1 py-1.5 text-center text-xs font-medium bg-primary text-primary-foreground rounded cursor-pointer">
              Open
            </div>
            <div className="flex-1 py-1.5 text-center text-xs font-medium border border-border rounded cursor-pointer">
              Edit
            </div>
          </div>
        </div>
      </PulsingHighlight>
    </motion.div>
    <p className="text-[10px] text-muted-foreground text-center">
      Click a project to view details, open, or edit the quote
    </p>
  </div>
);

// Step 17: New Project Button
export const ClientDetailStep17 = () => (
  <div className="space-y-3">
    <MockCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Projects
        </h4>
      </div>
      
      <div className="space-y-2">
        <MockProjectCard name="Office Curtains" status="Sent" value="$12,450" />
        
        <PulsingHighlight>
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary font-medium">Create New Project</span>
          </div>
        </PulsingHighlight>
      </div>
    </MockCard>
    <p className="text-[10px] text-muted-foreground text-center">
      Click to start a new quote or project for this client
    </p>
  </div>
);
