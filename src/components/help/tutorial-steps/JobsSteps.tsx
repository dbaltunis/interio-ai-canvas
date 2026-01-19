import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Search, Filter, Plus, MoreHorizontal, X, Check,
  ChevronDown, FileText, Ruler, FolderOpen, Activity, Settings2,
  DollarSign, Home, Layers, Sparkles, ArrowRight, Send, CheckCircle,
  Eye, Edit2, Copy, Archive, Trash2, StickyNote, Play
} from "lucide-react";
import { MockCard } from "../TutorialVisuals";
import { inPhase, typingProgress, phaseProgress } from "@/lib/demoAnimations";

interface StepProps {
  phase?: number;
}

// ===========================================
// MOBILE-OPTIMIZED JOBS DEMO COMPONENTS
// Designed for small container (~500px width)
// Uses card-based layout for better readability
// ===========================================

// Job status badge with exact colors
const MockStatusBadge = ({ 
  status, 
  highlight = false,
  pulse = false,
  size = "sm",
}: { 
  status: "draft" | "sent" | "approved" | "in_progress" | "completed" | "cancelled";
  highlight?: boolean;
  pulse?: boolean;
  size?: "sm" | "xs";
}) => {
  const colors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    sent: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    approved: "Approved",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <motion.span 
      className={`px-1.5 py-0.5 rounded-md ${size === "xs" ? "text-[9px]" : "text-[10px]"} font-medium border ${colors[status]} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""}`}
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {labels[status]}
    </motion.span>
  );
};

