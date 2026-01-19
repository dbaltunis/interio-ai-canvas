import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderOpen, Search, Filter, Plus, MoreVertical, X, Check,
  ChevronDown, FileText, Ruler, Activity, Settings2,
  DollarSign, Home, Layers, Sparkles, ArrowRight, Send, CheckCircle,
  Eye, Edit2, Copy, Archive, Trash2, StickyNote, Play, Pause,
  ChevronRight, Users, MapPin, Phone, Mail, Calendar, Clock,
  Receipt, Download, Printer, CreditCard, Building2, Share2, Link2,
  Hammer, Truck, ClipboardList, Package, Scissors, Maximize2,
  Square, CircleDot, ArrowUpDown, Grip, Image, Palette, Grid3X3,
  LayoutGrid, List, Tag, Percent, ExternalLink, QrCode, Wrench,
  AlertCircle, Info, HelpCircle, Blinds, ChevronUp, MoreHorizontal,
  User, ArrowLeft, Pencil, Star, Bed, ChefHat, Bath, Briefcase,
  ScanLine, FileType, CircleCheck, MessageCircle
} from "lucide-react";
import { MockCard } from "../TutorialVisuals";
import { inPhase, typingProgress, phaseProgress } from "@/lib/demoAnimations";
// Import REAL UI components for 100% visual accuracy
import { DemoJobCard, DemoRoomHeader, DemoJobDetailHeader, DemoJobDetailTabs, DemoStatusBadge } from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// COMPREHENSIVE JOBS/PROJECTS TUTORIAL
// 37 Steps covering the complete job lifecycle
// PIXEL-PERFECT matching actual app UI (~95% accuracy)
// ===========================================

// ===== SHARED COMPONENTS - MATCHING REAL UI EXACTLY =====

// Job status badge - EXACT match to JobStatusBadge.tsx with proper color mapping
const MockStatusBadge = ({ 
  status, 
  highlight = false,
  pulse = false,
  size = "sm",
  showDot = false,
}: { 
  status: "draft" | "quote_sent" | "approved" | "planning" | "in_production" | "completed" | "rejected" | "order_confirmed" | "review" | "lead";
  highlight?: boolean;
  pulse?: boolean;
  size?: "sm" | "xs" | "md";
  showDot?: boolean;
}) => {
  // EXACT colors from JobStatusBadge.tsx colorMap - matching database job_statuses
  const colors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    lead: { bg: "bg-gray-100 dark:bg-gray-700/50", text: "text-gray-800 dark:text-gray-200", border: "border-gray-200 dark:border-gray-600", dot: "bg-gray-400" },
    draft: { bg: "bg-gray-100 dark:bg-gray-700/50", text: "text-gray-800 dark:text-gray-200", border: "border-gray-200 dark:border-gray-600", dot: "bg-gray-400" },
    quote_sent: { bg: "bg-blue-100 dark:bg-blue-600/30", text: "text-blue-800 dark:text-blue-200", border: "border-blue-200 dark:border-blue-500/50", dot: "bg-blue-500" },
    approved: { bg: "bg-green-100 dark:bg-green-600/30", text: "text-green-800 dark:text-green-200", border: "border-green-200 dark:border-green-500/50", dot: "bg-green-500" },
    planning: { bg: "bg-blue-100 dark:bg-blue-600/30", text: "text-blue-800 dark:text-blue-200", border: "border-blue-200 dark:border-blue-500/50", dot: "bg-blue-500" },
    in_production: { bg: "bg-purple-100 dark:bg-purple-600/30", text: "text-purple-800 dark:text-purple-200", border: "border-purple-200 dark:border-purple-500/50", dot: "bg-purple-500" },
    completed: { bg: "bg-green-100 dark:bg-green-600/30", text: "text-green-800 dark:text-green-200", border: "border-green-200 dark:border-green-500/50", dot: "bg-green-500" },
    rejected: { bg: "bg-red-100 dark:bg-red-600/30", text: "text-red-800 dark:text-red-200", border: "border-red-200 dark:border-red-500/50", dot: "bg-red-500" },
    order_confirmed: { bg: "bg-orange-100 dark:bg-orange-600/30", text: "text-orange-800 dark:text-orange-200", border: "border-orange-200 dark:border-orange-500/50", dot: "bg-orange-500" },
    review: { bg: "bg-yellow-100 dark:bg-yellow-600/30", text: "text-yellow-800 dark:text-yellow-200", border: "border-yellow-200 dark:border-yellow-500/50", dot: "bg-yellow-500" },
  };

  const labels: Record<string, string> = {
    lead: "Lead",
    draft: "Draft",
    quote_sent: "Quote Sent",
    approved: "Approved",
    planning: "Planning",
    in_production: "In Production",
    completed: "Completed",
    rejected: "Rejected",
    order_confirmed: "Order Confirmed",
    review: "Review",
  };

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px]",
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const c = colors[status];

  return (
    <motion.span 
      className={`${sizeClasses[size]} rounded font-medium border ${c.bg} ${c.text} ${c.border} ${highlight ? "ring-2 ring-primary ring-offset-1" : ""} inline-flex items-center gap-1.5`}
      animate={pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {showDot && <span className={`w-2 h-2 rounded-full ${c.dot}`} />}
      {labels[status]}
    </motion.span>
  );
};

// Avatar component - EXACT match to MobileJobsView.tsx Avatar
const MockJobAvatar = ({ name, className = "", size = "sm" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  // Avatar colors matching real app - bg-info, bg-success, bg-primary, bg-warning
  const colors = ["bg-info", "bg-success", "bg-primary", "bg-warning", "bg-secondary", "bg-accent"];
  const colorIndex = name.length % colors.length;
  const sizeClass = size === "lg" ? "h-10 w-10 text-xs" : size === "md" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[10px]";
  
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIndex]} flex items-center justify-center text-primary-foreground font-semibold shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

// Job data interface with real format matching database schema
interface JobData {
  jobNumber: string;
  client: string;
  status: "draft" | "quote_sent" | "approved" | "planning" | "in_production" | "completed" | "rejected" | "order_confirmed" | "review" | "lead";
  project: string;
  rooms: number;
  windows: number;
  total: string;
  notesCount?: number;
}

// Sample job data - MATCHING format-job-number.ts (P-XXXX format)
const sampleJobs: JobData[] = [
  { jobNumber: "P-1234", client: "Sarah Johnson", status: "approved", project: "Living Room Renovation", rooms: 2, windows: 5, total: "$4,250", notesCount: 2 },
  { jobNumber: "P-1235", client: "Chen Industries", status: "in_production", project: "Office Blinds", rooms: 4, windows: 12, total: "$12,800", notesCount: 0 },
  { jobNumber: "P-1236", client: "Wilson Home", status: "draft", project: "Master Bedroom", rooms: 1, windows: 3, total: "$1,950", notesCount: 1 },
  { jobNumber: "P-1237", client: "Garcia Family", status: "quote_sent", project: "Conference Room", rooms: 1, windows: 6, total: "$5,100", notesCount: 0 },
];

// Room data - MATCHING RoomHeader.tsx structure with gradient and pricing
interface RoomData {
  id?: string;
  name: string;
  type: string;
  icon: any;
  windows: number;
  treatments: string[];
  total: string;
}

const sampleRooms: RoomData[] = [
  { name: "Living Room", type: "living", icon: Home, windows: 3, treatments: ["Sheer Curtains", "Roller Blinds"], total: "$2,450.90" },
  { name: "Master Bedroom", type: "bedroom", icon: Bed, windows: 2, treatments: ["Blackout Curtains"], total: "$1,800.00" },
];

// Treatment types - MATCHING REAL TreatmentTypeGrid.tsx categories
const treatmentTypes = [
  { name: "Sheer Curtains", category: "CURTAINS", icon: Layers, color: "bg-pink-100 text-pink-600" },
  { name: "Blockout Curtains", category: "CURTAINS", icon: Layers, color: "bg-purple-100 text-purple-600" },
  { name: "S-Fold Curtains", category: "CURTAINS", icon: Layers, color: "bg-violet-100 text-violet-600" },
  { name: "Roller Blinds", category: "BLINDS", icon: Blinds, color: "bg-blue-100 text-blue-600" },
  { name: "Venetian Blinds", category: "BLINDS", icon: Grid3X3, color: "bg-cyan-100 text-cyan-600" },
  { name: "Roman Blinds", category: "BLINDS", icon: Layers, color: "bg-orange-100 text-orange-600" },
];