// Job avatar - client initials
const MockJobAvatar = ({ name, className = "", size = "sm" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) => {
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

// Job data interface
interface JobData {
  jobNumber: string;
  client: string;
  clientShort: string;
  project: string;
  status: "draft" | "sent" | "approved" | "in_progress" | "completed" | "cancelled";
  rooms: number;
  windows: number;
  total: string;
}

// Card-based job display - mobile friendly
const MockJobCard = ({ 
  job,
  highlighted = false,
  onClick,
}: { 
  job: JobData;
  highlighted?: boolean;
  onClick?: () => void;
}) => {
  return (
    <motion.div 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
        highlighted ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20" : 
        "bg-card border-border/60 hover:bg-muted/40"
      }`}
      animate={highlighted ? { scale: 1.01 } : {}}
      onClick={onClick}
    >
      <MockJobAvatar name={job.client} size="md" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">{job.jobNumber}</span>
          <span className="text-sm font-semibold truncate">{job.clientShort}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <MockStatusBadge status={job.status} size="xs" />
          <span className="text-[10px] text-muted-foreground truncate">{job.project}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Home className="h-3 w-3" />
            {job.rooms}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Layers className="h-3 w-3" />
            {job.windows}
          </span>
          <span className="text-[10px] font-medium text-primary">{job.total}</span>
        </div>
      </div>
      
      <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
};

// Compact header for jobs demo
const MockJobsHeader = ({ 
  totalJobs = 24,
  searchValue = "",
  searchActive = false,
  filterActive = false,
  newButtonHighlight = false,
}: {
  totalJobs?: number;
  searchValue?: string;
  searchActive?: boolean;
  filterActive?: boolean;
  newButtonHighlight?: boolean;
}) => (
  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/50">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-primary/10 rounded-lg">
        <Briefcase className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold">Jobs</span>
      <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">
        {totalJobs}
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
      
      {/* New Job */}
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

// Job create dialog mockup
const MockJobCreateDialog = ({ visible = false, typing = "" }: { visible?: boolean; typing?: string }) => (
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
            <h3 className="text-sm font-semibold">Create New Job</h3>
            <X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Select Client *</label>
              <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center text-[10px]">
                <span className="text-muted-foreground">Choose a client...</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Project Name *</label>
              <div className="h-8 bg-background rounded-lg border border-primary px-2 flex items-center text-[10px]">
                {typing}
                <motion.span 
                  className="w-0.5 h-4 bg-primary ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Initial Status</label>
              <div className="h-8 bg-background rounded-lg border border-border px-2 flex items-center justify-between text-[10px]">
                <span>Draft</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <div className="px-3 py-1.5 text-[10px] border border-border rounded-lg">Cancel</div>
            <div className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Create Job
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Job detail panel - FULL WIDTH for small container demo
const MockJobDetailPanel = ({ 
  visible = false, 
  activeTab = "quote",
  job = sampleJobs[0],
}: { 
  visible?: boolean; 
  activeTab?: string;
  job?: JobData;
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
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60">
            <div className="p-3 pb-2">
              <div className="flex items-start gap-3">
                <MockJobAvatar name={job.client} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{job.jobNumber}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-tight">{job.clientShort}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{job.project}</p>
                  
                  {/* Status selector */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <MockStatusBadge status={job.status} />
                  </div>
                </div>
                <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="px-3 pb-2">
              <div className="flex gap-3">
                <div className="flex items-center gap-1 text-[10px]">
                  <Home className="h-3 w-3 text-muted-foreground" />
                  <span>{job.rooms} rooms</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  <span>{job.windows} windows</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                  <DollarSign className="h-3 w-3" />
                  <span>{job.total}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="px-3 pt-2">
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-lg">
              {[
                { id: "quote", icon: FileText, label: "Quote" },
                { id: "measure", icon: Ruler, label: "Measure" },
                { id: "docs", icon: FolderOpen, label: "Docs" },
                { id: "activity", icon: Activity, label: "Activity" },
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
            {activeTab === "quote" && (
              <>
                <div className="p-2.5 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-medium">Living Room</p>
                      <p className="text-[9px] text-muted-foreground">2 windows • Roller Blinds</p>
                    </div>
                    <span className="text-[10px] font-medium text-primary">$1,250</span>
                  </div>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-medium">Master Bedroom</p>
                      <p className="text-[9px] text-muted-foreground">3 windows • Curtains</p>
                    </div>
                    <span className="text-[10px] font-medium text-primary">$2,100</span>
                  </div>
                </div>
              </>
            )}
            {activeTab === "measure" && (
              <div className="text-center py-4">
                <Ruler className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-[10px] text-muted-foreground">Measurement data</p>
              </div>
            )}
            {activeTab === "docs" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Quote.pdf</p>
                </div>
                <div className="p-2.5 bg-muted/30 rounded-xl text-center">
                  <FolderOpen className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[9px] truncate">Photos</p>
                </div>
              </div>
            )}
            {activeTab === "activity" && (
              <>
                <div className="flex gap-2 p-2.5 bg-muted/30 rounded-xl">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium">Quote approved</p>
                    <p className="text-[9px] text-muted-foreground">Yesterday at 3:45 PM</p>
                  </div>
                </div>
                <div className="flex gap-2 p-2.5 bg-muted/30 rounded-xl">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Send className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium">Quote sent to client</p>
                    <p className="text-[9px] text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Actions dropdown
const MockActionsMenu = ({ visible = false, highlightAction = "" }: { visible?: boolean; highlightAction?: string }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-20"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
      >
        {[
          { id: "view", icon: Eye, label: "View Details" },
          { id: "edit", icon: Edit2, label: "Edit Job" },
          { id: "notes", icon: StickyNote, label: "Add Notes" },
          { id: "duplicate", icon: Copy, label: "Duplicate" },
          { id: "archive", icon: Archive, label: "Archive" },
          { id: "delete", icon: Trash2, label: "Delete", danger: true },
        ].map((action) => (
          <motion.div 
            key={action.id}
            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] cursor-pointer ${
              action.id === highlightAction ? "bg-primary/10 text-primary font-medium" : 
              action.danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-accent"
            }`}
            animate={action.id === highlightAction ? { x: [0, 3, 0] } : {}}
          >
            <action.icon className="h-3 w-3" />
            {action.label}
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Status flow visualization
const MockStatusFlow = ({ currentStatus = 0, animating = false }: { currentStatus?: number; animating?: boolean }) => {
  const statuses = [
    { label: "Draft", color: "bg-muted" },
    { label: "Sent", color: "bg-blue-500" },
    { label: "Approved", color: "bg-green-500" },
    { label: "In Progress", color: "bg-yellow-500" },
    { label: "Completed", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex items-center gap-1">
      {statuses.map((status, i) => (
        <React.Fragment key={status.label}>
          <motion.div 
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium ${
              i <= currentStatus 
                ? `${status.color} text-white` 
                : "bg-muted text-muted-foreground"
            }`}
            animate={i === currentStatus && animating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {i < currentStatus && <Check className="h-2.5 w-2.5" />}
            {status.label}
          </motion.div>
          {i < statuses.length - 1 && (
            <ArrowRight className={`h-3 w-3 ${i < currentStatus ? "text-primary" : "text-muted-foreground/30"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Sample job data
const sampleJobs: JobData[] = [
  { jobNumber: "JOB-001", client: "Sarah Johnson", clientShort: "Sarah J.", status: "approved", project: "Living Room", rooms: 2, windows: 5, total: "$4,250" },
  { jobNumber: "JOB-002", client: "Chen Industries", clientShort: "Chen Ind.", status: "in_progress", project: "Office Renovation", rooms: 4, windows: 12, total: "$12,800" },
  { jobNumber: "JOB-003", client: "Emma Wilson", clientShort: "Emma W.", status: "draft", project: "Master Bedroom", rooms: 1, windows: 3, total: "$1,950" },
  { jobNumber: "JOB-004", client: "Thompson Group", clientShort: "Thompson G.", status: "sent", project: "Conference Room", rooms: 1, windows: 6, total: "$5,100" },
];

// ===========================================
// STREAMLINED STEP COMPONENTS - MOBILE OPTIMIZED
// ===========================================

// Step 1: Jobs Overview - Card list with quick fade in
export const JobsStep1 = ({ phase = 0 }: StepProps) => {
  const visibleCards = Math.min(4, Math.floor(phase * 8) + 1);
  
  return (
    <div className="space-y-0">
      <MockCard className="overflow-hidden rounded-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <MockJobsHeader />
        </motion.div>
        
        <div className="p-2 space-y-2">
          {sampleJobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: i < visibleCards ? 1 : 0,
                x: i < visibleCards ? 0 : -10,
              }}
              transition={{ duration: 0.15, delay: i * 0.05 }}
            >
              <MockJobCard job={job} />
            </motion.div>
          ))}
        </div>
      </MockCard>
    </div>
  );
};

// Step 2: Search + Filter
export const JobsStep2 = ({ phase = 0 }: StepProps) => {
  const searchActive = phase > 0.12;
  const searchText = typingProgress(phase, 0.18, 0.45, "Living");
  const filterActive = phase > 0.65;
  
  // Filter jobs based on search
  const filteredJobs = phase > 0.4 
    ? sampleJobs.filter(j => j.project.toLowerCase().includes("living"))
    : sampleJobs;

  return (
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockJobsHeader 
          searchValue={searchText} 
          searchActive={searchActive}
          filterActive={filterActive}
        />
        
        <div className="p-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredJobs.slice(0, 4).map((job) => (
              <motion.div
                key={job.jobNumber}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MockJobCard job={job} highlighted={phase > 0.5 && job.project.includes("Living")} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </MockCard>
    </div>
  );
};

// Step 3: Create New Job
export const JobsStep3 = ({ phase = 0 }: StepProps) => {
  const showForm = phase > 0.25 && phase < 0.9;
  const buttonHover = phase > 0.15 && phase < 0.28;
  const typingText = typingProgress(phase, 0.4, 0.7, "Kitchen Renovation");

  return (
    <div className="space-y-0 relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockJobsHeader newButtonHighlight={buttonHover} />
        
        <div className="p-2 space-y-2">
          {sampleJobs.slice(0, 3).map((job, i) => (
            <MockJobCard key={i} job={job} />
          ))}
        </div>
      </MockCard>
      
      <MockJobCreateDialog visible={showForm} typing={typingText} />
    </div>
  );
};

// Step 4: Open Job Details
export const JobsStep4 = ({ phase = 0 }: StepProps) => {
  const cardHighlight = phase > 0.2 && phase < 0.45;
  const panelVisible = phase > 0.48;

  return (
    <div className="space-y-0 relative h-[300px]">
      <MockCard className="overflow-hidden rounded-xl">
        <MockJobsHeader />
        
        <div className="p-2 space-y-2">
          <MockJobCard job={sampleJobs[0]} highlighted={cardHighlight} />
          <MockJobCard job={sampleJobs[1]} />
          <MockJobCard job={sampleJobs[2]} />
        </div>
      </MockCard>
      
      <MockJobDetailPanel visible={panelVisible} activeTab="quote" job={sampleJobs[0]} />
    </div>
  );
};

// Step 5: Status Flow Visualization
export const JobsStep5 = ({ phase = 0 }: StepProps) => {
  const currentStatus = Math.floor(phase * 5);
  const animating = true;

  return (
    <div className="space-y-4 flex flex-col items-center justify-center h-[280px]">
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-sm font-semibold mb-1">Job Pipeline</h3>
        <p className="text-[10px] text-muted-foreground">Move jobs through stages automatically</p>
      </motion.div>
      
      <MockStatusFlow currentStatus={currentStatus} animating={animating} />
      
      <motion.p 
        className="text-[10px] text-muted-foreground text-center mt-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Each stage triggers notifications & updates
      </motion.p>
    </div>
  );
};

// Step 6: Quick Actions Menu
export const JobsStep6 = ({ phase = 0 }: StepProps) => {
  const actions = ["view", "edit", "notes", "duplicate", "archive"];
  const actionIndex = Math.floor(phase * 5);
  const highlightAction = actions[Math.min(actionIndex, actions.length - 1)];
  const menuVisible = phase > 0.1;

  return (
    <div className="space-y-3 relative">
      <MockCard className="p-3 rounded-xl">
        <div className="flex items-center gap-3 relative">
          <MockJobAvatar name="Sarah Johnson" size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">JOB-001</span>
              <span className="text-sm font-semibold">Sarah J.</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Living Room • $4,250</p>
          </div>
          <motion.div 
            className="p-1.5 rounded-lg bg-muted"
            animate={{ scale: phase > 0.05 ? 1.1 : 1 }}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </motion.div>
          <MockActionsMenu visible={menuVisible} highlightAction={highlightAction} />
        </div>
      </MockCard>
      
      <motion.p 
        className="text-[10px] text-muted-foreground text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Quick actions for every job
      </motion.p>
    </div>
  );
};

// Step 7: Project Content - Rooms and Windows
export const JobsStep7 = ({ phase = 0 }: StepProps) => {
  const activeTab = phase < 0.33 ? "quote" : phase < 0.66 ? "measure" : "docs";

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockJobDetailPanel visible activeTab={activeTab} job={sampleJobs[0]} />
    </div>
  );
};

// Step 8: Job Completion Celebration
export const JobsStep8 = ({ phase = 0 }: StepProps) => {
  const showSuccess = phase > 0.4;
  const showConfetti = phase > 0.5;

  return (
    <div className="space-y-0 relative h-[280px]">
      <MockCard className="overflow-hidden rounded-xl h-full">
        <MockJobsHeader />
        
        <div className="p-2 space-y-2">
          <MockJobCard job={{ ...sampleJobs[0], status: phase > 0.35 ? "completed" : "in_progress" }} />
          <MockJobCard job={sampleJobs[1]} />
        </div>
      </MockCard>
      
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl"
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
                className="w-16 h-16 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">Job Completed! 🎉</h3>
              <p className="text-[10px] text-muted-foreground">Sarah Johnson - Living Room</p>
              <p className="text-sm font-semibold text-primary mt-2">$4,250</p>
              
              {showConfetti && (
                <motion.div 
                  className="mt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-2xl">🎊</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