// ===== HEADER COMPONENTS - MATCHING REAL JobsPage.tsx exactly =====

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
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2.5 border-b border-border bg-card/50">
    <div className="flex items-center gap-2">
      {/* Real icon from JobsPage - FolderOpen in primary/10 container */}
      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
        <FolderOpen className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold">Projects</span>
      <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">
        {totalJobs}
      </span>
    </div>
    
    <div className="flex flex-wrap items-center gap-2">
      {/* Search Input - ALWAYS VISIBLE like real JobsPage */}
      <div className="relative w-full sm:w-32 lg:w-40">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <div className={`h-8 rounded-lg border pl-8 pr-3 flex items-center text-xs ${
          searchActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input bg-background"
        }`}>
          <span className={searchValue ? "text-foreground" : "text-muted-foreground"}>
            {searchValue || "Search..."}
          </span>
        </div>
      </div>
      
      {/* Filter button */}
      <motion.div 
        className={`h-8 w-8 flex items-center justify-center rounded-lg border ${filterActive ? "bg-primary/10 text-primary border-primary" : "bg-background border-input text-muted-foreground"}`}
        animate={filterActive ? { scale: 1.05 } : { scale: 1 }}
      >
        <Filter className="h-3.5 w-3.5" />
      </motion.div>
      
      {/* New button - primary CTA */}
      <motion.div 
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium ${newButtonHighlight ? "ring-2 ring-primary/50 ring-offset-2" : ""}`}
        animate={newButtonHighlight ? { scale: 1.05 } : { scale: 1 }}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New</span>
      </motion.div>
    </div>
  </div>
);

// Job card - NOW USES REAL DemoJobCard component for 100% accuracy
const statusToColor: Record<string, string> = {
  lead: "gray",
  draft: "gray",
  quote_sent: "blue",
  approved: "green",
  planning: "blue",
  in_production: "purple",
  completed: "green",
  rejected: "red",
  order_confirmed: "orange",
  review: "yellow",
};

const MockJobCard = ({ 
  job,
  highlighted = false,
  showActions = false,
  compact = false,
}: { 
  job: JobData;
  highlighted?: boolean;
  showActions?: boolean;
  compact?: boolean;
}) => (
  <motion.div animate={highlighted ? { scale: 1.01 } : {}}>
    <DemoJobCard
      jobNumber={job.jobNumber}
      clientName={job.client}
      projectName={compact ? undefined : job.project}
      status={job.status}
      statusColor={statusToColor[job.status] || "gray"}
      totalAmount={job.total}
      notesCount={job.notesCount}
      highlighted={highlighted}
    />
  </motion.div>
);

// ===== JOB DETAIL HEADER - NOW USES REAL DemoJobDetailHeader component =====

const MockJobDetailHeader = ({ 
  clientName = "Sarah Johnson",
  jobNumber = "P-1234",
  date = "14-Jan-2026",
  status = "draft" as const,
  showBackButton = true,
}: {
  clientName?: string;
  jobNumber?: string;
  date?: string;
  status?: "draft" | "quote_sent" | "approved" | "planning" | "in_production" | "completed";
  showBackButton?: boolean;
}) => (
  <DemoJobDetailHeader
    jobNumber={jobNumber}
    createdDate={date}
    status={status}
    statusColor={statusToColor[status] || "gray"}
  />
);

// ===== JOB DETAIL TABS - NOW USES REAL DemoJobDetailTabs component =====

const MockJobDetailTabs = ({ 
  activeTab = "details",
  onTabChange,
  highlightedTab,
}: { 
  activeTab?: "details" | "rooms" | "quotation" | "workroom";
  onTabChange?: (tab: string) => void;
  highlightedTab?: "details" | "rooms" | "quotation" | "workroom" | null;
}) => (
  <DemoJobDetailTabs
    activeTab={activeTab}
    onTabChange={onTabChange as any}
    highlightedTab={highlightedTab}
  />
);

// ===== ROOM CARD - NOW USES REAL DemoRoomHeader component =====

const MockRoomCard = ({ 
  room, 
  highlighted = false, 
  expanded = true,
  onExpand,
  windows = [],
}: { 
  room: RoomData; 
  highlighted?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  windows?: any[];
}) => (
  <motion.div 
    className={`rounded-lg border overflow-hidden transition-all bg-card shadow-sm hover:shadow-md ${
      highlighted ? "border-primary/30 ring-2 ring-primary/20" : "border-border hover:border-primary/20"
    }`}
    animate={highlighted ? { scale: 1.01 } : {}}
  >
    {/* Header - USES REAL DemoRoomHeader for 100% accuracy */}
    <DemoRoomHeader
      roomName={room.name}
      roomTotal={room.total}
      isOpen={expanded}
      onToggle={onExpand}
      highlighted={highlighted}
      compact={false}
    />
    
    {/* Expanded content - windows/treatments */}
    <AnimatePresence>
      {expanded && (
        <motion.div 
          className="p-4 space-y-3 bg-card"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {windows.length > 0 ? windows.map((w, i) => (
            <MockWindowTreatmentCard key={i} {...w} />
          )) : (
            // Default window cards
            [1, 2].slice(0, room.windows > 2 ? 2 : room.windows).map((num) => (
              <MockWindowTreatmentCard 
                key={num} 
                windowName={`Window ${num}`}
                treatmentName={room.treatments[0] || "Curtain"}
                treatmentDetails="Heading 1 • Unlined"
                width="1000.00"
                height="1000.00"
                total="$273.54"
              />
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ===== WINDOW TREATMENT CARD - MATCHING REAL LAYOUT with fabric image =====

const MockWindowTreatmentCard = ({
  windowName = "Window 1",
  treatmentName = "Curtain testing",
  treatmentDetails = "Heading 1 • Unlined",
  width = "1000.00",
  height = "1000.00",
  total = "$273.54",
  fabricColor = "bg-amber-200",
  highlighted = false,
}: {
  windowName?: string;
  treatmentName?: string;
  treatmentDetails?: string;
  width?: string;
  height?: string;
  total?: string;
  fabricColor?: string;
  highlighted?: boolean;
}) => (
  <motion.div 
    className={`border rounded-lg overflow-hidden ${highlighted ? "border-primary/30 ring-2 ring-primary/20" : "border-border"}`}
    animate={highlighted ? { scale: 1.02 } : {}}
  >
    {/* Window header */}
    <div className="flex items-center justify-between p-2 bg-muted/20 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{windowName}</span>
        <Pencil className="h-3 w-3 text-muted-foreground cursor-pointer" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-7 w-7 flex items-center justify-center rounded border border-border bg-background hover:bg-muted cursor-pointer">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="h-7 w-7 flex items-center justify-center rounded border border-destructive/30 bg-background hover:bg-destructive/10 cursor-pointer">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </div>
      </div>
    </div>
    
    {/* Treatment details with fabric image */}
    <div className="p-3 flex gap-3">
      {/* Fabric image placeholder */}
      <div className={`w-16 h-20 rounded shrink-0 relative overflow-hidden ${fabricColor}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Treatment name and details link */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{treatmentName}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-pointer hover:text-foreground">
            Details <ChevronRight className="h-3 w-3" />
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">{treatmentDetails}</p>
        
        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-muted-foreground">Width</span>
            <p className="font-medium">{width} mm</p>
          </div>
          <div>
            <span className="text-muted-foreground">Height</span>
            <p className="font-medium">{height} mm</p>
          </div>
        </div>
        
        {/* Total */}
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">Total</span>
          <p className="font-semibold text-primary">{total}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Window card for worksheet (simpler version)
const MockWindowCard = ({ 
  windowNum = 1,
  dimensions = "1500 x 2100",
  treatment = "Roller Blind",
  highlighted = false,
}: {
  windowNum?: number;
  dimensions?: string;
  treatment?: string;
  highlighted?: boolean;
}) => (
  <motion.div 
    className={`p-2.5 rounded-lg border transition-all ${
      highlighted ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20" : "bg-card border-border/60"
    }`}
    animate={highlighted ? { scale: 1.02 } : {}}
  >
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-muted rounded">
        <Square className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium">Window {windowNum}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{dimensions}mm</span>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">{treatment}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  </motion.div>
);

// ===== DIALOG COMPONENTS =====

// Job create dialog
const MockJobCreateDialog = ({ 
  visible = false, 
  typing = "",
  step = 1,
}: { 
  visible?: boolean; 
  typing?: string;
  step?: number;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card border border-border rounded-xl shadow-xl p-4 w-[90%] max-w-[300px]"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Create New Job</h3>
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? "w-4 bg-primary" : s < step ? "w-1.5 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="space-y-3">
            {step === 1 && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Select Client *</label>
                <div className="h-9 bg-background rounded-lg border border-border px-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Choose a client...</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Project Name *</label>
                <div className="h-9 bg-background rounded-lg border border-primary px-3 flex items-center text-xs">
                  {typing}
                  <motion.span 
                    className="w-0.5 h-4 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              </div>
            )}
            {step === 3 && (
              <>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Initial Status</label>
                  <div className="h-9 bg-background rounded-lg border border-border px-3 flex items-center justify-between text-xs">
                    <MockStatusBadge status="draft" size="xs" />
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Priority</label>
                  <div className="flex gap-2">
                    {["Low", "Normal", "High"].map((p) => (
                      <div key={p} className={`flex-1 py-1.5 text-center rounded-lg text-[10px] border ${p === "Normal" ? "border-primary bg-primary/10" : "border-border"}`}>{p}</div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-between gap-2 mt-4">
            <div className="px-3 py-1.5 text-[10px] border border-border rounded-lg">
              {step > 1 ? "Back" : "Cancel"}
            </div>
            <motion.div 
              className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {step === 3 ? <><Sparkles className="h-3 w-3" /> Create Job</> : <>Next <ChevronRight className="h-3 w-3" /></>}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Client selector dropdown
const MockClientSelector = ({ visible = false, selectedClient = "" }: { visible?: boolean; selectedClient?: string }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-[180px] overflow-y-auto"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg mb-2">
            <Search className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Search clients...</span>
          </div>
          {["Sarah Johnson", "Chen Industries", "Emma Wilson", "Thompson Group"].map((client, i) => (
            <motion.div 
              key={client}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] cursor-pointer ${
                selectedClient === client ? "bg-primary/10 text-primary" : "hover:bg-accent"
              }`}
              animate={selectedClient === client ? { x: [0, 3, 0] } : {}}
            >
              <MockJobAvatar name={client} size="sm" />
              <span>{client}</span>
              {selectedClient === client && <Check className="h-3 w-3 ml-auto" />}
            </motion.div>
          ))}
        </div>
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

// ===== WORKSHEET & MEASUREMENT COMPONENTS =====

const MockWorksheetPanel = ({
  visible = false,
  activeField = "",
  widthValue = "",
  dropValue = "",
}: {
  visible?: boolean;
  activeField?: string;
  widthValue?: string;
  dropValue?: string;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 bg-card z-10 rounded-xl overflow-hidden"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold">Window 1 Worksheet</h3>
                <p className="text-[10px] text-muted-foreground">Living Room • Roller Blind</p>
              </div>
            </div>
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Measurement diagram */}
        <div className="p-3">
          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-28 border-2 border-dashed border-primary/50 rounded-lg">
                {/* Width arrow */}
                <div className="absolute -top-3 left-0 right-0 flex items-center justify-center">
                  <ArrowUpDown className="h-3 w-3 text-primary rotate-90" />
                  <span className="text-[9px] font-medium text-primary ml-1">W</span>
                </div>
                {/* Drop arrow */}
                <div className="absolute -right-4 top-0 bottom-0 flex flex-col items-center justify-center">
                  <ArrowUpDown className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-medium text-primary mt-1">D</span>
                </div>
                {/* Window icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Square className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Measurement inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Width (mm)</label>
              <motion.div 
                className={`h-9 rounded-lg border px-3 flex items-center text-xs ${
                  activeField === "width" ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
                animate={activeField === "width" ? { scale: 1.02 } : {}}
              >
                {widthValue || "1500"}
                {activeField === "width" && (
                  <motion.span 
                    className="w-0.5 h-4 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">mm</span>
              </motion.div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Drop (mm)</label>
              <motion.div 
                className={`h-9 rounded-lg border px-3 flex items-center text-xs ${
                  activeField === "drop" ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
                animate={activeField === "drop" ? { scale: 1.02 } : {}}
              >
                {dropValue || "2100"}
                {activeField === "drop" && (
                  <motion.span 
                    className="w-0.5 h-4 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">mm</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ChevronLeft wasn't imported, adding it inline
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

// Treatment selector grid - MATCHING REAL TreatmentTypeGrid.tsx with categories
const MockTreatmentGrid = ({ 
  visible = false,
  highlightedTreatment = "",
}: {
  visible?: boolean;
  highlightedTreatment?: string;
}) => {
  // Group treatments by category like real component
  const grouped = treatmentTypes.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof treatmentTypes>);

  return (
    <div className={`space-y-3 ${visible ? "" : "opacity-50"}`}>
      {/* Search input - matching real ImprovedTreatmentSelector */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="h-10 rounded-lg border border-border bg-background pl-9 pr-3 flex items-center text-xs text-muted-foreground">
          Search treatments: roller blinds, curtains...
        </div>
      </div>
      
      {/* Categorized treatment cards - matching real layout */}
      {Object.entries(grouped).map(([category, treatments]) => (
        <div key={category} className="space-y-2">
          {/* Category header - matching real uppercase tracking */}
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {treatments.map((treatment) => (
              <motion.div 
                key={treatment.name}
                className={`rounded-lg border cursor-pointer transition-all overflow-hidden ${
                  highlightedTreatment === treatment.name 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/30"
                }`}
                animate={highlightedTreatment === treatment.name ? { scale: 1.02 } : {}}
              >
                {/* Image preview placeholder - matching real TreatmentCard */}
                <div className="aspect-square w-full flex items-center justify-center bg-muted border-b border-border">
                  <div className={`w-12 h-12 rounded-lg ${treatment.color} flex items-center justify-center`}>
                    <treatment.icon className="h-6 w-6" />
                  </div>
                </div>
                {/* Name with selection indicator */}
                <div className="p-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-semibold truncate">{treatment.name}</span>
                    {highlightedTreatment === treatment.name && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Fabric/Inventory selector - MATCHING REAL InventorySelectionPanel.tsx
// Limited to 2 rows max for demo container constraint
const MockFabricGrid = ({
  highlightedFabric = 0,
  showTabs = true,
  compact = true,
}: {
  highlightedFabric?: number;
  showTabs?: boolean;
  compact?: boolean;
}) => {
  const fabrics = [
    { name: "ADARA", color: "bg-amber-200", price: "£26.50/m", width: "2900mm", inStock: true },
    { name: "BELMONT", color: "bg-gray-300", price: "£32.00/m", width: "1400mm", inStock: true },
    { name: "CAIRO", color: "bg-blue-200", price: "£45.00/m", width: "3000mm", inStock: false },
    { name: "DEVON", color: "bg-green-200", price: "£28.50/m", width: "1450mm", inStock: true },
  ];

  const grades = ["All", "1", "2", "3", "Budget"];

  return (
    <div className="space-y-2 max-h-[200px] overflow-hidden">
      {/* Grade tabs */}
      {showTabs && (
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {grades.map((grade, i) => (
            <div
              key={grade}
              className={`px-2 py-0.5 rounded text-[8px] font-medium whitespace-nowrap ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {grade === "All" ? "All" : grade}
            </div>
          ))}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-border text-[9px]">
          <ScanLine className="h-3 w-3" /> QR
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-border text-[9px]">
          <FileType className="h-3 w-3" /> Manual
        </div>
      </div>
      
      {/* Fabric cards - 2x2 grid limited */}
      <div className="grid grid-cols-2 gap-1.5">
        {fabrics.slice(0, 4).map((fabric, i) => (
          <motion.div 
            key={fabric.name}
            className={`rounded-lg border overflow-hidden ${
              highlightedFabric === i 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border"
            }`}
            animate={highlightedFabric === i ? { scale: 1.02 } : {}}
          >
            <div className={`h-10 ${fabric.color} relative`}>
              {!fabric.inStock && (
                <div className="absolute top-0.5 right-0.5 px-1 bg-red-500 text-white text-[7px] rounded">Out</div>
              )}
              {highlightedFabric === i && (
                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-2 w-2 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="p-1.5">
              <p className="text-[9px] font-semibold truncate">{fabric.name}</p>
              <p className="text-[8px] text-muted-foreground">{fabric.width}</p>
              <p className="text-[9px] font-medium text-primary">{fabric.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== QUOTE & INVOICE COMPONENTS =====

const MockQuotePreview = ({
  showDiscount = false,
  discountAmount = "",
  showPayment = false,
}: {
  showDiscount?: boolean;
  discountAmount?: string;
  showPayment?: boolean;
}) => (
  <div className="space-y-2">
    {/* Line items */}
    <div className="p-2.5 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium">Living Room</span>
        <span className="text-[10px] font-medium">$2,450</span>
      </div>
      <div className="text-[9px] text-muted-foreground">
        3 windows • Sheer Curtains, Roller Blinds
      </div>
    </div>
    <div className="p-2.5 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium">Master Bedroom</span>
        <span className="text-[10px] font-medium">$1,800</span>
      </div>
      <div className="text-[9px] text-muted-foreground">
        2 windows • Blockout Curtains
      </div>
    </div>
    
    {/* Totals */}
    <div className="pt-2 border-t border-border space-y-1">
      <div className="flex justify-between text-[10px]">
        <span>Subtotal</span>
        <span>$4,250</span>
      </div>
      
      <AnimatePresence>
        {showDiscount && (
          <motion.div 
            className="flex justify-between text-[10px] text-green-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <span>Discount ({discountAmount || "10%"})</span>
            <span>-$425</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-between text-[10px]">
        <span>Tax (10%)</span>
        <span>{showDiscount ? "$383" : "$425"}</span>
      </div>
      
      <div className="flex justify-between text-sm font-semibold pt-1">
        <span>Total</span>
        <span className="text-primary">{showDiscount ? "$4,208" : "$4,675"}</span>
      </div>
      
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            className="mt-2 p-2 bg-blue-50 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="flex justify-between text-[10px] text-blue-700">
              <span>Deposit Required (50%)</span>
              <span className="font-medium">$2,104</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

// Email dialog
const MockEmailDialog = ({
  visible = false,
  typing = "",
}: {
  visible?: boolean;
  typing?: string;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex items-center justify-center p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card border border-border rounded-xl shadow-xl p-3 w-full max-w-[280px]"
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Send Quote</h3>
            </div>
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
              <div className="h-8 bg-muted rounded-lg px-2 flex items-center text-[10px]">
                sarah.johnson@email.com
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Subject</label>
              <div className="h-8 bg-background border border-border rounded-lg px-2 flex items-center text-[10px]">
                Quote for Living Room Renovation
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Message</label>
              <div className="h-16 bg-background border border-primary rounded-lg p-2 text-[10px]">
                {typing}
                <motion.span 
                  className="inline-block w-0.5 h-3 bg-primary ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" />
              Quote.pdf attached
            </div>
            <motion.div 
              className="ml-auto px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Send className="h-3 w-3" />
              Send
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Work order preview
const MockWorkOrderPreview = ({
  showFilters = false,
  activeFilter = "",
}: {
  showFilters?: boolean;
  activeFilter?: string;
}) => (
  <div className="space-y-2">
    {showFilters && (
      <div className="flex gap-1 mb-2">
        {["All", "Curtains", "Blinds"].map((filter) => (
          <motion.div 
            key={filter}
            className={`px-2 py-1 rounded-lg text-[10px] cursor-pointer ${
              activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
            animate={activeFilter === filter ? { scale: 1.05 } : {}}
          >
            {filter}
          </motion.div>
        ))}
      </div>
    )}
    
    <div className="p-2.5 bg-muted/30 rounded-lg border-l-3 border-l-blue-500">
      <div className="flex items-center gap-2 mb-1">
        <Scissors className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[10px] font-medium">Sheer Curtains - Living Room</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-muted-foreground">
        <span>Width: 3000mm</span>
        <span>Drop: 2400mm</span>
        <span>Fabric: Ivory Linen</span>
        <span>Qty: 2 panels</span>
      </div>
    </div>
    
    <div className="p-2.5 bg-muted/30 rounded-lg border-l-3 border-l-purple-500">
      <div className="flex items-center gap-2 mb-1">
        <Blinds className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-[10px] font-medium">Roller Blind - Living Room</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-muted-foreground">
        <span>Width: 1500mm</span>
        <span>Drop: 2100mm</span>
        <span>Fabric: Charcoal</span>
        <span>Motor: Yes</span>
      </div>
    </div>
  </div>
);

// Share link panel
const MockShareLinkPanel = ({
  visible = false,
  linkCreated = false,
}: {
  visible?: boolean;
  linkCreated?: boolean;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        className="p-3 bg-muted/30 rounded-lg border border-border"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Share Work Order</span>
        </div>
        
        {!linkCreated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-8 bg-background border border-border rounded-lg px-2 flex items-center text-[10px] text-muted-foreground">
                Enter recipient email...
              </div>
            </div>
            <motion.div 
              className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium text-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Create Share Link
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="p-2 bg-green-50 border border-green-200 rounded-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[10px] font-medium text-green-700">Link Created!</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-7 bg-white border border-green-200 rounded px-2 flex items-center text-[9px] text-muted-foreground truncate">
                https://app.example.com/share/wo-abc123
              </div>
              <div className="px-2 py-1 bg-green-600 text-white rounded text-[9px]">Copy</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// Installation checklist
const MockInstallationChecklist = ({
  checkedItems = 0,
}: {
  checkedItems?: number;
}) => {
  const items = [
    "Materials delivered",
    "Site access confirmed",
    "Customer notified",
    "Tools prepared",
    "Installation complete",
  ];

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <motion.div 
          key={item}
          className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
          animate={i === checkedItems ? { scale: [1, 1.02, 1] } : {}}
        >
          <motion.div 
            className={`h-4 w-4 rounded border flex items-center justify-center ${
              i < checkedItems ? "bg-green-500 border-green-500" : "border-border"
            }`}
            animate={i < checkedItems ? { scale: [1, 1.2, 1] } : {}}
          >
            {i < checkedItems && <Check className="h-3 w-3 text-white" />}
          </motion.div>
          <span className={`text-[10px] ${i < checkedItems ? "line-through text-muted-foreground" : ""}`}>
            {item}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

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
    <div className="flex items-center gap-1 flex-wrap justify-center">
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

// ===========================================
// STEP COMPONENTS (35+ Steps)
// ===========================================

// ===== PART 1: DASHBOARD & NAVIGATION (Steps 1-3) =====

// Step 1: Jobs Overview
export const JobsStep1 = ({ phase = 0 }: StepProps) => {
  const visibleCards = Math.min(4, Math.floor(phase * 8) + 1);
  
  return (
    <MockCard className="overflow-hidden rounded-xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <MockJobsHeader />
      </motion.div>
      
      <div className="p-2 space-y-2">
        {sampleJobs.map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < visibleCards ? 1 : 0, x: i < visibleCards ? 0 : -10 }}
            transition={{ duration: 0.15, delay: i * 0.05 }}
          >
            <MockJobCard job={job} showActions />
          </motion.div>
        ))}
      </div>
    </MockCard>
  );
};

// Step 2: Search & Filter
export const JobsStep2 = ({ phase = 0 }: StepProps) => {
  const searchActive = phase > 0.12;
  const searchText = typingProgress(phase, 0.18, 0.45, "Living");
  const filterActive = phase > 0.65;
  const filteredJobs = phase > 0.4 ? sampleJobs.filter(j => j.project.toLowerCase().includes("living")) : sampleJobs;

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <MockJobsHeader searchValue={searchText} searchActive={searchActive} filterActive={filterActive} />
      
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
              <MockJobCard job={job} highlighted={phase > 0.5 && job.project.includes("Living")} showActions />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </MockCard>
  );
};

// Step 3: Quick Actions
export const JobsStep3 = ({ phase = 0 }: StepProps) => {
  const actions = ["view", "edit", "notes", "duplicate", "archive"];
  const actionIndex = Math.floor(phase * 5);
  const highlightAction = actions[Math.min(actionIndex, actions.length - 1)];

  return (
    <div className="relative">
      <MockCard className="p-3 rounded-xl">
        <div className="flex items-center gap-3 relative">
          <MockJobAvatar name="Sarah Johnson" size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">JOB-2024-001</span>
              <span className="text-sm font-semibold">Sarah J.</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Living Room • $4,250</p>
          </div>
          <motion.div className="p-1.5 rounded-lg bg-primary/10" animate={{ scale: 1.1 }}>
            <MoreHorizontal className="h-4 w-4 text-primary" />
          </motion.div>
          <MockActionsMenu visible highlightAction={highlightAction} />
        </div>
      </MockCard>
      
      <motion.p 
        className="text-[10px] text-muted-foreground text-center mt-3"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Quick actions for every job
      </motion.p>
    </div>
  );
};

// ===== PART 2: JOB CREATION (Steps 4-7) =====

// Step 4: Click New Job Button
export const JobsStep4 = ({ phase = 0 }: StepProps) => {
  const buttonHighlight = phase > 0.2;
  const showDialog = phase > 0.5;

  return (
    <div className="relative">
      <MockCard className="overflow-hidden rounded-xl">
        <MockJobsHeader newButtonHighlight={buttonHighlight && !showDialog} />
        <div className="p-2 space-y-2">
          {sampleJobs.slice(0, 2).map((job, i) => (
            <MockJobCard key={i} job={job} showActions />
          ))}
        </div>
      </MockCard>
      
      <MockJobCreateDialog visible={showDialog} step={1} />
    </div>
  );
};

// Step 5: Select Client
export const JobsStep5 = ({ phase = 0 }: StepProps) => {
  const showDropdown = phase > 0.2 && phase < 0.8;
  const selectedClient = phase > 0.5 ? "Sarah Johnson" : "";
  const showConfirm = phase > 0.75;

  return (
    <div className="relative">
      <MockCard className="p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Select Client</h3>
          <span className="text-[10px] text-muted-foreground">Step 1 of 3</span>
        </div>
        
        <div className="relative">
          <label className="text-[10px] text-muted-foreground mb-1 block">Client *</label>
          <motion.div 
            className={`h-9 rounded-lg border px-3 flex items-center justify-between text-xs ${
              showDropdown ? "border-primary" : "border-border"
            }`}
            animate={showDropdown ? { scale: 1.02 } : {}}
          >
            {selectedClient ? (
              <div className="flex items-center gap-2">
                <MockJobAvatar name={selectedClient} size="sm" />
                <span>{selectedClient}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Choose a client...</span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
          <MockClientSelector visible={showDropdown} selectedClient={selectedClient} />
        </div>
        
        {showConfirm && (
          <motion.div 
            className="mt-4 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-1">
              Next <ChevronRight className="h-3 w-3" />
            </div>
          </motion.div>
        )}
      </MockCard>
    </div>
  );
};

// Step 6: Project Details
export const JobsStep6 = ({ phase = 0 }: StepProps) => {
  const projectName = typingProgress(phase, 0.1, 0.5, "Kitchen Renovation");

  return (
    <MockCard className="p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Project Details</h3>
        <span className="text-[10px] text-muted-foreground">Step 2 of 3</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Project Name *</label>
          <motion.div 
            className="h-9 rounded-lg border border-primary bg-primary/5 px-3 flex items-center text-xs"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {projectName}
            <motion.span 
              className="w-0.5 h-4 bg-primary ml-0.5"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        </div>
        
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
          <div className="h-16 rounded-lg border border-border bg-background px-3 py-2 text-[10px] text-muted-foreground">
            Optional project notes...
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <div className="px-3 py-1.5 text-[10px] border border-border rounded-lg">Back</div>
          <motion.div 
            className="flex-1 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg font-medium text-center flex items-center justify-center gap-1"
            animate={phase > 0.6 ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Next <ChevronRight className="h-3 w-3" />
          </motion.div>
        </div>
      </div>
    </MockCard>
  );
};

// Step 7: Job Created Success
export const JobsStep7 = ({ phase = 0 }: StepProps) => {
  const showSuccess = phase > 0.3;

  return (
    <div className="relative h-[280px]">
      {!showSuccess && (
        <MockCard className="overflow-hidden rounded-xl">
          <MockJobsHeader />
          <div className="p-2 space-y-2">
            {sampleJobs.slice(0, 3).map((job, i) => (
              <MockJobCard key={i} job={job} showActions />
            ))}
          </div>
        </MockCard>
      )}
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="absolute inset-0 bg-card rounded-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <motion.div 
                className="w-14 h-14 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <CheckCircle className="h-7 w-7 text-green-600" />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">Job Created!</h3>
              <p className="text-[10px] text-muted-foreground">Kitchen Renovation</p>
              <p className="text-[10px] text-muted-foreground">for Sarah Johnson</p>
              
              <motion.div 
                className="mt-4 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium inline-flex items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Plus className="h-3 w-3" />
                Add Rooms
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== PART 3: ROOM MANAGEMENT (Steps 8-11) =====

// Step 8: Job Detail View
export const JobsStep8 = ({ phase = 0 }: StepProps) => {
  const tabs = ["Rooms", "Quote", "Work Order", "Workroom"];
  const activeTab = tabs[Math.floor(phase * 3.9) % 4];

  return (
    <MockCard className="overflow-hidden rounded-xl">
      {/* Job header */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-3">
          <MockJobAvatar name="Sarah Johnson" size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">JOB-2024-001</span>
            </div>
            <h3 className="text-sm font-semibold">Living Room Renovation</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <MockStatusBadge status="approved" size="xs" />
              <span className="text-[10px] text-primary font-medium">$4,250</span>
            </div>
          </div>
          <X className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-3 pt-2">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => (
            <motion.div 
              key={tab}
              className={`flex-1 py-1.5 text-center rounded-md text-[10px] font-medium cursor-pointer ${
                activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
              animate={activeTab === tab ? { scale: 1.02 } : { scale: 1 }}
            >
              {tab}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Tab content placeholder */}
      <div className="p-3">
        <div className="h-24 bg-muted/30 rounded-lg flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground">{activeTab} content</span>
        </div>
      </div>
    </MockCard>
  );
};

// Step 9: Add Rooms
export const JobsStep9 = ({ phase = 0 }: StepProps) => {
  const showAddButton = phase < 0.4;
  const showRoomForm = phase >= 0.4 && phase < 0.8;
  const showNewRoom = phase >= 0.8;

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rooms</h3>
        {showAddButton && (
          <motion.div 
            className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Plus className="h-3 w-3" />
            Add Room
          </motion.div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        {showRoomForm && (
          <motion.div 
            className="p-3 border-2 border-dashed border-primary rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label className="text-[10px] text-muted-foreground mb-1 block">Room Name</label>
            <div className="h-8 rounded-lg border border-primary bg-primary/5 px-2 flex items-center text-xs">
              Living Room
              <motion.span 
                className="w-0.5 h-4 bg-primary ml-0.5"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
        
        {showNewRoom && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <MockRoomCard room={sampleRooms[0]} highlighted />
          </motion.div>
        )}
        
        {!showRoomForm && !showNewRoom && (
          <div className="py-6 text-center">
            <Home className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-[10px] text-muted-foreground">No rooms yet. Add your first room!</p>
          </div>
        )}
      </div>
    </MockCard>
  );
};

// Step 10: Room Templates - MATCHING REAL RoomTemplates.tsx exactly
export const JobsStep10 = ({ phase = 0 }: StepProps) => {
  // Templates matching real ROOM_TEMPLATES data
  const templates = [
    { 
      name: "Standard Living Room", 
      icon: Home, 
      description: "Main window with side panels",
      surfaces: ["Main Window 120\"×60\"", "Side Window 60\"×60\""],
      estimatedValue: "$1,200",
      popular: true
    },
    { 
      name: "Master Bedroom", 
      icon: Bed, 
      description: "Large window with blackout",
      surfaces: ["Main Window 100\"×55\"", "Side Window 50\"×55\""],
      estimatedValue: "$900",
      popular: true
    },
    { 
      name: "Modern Kitchen", 
      icon: ChefHat, 
      description: "Water-resistant treatments",
      surfaces: ["Above Sink 60\"×40\""],
      estimatedValue: "$600",
      popular: false
    },
    { 
      name: "Home Office", 
      icon: Briefcase, 
      description: "Light control for work",
      surfaces: ["Main Window 80\"×55\""],
      estimatedValue: "$750",
      popular: false
    },
  ];
  const highlightIndex = Math.floor(phase * 3.9);

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="text-center mb-3">
        <h3 className="text-sm font-semibold">Room Templates</h3>
        <p className="text-[10px] text-muted-foreground">Pre-configured room layouts</p>
      </div>
      
      {/* Template cards matching real RoomTemplates.tsx Card layout */}
      <div className="space-y-2">
        {templates.slice(0, 3).map((template, i) => (
          <motion.div 
            key={template.name}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              i === highlightIndex ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:shadow-sm"
            }`}
            animate={i === highlightIndex ? { scale: 1.01 } : {}}
          >
            {/* Header matching real CardHeader */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <template.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold">{template.name}</span>
                  {template.popular && (
                    <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mt-0.5">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      Popular
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-[10px] text-muted-foreground mb-2">{template.description}</p>
            
            {/* Includes list - matching real template.surfaces */}
            <div className="mb-2">
              <span className="text-[9px] font-medium">Includes:</span>
              <ul className="text-[9px] text-muted-foreground mt-0.5 space-y-0.5">
                {template.surfaces.map((surface, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>• {surface.split(' ')[0]} {surface.split(' ')[1]}</span>
                    <span className="text-[8px]">{surface.split(' ').slice(2).join(' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Footer matching real - Est. Value + Use Template button */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-[9px] text-muted-foreground">Est. Value: </span>
                <span className="text-[10px] font-medium">{template.estimatedValue}</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium ${
                i === highlightIndex 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                <Copy className="h-3 w-3" />
                Use Template
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </MockCard>
  );
};

// Step 11: Copy & Paste Rooms
export const JobsStep11 = ({ phase = 0 }: StepProps) => {
  const showCopyMenu = phase > 0.2 && phase < 0.5;
  const showPasteButton = phase >= 0.5 && phase < 0.8;
  const showPasted = phase >= 0.8;

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rooms</h3>
        {showPasteButton && (
          <motion.div 
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-medium flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Copy className="h-3 w-3" />
            Paste Room
          </motion.div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div className="relative">
          <MockRoomCard room={sampleRooms[0]} highlighted={showCopyMenu} />
          
          {showCopyMenu && (
            <motion.div 
              className="absolute right-2 top-2 bg-popover border border-border rounded-lg shadow-lg py-1 z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div 
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] bg-primary/10 text-primary"
                animate={{ x: [0, 3, 0] }}
              >
                <Copy className="h-3 w-3" />
                Copy Room
              </motion.div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-accent">
                <Edit2 className="h-3 w-3" />
                Edit
              </div>
            </motion.div>
          )}
        </div>
        
        {showPasted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MockRoomCard 
              room={{ ...sampleRooms[0], name: "Living Room (Copy)" }} 
              highlighted 
            />
          </motion.div>
        )}
      </div>
    </MockCard>
  );
};

// ===== PART 4: WINDOWS & SURFACES (Steps 12-14) =====

// Step 12: Add Window
export const JobsStep12 = ({ phase = 0 }: StepProps) => {
  const showAddButton = phase < 0.3;
  const showWindowForm = phase >= 0.3 && phase < 0.7;
  const showNewWindow = phase >= 0.7;

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Living Room</span>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Windows</span>
          {showAddButton && (
            <motion.div 
              className="px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium flex items-center gap-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Plus className="h-3 w-3" />
              Add
            </motion.div>
          )}
        </div>
        
        {showWindowForm && (
          <motion.div 
            className="p-3 border-2 border-dashed border-primary rounded-lg space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-muted-foreground">Width (mm)</label>
                <div className="h-7 border border-primary rounded px-2 flex items-center text-[10px]">
                  1500
                </div>
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground">Drop (mm)</label>
                <div className="h-7 border border-border rounded px-2 flex items-center text-[10px]">
                  2100
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {showNewWindow && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <MockWindowCard windowNum={1} highlighted />
          </motion.div>
        )}
        
        <MockWindowCard windowNum={2} dimensions="1800 x 2400" treatment="Curtains" />
      </div>
    </MockCard>
  );
};

// Step 13: Window Types - MATCHING REAL WindowTypeSelector.tsx with visual previews
export const JobsStep13 = ({ phase = 0 }: StepProps) => {
  const highlightIndex = Math.floor(phase * 1.9);

  return (
    <MockCard className="p-3 rounded-xl">
      {/* Search input matching real WindowTypeSelector */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="h-10 rounded-lg border border-border bg-background pl-9 pr-3 flex items-center text-xs text-muted-foreground">
          Search window types: standard, bay window...
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Standard Window - matching real visual */}
        <motion.div 
          className={`rounded-lg border cursor-pointer overflow-hidden ${
            highlightIndex === 0 ? "border-primary bg-primary/5 shadow-sm" : "border-border"
          }`}
          animate={highlightIndex === 0 ? { scale: 1.02 } : {}}
        >
          <div className="aspect-square w-full flex items-center justify-center bg-muted border-b border-border">
            {/* Standard 4-pane window visual */}
            <div className="w-16 h-16 border-2 border-gray-600 bg-gradient-to-br from-blue-50 to-blue-100 relative shadow-inner">
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 p-0.5">
                {[0,1,2,3].map(i => <div key={i} className="bg-blue-100/50 border border-gray-400" />)}
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 -translate-x-1/2" />
            </div>
          </div>
          <div className="p-2 text-center">
            <span className="text-[10px] font-semibold">Standard Window</span>
          </div>
        </motion.div>
        
        {/* Room Wall - matching real brick visual */}
        <motion.div 
          className={`rounded-lg border cursor-pointer overflow-hidden ${
            highlightIndex === 1 ? "border-primary bg-primary/5 shadow-sm" : "border-border"
          }`}
          animate={highlightIndex === 1 ? { scale: 1.02 } : {}}
        >
          <div className="aspect-square w-full flex items-center justify-center bg-muted border-b border-border">
            {/* Brick wall visual */}
            <div className="w-16 h-16 bg-gradient-to-br from-red-300 to-red-500 border-2 border-gray-700 relative overflow-hidden shadow-lg">
              {[0,1,2,3].map(row => (
                <div key={row} className="flex gap-px h-4" style={{ marginLeft: row % 2 ? '-4px' : '0' }}>
                  {[0,1,2,3].map(i => <div key={i} className="flex-1 border border-red-700/40 bg-red-400" />)}
                </div>
              ))}
            </div>
          </div>
          <div className="p-2 text-center">
            <span className="text-[10px] font-semibold">Room Wall</span>
          </div>
        </motion.div>
      </div>
    </MockCard>
  );
};

// Step 14: Surface Details
export const JobsStep14 = ({ phase = 0 }: StepProps) => {
  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-muted rounded">
          <Square className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Window 1</h3>
          <p className="text-[10px] text-muted-foreground">Living Room • Bay Window</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="p-2.5 bg-muted/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium">Dimensions</span>
            <span className="text-[10px]">1500 x 2100 mm</span>
          </div>
        </div>
        
        <motion.div 
          className="p-2.5 bg-primary/5 border border-primary/30 rounded-lg"
          animate={phase > 0.3 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium">Treatment</span>
            <motion.div 
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px]"
              animate={phase > 0.5 ? { scale: [1, 1.1, 1] } : {}}
            >
              Roller Blind
            </motion.div>
          </div>
        </motion.div>
        
        <div className="p-2.5 bg-muted/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium">Mount Type</span>
            <span className="text-[10px]">Inside mount</span>
          </div>
        </div>
      </div>
    </MockCard>
  );
};

// ===== PART 5: TREATMENT SELECTION (Steps 15-17) =====

// Step 15: Treatment Grid
export const JobsStep15 = ({ phase = 0 }: StepProps) => {
  const treatments = treatmentTypes.slice(0, 6);
  const highlightIndex = Math.floor(phase * 5.9);
  const highlightedName = treatments[highlightIndex]?.name || "";

  return (
    <MockCard className="p-3 rounded-xl">
      <h3 className="text-sm font-semibold mb-3">Select Treatment</h3>
      <MockTreatmentGrid visible highlightedTreatment={highlightedName} />
    </MockCard>
  );
};

// Step 16: Treatment Categories
export const JobsStep16 = ({ phase = 0 }: StepProps) => {
  const categories = ["Curtains", "Blinds", "Shutters"];
  const activeCategory = categories[Math.floor(phase * 2.9)];

  return (
    <MockCard className="p-3 rounded-xl">
      <h3 className="text-sm font-semibold mb-2">Treatment Categories</h3>
      
      {/* Category tabs */}
      <div className="flex gap-1 mb-3">
        {categories.map((cat) => (
          <motion.div 
            key={cat}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
            animate={activeCategory === cat ? { scale: 1.05 } : {}}
          >
            {cat}
          </motion.div>
        ))}
      </div>
      
      {/* Category content */}
      <div className="grid grid-cols-2 gap-2">
        {treatmentTypes
          .filter(t => 
            activeCategory === "Curtains" ? t.name.includes("Curtain") :
            activeCategory === "Blinds" ? t.name.includes("Blind") :
            t.name.includes("Shutter")
          )
          .slice(0, 4)
          .map((treatment, i) => (
            <motion.div 
              key={treatment.name}
              className="p-2.5 rounded-lg border border-border text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`mx-auto w-8 h-8 rounded-lg ${treatment.color} flex items-center justify-center mb-1`}>
                <treatment.icon className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-medium">{treatment.name}</span>
            </motion.div>
          ))}
      </div>
    </MockCard>
  );
};

// Step 17: Treatment Applied
export const JobsStep17 = ({ phase = 0 }: StepProps) => {
  const showBefore = phase < 0.4;
  const showAfter = phase >= 0.4;

  return (
    <MockCard className="p-3 rounded-xl">
      <h3 className="text-sm font-semibold mb-3">Window 1 - Living Room</h3>
      
      <motion.div 
        className={`p-3 rounded-lg border transition-all ${
          showAfter ? "bg-green-50 border-green-200" : "bg-muted/30 border-border"
        }`}
        animate={showAfter ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${showAfter ? "bg-green-100" : "bg-muted"}`}>
            <Square className={`h-5 w-5 ${showAfter ? "text-green-600" : "text-muted-foreground"}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Window 1</span>
              {showAfter && (
                <motion.span 
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Roller Blind
                </motion.span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">1500 x 2100mm</span>
          </div>
          
          {showAfter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {showAfter && (
        <motion.p 
          className="text-[10px] text-green-600 text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Treatment assigned successfully
        </motion.p>
      )}
    </MockCard>
  );
};

// ===== PART 6: MEASUREMENTS WORKSHEET (Steps 18-20) =====

// Step 18: Open Worksheet
export const JobsStep18 = ({ phase = 0 }: StepProps) => {
  const showWorksheet = phase > 0.4;

  return (
    <div className="relative h-[280px]">
      <MockCard className="overflow-hidden rounded-xl">
        <div className="px-3 py-2.5 border-b border-border">
          <span className="text-sm font-semibold">Living Room Windows</span>
        </div>
        <div className="p-3 space-y-2">
          <motion.div
            animate={!showWorksheet && phase > 0.2 ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MockWindowCard windowNum={1} highlighted={!showWorksheet && phase > 0.2} />
          </motion.div>
          <MockWindowCard windowNum={2} dimensions="1800 x 2400" treatment="Curtains" />
        </div>
      </MockCard>
      
      <MockWorksheetPanel visible={showWorksheet} />
    </div>
  );
};

// Step 19: Enter Measurements - MATCHING REAL VisualMeasurementSheet with treatment-specific options
export const JobsStep19 = ({ phase = 0 }: StepProps) => {
  const activeField = phase < 0.4 ? "width" : phase < 0.7 ? "drop" : "options";
  const widthValue = typingProgress(phase, 0.05, 0.35, "1650");
  const dropValue = typingProgress(phase, 0.4, 0.65, "2250");
  const showOptions = phase > 0.7;

  return (
    <MockCard className="p-2.5 rounded-xl max-h-[260px] overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Ruler className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold">Curtain Measurements</h3>
      </div>
      
      {/* Measurement inputs with green W/H badges - matching real app */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-[9px]">W</span>
            <label className="text-[9px] text-muted-foreground">Rail Width</label>
          </div>
          <motion.div 
            className={`h-7 rounded border px-2 flex items-center text-[10px] ${
              activeField === "width" ? "border-primary bg-primary/5" : "border-border"
            }`}
            animate={activeField === "width" ? { scale: 1.01 } : {}}
          >
            {widthValue || "0"}
            <span className="ml-auto text-[8px] text-muted-foreground bg-muted px-1 rounded">mm</span>
          </motion.div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-[9px]">H</span>
            <label className="text-[9px] text-muted-foreground">Drop</label>
          </div>
          <motion.div 
            className={`h-7 rounded border px-2 flex items-center text-[10px] ${
              activeField === "drop" ? "border-primary bg-primary/5" : "border-border"
            }`}
            animate={activeField === "drop" ? { scale: 1.01 } : {}}
          >
            {dropValue || "0"}
            <span className="ml-auto text-[8px] text-muted-foreground bg-muted px-1 rounded">mm</span>
          </motion.div>
        </div>
      </div>
      
      {/* Curtain-specific options - matching real VisualMeasurementSheet */}
      <div className="space-y-2">
        {/* Curtain Type - Pair/Single radio */}
        <div>
          <label className="text-[9px] font-medium mb-1 block">Curtain Type</label>
          <div className="grid grid-cols-2 gap-1">
            <motion.div 
              className={`p-1.5 rounded border text-center text-[9px] ${
                showOptions ? "border-primary bg-primary/5 font-medium" : "border-border"
              }`}
              animate={showOptions && activeField === "options" ? { scale: 1.02 } : {}}
            >
              <CircleDot className="h-3 w-3 mx-auto mb-0.5 text-primary" />
              Pair (Two panels)
            </motion.div>
            <div className="p-1.5 rounded border border-border text-center text-[9px] text-muted-foreground">
              <CircleDot className="h-3 w-3 mx-auto mb-0.5" />
              Single
            </div>
          </div>
        </div>
        
        {/* Heading Type dropdown */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-muted-foreground mb-0.5 block">Heading Type</label>
            <div className="h-6 rounded border border-border px-2 flex items-center justify-between text-[9px]">
              <span>Wave</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground mb-0.5 block">Pooling</label>
            <div className="h-6 rounded border border-border px-2 flex items-center justify-between text-[9px]">
              <span>Floor level</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </MockCard>
  );
};

// Step 20: Measurement Options - Blinds version for variety
export const JobsStep20 = ({ phase = 0 }: StepProps) => {
  const showMount = phase > 0.2;
  const showOperation = phase > 0.5;
  const showMotor = phase > 0.75;

  return (
    <MockCard className="p-2.5 rounded-xl max-h-[260px] overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Blinds className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold">Blind Options</h3>
      </div>
      
      {/* Mount Type - Inside/Outside */}
      <div className="mb-2">
        <label className="text-[9px] font-medium mb-1 block">Mount Type</label>
        <div className="grid grid-cols-2 gap-1">
          <motion.div 
            className={`p-1.5 rounded border text-center text-[9px] ${
              showMount ? "border-primary bg-primary/5 font-medium" : "border-border"
            }`}
            animate={showMount && !showOperation ? { scale: 1.02 } : {}}
          >
            Inside Recess
          </motion.div>
          <div className="p-1.5 rounded border border-border text-center text-[9px] text-muted-foreground">
            Face Fix
          </div>
        </div>
      </div>
      
      {/* Operation Side */}
      <div className="mb-2">
        <label className="text-[9px] text-muted-foreground mb-1 block">Operation Side</label>
        <motion.div 
          className={`h-7 rounded border px-2 flex items-center justify-between text-[9px] ${
            showOperation && !showMotor ? "border-primary bg-primary/5" : "border-border"
          }`}
          animate={showOperation && !showMotor ? { scale: 1.01 } : {}}
        >
          <span>Right</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </motion.div>
      </div>
      
      {/* Motor Type */}
      <div className="mb-2">
        <label className="text-[9px] text-muted-foreground mb-1 block">Motor Type</label>
        <motion.div 
          className={`h-7 rounded border px-2 flex items-center justify-between text-[9px] ${
            showMotor ? "border-primary bg-primary/5" : "border-border"
          }`}
          animate={showMotor ? { scale: 1.01 } : {}}
        >
          <span>Somfy RTS</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </motion.div>
      </div>
      
      {/* Summary */}
      {showMotor && (
        <motion.div 
          className="p-1.5 bg-green-50 border border-green-200 rounded text-[9px] text-green-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Motorized inside-mount roller blind configured
        </motion.div>
      )}
    </MockCard>
  );
};

// ===== PART 7: FABRIC & MATERIAL (Steps 21-23) =====

// Step 21: Fabric Selector
export const JobsStep21 = ({ phase = 0 }: StepProps) => {
  const highlightedFabric = Math.floor(phase * 3.9);

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Select Fabric</h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Search className="h-3 w-3" />
          Search
        </div>
      </div>
      
      <MockFabricGrid highlightedFabric={highlightedFabric} />
    </MockCard>
  );
};

// Step 22: Fabric Details
export const JobsStep22 = ({ phase = 0 }: StepProps) => {
  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 rounded-lg bg-amber-100" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Ivory Linen</h3>
          <p className="text-[10px] text-muted-foreground">Premium Belgian linen blend</p>
          <p className="text-sm font-semibold text-primary mt-1">$45/m</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Width", value: "280cm" },
          { label: "Pattern Repeat", value: "None" },
          { label: "Composition", value: "85% Linen, 15% Cotton" },
          { label: "Weight", value: "240 gsm" },
        ].map((item, i) => (
          <motion.div 
            key={item.label}
            className="p-2 bg-muted/30 rounded-lg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + phase * 0.5 }}
          >
            <p className="text-[9px] text-muted-foreground">{item.label}</p>
            <p className="text-[10px] font-medium">{item.value}</p>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
        animate={{ scale: phase > 0.7 ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-[10px] text-green-700 font-medium">In stock - Ships in 2-3 days</span>
      </motion.div>
    </MockCard>
  );
};

// Step 23: Hardware Options
export const JobsStep23 = ({ phase = 0 }: StepProps) => {
  const options = [
    { category: "Heading Type", options: ["Pencil Pleat", "Wave", "Eyelet"], selected: Math.floor(phase * 2.9) },
    { category: "Track/Rod", options: ["White Track", "Black Rod", "Brass Rod"], selected: phase > 0.5 ? 1 : 0 },
    { category: "Lining", options: ["None", "Standard", "Blackout"], selected: phase > 0.7 ? 2 : 1 },
  ];

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Hardware & Options</h3>
      </div>
      
      <div className="space-y-3">
        {options.map((group, gi) => (
          <div key={group.category}>
            <label className="text-[10px] text-muted-foreground mb-1 block">{group.category}</label>
            <div className="flex gap-1">
              {group.options.map((opt, oi) => (
                <motion.div 
                  key={opt}
                  className={`flex-1 py-1.5 text-center rounded-lg text-[9px] border cursor-pointer ${
                    group.selected === oi ? "border-primary bg-primary/10 font-medium" : "border-border"
                  }`}
                  animate={group.selected === oi ? { scale: 1.02 } : {}}
                >
                  {opt}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockCard>
  );
};

// ===== PART 8: QUOTATION (Steps 24-28) =====

// Step 24: Quote Tab
export const JobsStep24 = ({ phase = 0 }: StepProps) => {
  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Quote</span>
        </div>
        <MockStatusBadge status="draft" size="xs" />
      </div>
      
      <div className="p-3">
        <MockQuotePreview />
      </div>
    </MockCard>
  );
};

// Step 25: Add Discount
export const JobsStep25 = ({ phase = 0 }: StepProps) => {
  const showDiscountInput = phase > 0.2 && phase < 0.6;
  const discountApplied = phase >= 0.6;
  const discountValue = typingProgress(phase, 0.25, 0.5, "10");

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold">Quote</span>
        <motion.div 
          className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-medium"
          animate={!showDiscountInput && !discountApplied ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Percent className="h-3 w-3" />
          Add Discount
        </motion.div>
      </div>
      
      <div className="p-3">
        {showDiscountInput && (
          <motion.div 
            className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label className="text-[10px] text-green-700 mb-1 block">Discount %</label>
            <div className="h-8 bg-white border border-green-300 rounded px-2 flex items-center text-xs">
              {discountValue}
              <motion.span 
                className="w-0.5 h-4 bg-green-500 ml-0.5"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="ml-auto text-muted-foreground">%</span>
            </div>
          </motion.div>
        )}
        
        <MockQuotePreview showDiscount={discountApplied} discountAmount="10%" />
      </div>
    </MockCard>
  );
};

// Step 26: Payment Config
export const JobsStep26 = ({ phase = 0 }: StepProps) => {
  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Payment Settings</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Deposit Required</label>
          <div className="flex gap-1">
            {["0%", "25%", "50%", "100%"].map((pct, i) => (
              <motion.div 
                key={pct}
                className={`flex-1 py-1.5 text-center rounded-lg text-[10px] border ${
                  (phase > 0.3 && i === 2) ? "border-primary bg-primary/10 font-medium" : "border-border"
                }`}
                animate={(phase > 0.3 && i === 2) ? { scale: 1.05 } : {}}
              >
                {pct}
              </motion.div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Payment Terms</label>
          <motion.div 
            className="h-9 rounded-lg border border-border px-3 flex items-center justify-between text-xs"
            animate={phase > 0.6 ? { borderColor: "var(--primary)" } : {}}
          >
            <span>Net 30 days</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </div>
        
        {phase > 0.7 && (
          <motion.div 
            className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between text-[10px]">
              <span className="text-blue-700">Deposit Amount</span>
              <span className="text-blue-700 font-semibold">$2,104</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-blue-700">Balance Due</span>
              <span className="text-blue-700 font-semibold">$2,104</span>
            </div>
          </motion.div>
        )}
      </div>
    </MockCard>
  );
};

// Step 27: PDF & Email Actions
export const JobsStep27 = ({ phase = 0 }: StepProps) => {
  const actions = [
    { icon: Download, label: "Download PDF", color: "bg-blue-100 text-blue-700" },
    { icon: Printer, label: "Print Quote", color: "bg-purple-100 text-purple-700" },
    { icon: Mail, label: "Email Client", color: "bg-green-100 text-green-700" },
    { icon: Share2, label: "Share Link", color: "bg-orange-100 text-orange-700" },
  ];
  const highlightIndex = Math.floor(phase * 3.9);

  return (
    <MockCard className="p-3 rounded-xl">
      <h3 className="text-sm font-semibold mb-3">Quote Actions</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <motion.div 
            key={action.label}
            className={`p-3 rounded-lg border text-center cursor-pointer ${
              i === highlightIndex ? "border-primary ring-2 ring-primary/20" : "border-border"
            } ${action.color}`}
            animate={i === highlightIndex ? { scale: 1.05 } : {}}
          >
            <action.icon className="h-5 w-5 mx-auto mb-1" />
            <span className="text-[10px] font-medium">{action.label}</span>
          </motion.div>
        ))}
      </div>
      
      {/* Quick preview */}
      <div className="mt-3 p-2.5 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-[10px] font-medium">Quote_JOB-2024-001.pdf</p>
            <p className="text-[9px] text-muted-foreground">Generated • 245 KB</p>
          </div>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </MockCard>
  );
};

// Step 28: Send Quote Email
export const JobsStep28 = ({ phase = 0 }: StepProps) => {
  const showEmail = phase > 0.2;
  const emailTyping = typingProgress(phase, 0.3, 0.8, "Hi Sarah, please find attached the quote for your living room project...");

  return (
    <div className="relative h-[300px]">
      <MockCard className="overflow-hidden rounded-xl">
        <div className="px-3 py-2.5 border-b border-border">
          <span className="text-sm font-semibold">Quote Ready</span>
        </div>
        <div className="p-3">
          <MockQuotePreview showDiscount showPayment />
        </div>
      </MockCard>
      
      <MockEmailDialog visible={showEmail} typing={emailTyping} />
    </div>
  );
};

// ===== PART 9: PAYMENTS & EXPORT (Steps 29-31) =====

// Step 29: Record Payment
export const JobsStep29 = ({ phase = 0 }: StepProps) => {
  const showDialog = phase > 0.25;
  const amountTyped = typingProgress(phase, 0.35, 0.6, "2104");

  return (
    <div className="relative">
      <MockCard className="p-3 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Payments</h3>
          </div>
          <motion.div 
            className="px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium"
            animate={!showDialog ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Record Payment
          </motion.div>
        </div>
        
        <div className="p-2.5 bg-muted/30 rounded-lg">
          <div className="flex justify-between text-[10px] mb-1">
            <span>Total Due</span>
            <span className="font-semibold">$4,208</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Paid</span>
            <span className="text-green-600">$0</span>
          </div>
          <div className="flex justify-between text-[10px] pt-1 border-t border-border mt-1">
            <span className="font-medium">Balance</span>
            <span className="font-semibold text-primary">$4,208</span>
          </div>
        </div>
      </MockCard>
      
      {showDialog && (
        <motion.div 
          className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-card border border-border rounded-xl shadow-xl p-3 w-[90%]"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-sm font-semibold mb-3">Record Payment</h3>
            
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Amount</label>
                <div className="h-9 rounded-lg border border-primary bg-primary/5 px-3 flex items-center text-xs">
                  ${amountTyped}
                  <motion.span 
                    className="w-0.5 h-4 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Method</label>
                <div className="flex gap-1">
                  {["Card", "Bank", "Cash"].map((m, i) => (
                    <div key={m} className={`flex-1 py-1.5 text-center rounded text-[10px] ${i === 0 ? "bg-primary/10 border-primary" : ""} border`}>{m}</div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <div className="px-3 py-1.5 text-[10px] border border-border rounded">Cancel</div>
              <motion.div 
                className="flex-1 py-1.5 text-[10px] bg-primary text-primary-foreground rounded text-center font-medium"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Record Payment
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Step 30: Export Invoice
export const JobsStep30 = ({ phase = 0 }: StepProps) => {
  const showDropdown = phase > 0.2 && phase < 0.8;
  const exports = [
    { name: "Download CSV", icon: Download },
    { name: "Export to Xero", icon: ExternalLink },
    { name: "Export to QuickBooks", icon: ExternalLink },
    { name: "Export to MYOB", icon: ExternalLink },
  ];
  const highlightIndex = Math.floor((phase - 0.2) / 0.15);

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Invoice #INV-001</h3>
        </div>
        <div className="relative">
          <motion.div 
            className="px-2 py-1 bg-muted rounded text-[10px] font-medium flex items-center gap-1"
            animate={!showDropdown ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Export <ChevronDown className="h-3 w-3" />
          </motion.div>
          
          {showDropdown && (
            <motion.div 
              className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[150px] z-10"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {exports.map((exp, i) => (
                <motion.div 
                  key={exp.name}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] ${
                    i === highlightIndex ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                  animate={i === highlightIndex ? { x: [0, 3, 0] } : {}}
                >
                  <exp.icon className="h-3 w-3" />
                  {exp.name}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-[10px] font-medium text-green-700">Invoice Paid</p>
            <p className="text-[9px] text-green-600">$4,208 • 15 Jan 2024</p>
          </div>
        </div>
      </div>
    </MockCard>
  );
};

// Step 31: Payment Complete
export const JobsStep31 = ({ phase = 0 }: StepProps) => {
  const showCelebration = phase > 0.4;

  return (
    <div className="relative h-[280px]">
      <MockCard className="p-3 rounded-xl h-full">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="h-4 w-4 text-green-600" />
          <h3 className="text-sm font-semibold">Invoice #INV-001</h3>
          <motion.span 
            className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-medium"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            Paid
          </motion.span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] p-2 bg-muted/30 rounded">
            <span>Subtotal</span>
            <span>$3,825</span>
          </div>
          <div className="flex justify-between text-[10px] p-2 bg-muted/30 rounded">
            <span>Tax (10%)</span>
            <span>$383</span>
          </div>
          <div className="flex justify-between text-xs font-semibold p-2 bg-green-50 rounded">
            <span>Total Paid</span>
            <span className="text-green-600">$4,208</span>
          </div>
        </div>
      </MockCard>
      
      {showCelebration && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: "spring" }}
          >
            <span className="text-4xl">🎉</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// ===== PART 10: WORK ORDERS & SHARING (Steps 32-35) =====

// Step 32: Work Order Tab
export const JobsStep32 = ({ phase = 0 }: StepProps) => {
  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Work Order</span>
        </div>
        <div className="flex gap-1">
          <div className="px-2 py-1 bg-muted rounded text-[10px]">
            <Download className="h-3 w-3" />
          </div>
          <div className="px-2 py-1 bg-muted rounded text-[10px]">
            <Printer className="h-3 w-3" />
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <MockWorkOrderPreview />
      </div>
    </MockCard>
  );
};

// Step 33: Filter Work Order
export const JobsStep33 = ({ phase = 0 }: StepProps) => {
  const filters = ["All", "Curtains", "Blinds"];
  const activeFilter = filters[Math.floor(phase * 2.9)];

  return (
    <MockCard className="overflow-hidden rounded-xl">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-sm font-semibold">Work Order Filters</span>
      </div>
      
      <div className="p-3">
        <MockWorkOrderPreview showFilters activeFilter={activeFilter} />
      </div>
    </MockCard>
  );
};

// Step 34: Share Work Order
export const JobsStep34 = ({ phase = 0 }: StepProps) => {
  const showPanel = phase > 0.2;
  const linkCreated = phase > 0.6;

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Share with Workroom</h3>
        {!showPanel && (
          <motion.div 
            className="px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Share2 className="h-3 w-3" />
            Share
          </motion.div>
        )}
      </div>
      
      <MockShareLinkPanel visible={showPanel} linkCreated={linkCreated} />
      
      {linkCreated && (
        <motion.div 
          className="mt-3 p-2.5 bg-muted/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <QrCode className="h-4 w-4" />
            <span>QR code available for easy scanning</span>
          </div>
        </motion.div>
      )}
    </MockCard>
  );
};

// Step 35: Installation Tracking
export const JobsStep35 = ({ phase = 0 }: StepProps) => {
  const checkedItems = Math.floor(phase * 5);

  return (
    <MockCard className="p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Installation Checklist</h3>
      </div>
      
      <MockInstallationChecklist checkedItems={checkedItems} />
      
      {checkedItems >= 5 && (
        <motion.div 
          className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-[10px] text-green-700 font-medium">Installation Complete!</span>
        </motion.div>
      )}
    </MockCard>
  );
};

// ===== PART 11: JOB COMPLETION (Steps 36-37) =====

// Step 36: Status Flow
export const JobsStep36 = ({ phase = 0 }: StepProps) => {
  const currentStatus = Math.floor(phase * 5);

  return (
    <div className="flex flex-col items-center justify-center h-[260px] gap-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="text-sm font-semibold mb-1">Job Pipeline</h3>
        <p className="text-[10px] text-muted-foreground">Progress through each stage</p>
      </motion.div>
      
      <MockStatusFlow currentStatus={currentStatus} animating />
      
      <motion.p 
        className="text-[10px] text-muted-foreground text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Automatic notifications at each stage
      </motion.p>
    </div>
  );
};

// Step 37: Job Complete Celebration
export const JobsStep37 = ({ phase = 0 }: StepProps) => {
  const showCelebration = phase > 0.3;

  return (
    <div className="relative h-[280px]">
      <MockCard className="overflow-hidden rounded-xl h-full">
        <MockJobsHeader />
        <div className="p-2 space-y-2">
          <MockJobCard 
            job={{ ...sampleJobs[0], status: showCelebration ? "completed" : "in_production" }} 
            showActions 
          />
        </div>
      </MockCard>
      
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl"
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
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <h3 className="text-sm font-semibold mb-1">Job Completed! 🎉</h3>
              <p className="text-[10px] text-muted-foreground">Sarah Johnson - Living Room</p>
              <p className="text-sm font-semibold text-primary mt-2">$4,250 earned</p>
              
              <motion.div 
                className="mt-4 flex justify-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-2xl">🎊</span>
                <span className="text-2xl">🏆</span>
                <span className="text-2xl">⭐</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
