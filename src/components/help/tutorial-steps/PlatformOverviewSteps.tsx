import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderOpen, Search, Plus, Home, Bed, ChefHat, Layers, Blinds,
  DollarSign, Users, Mail, Calendar, Settings, Package, Palette,
  CheckCircle, Send, Receipt, Sparkles, FileText, Ruler, Activity,
  BarChart3, Clock, Bell, Shield, Zap, Globe, MessageSquare,
  Building2, CreditCard, Percent, Tag, Grid3X3, ChevronRight,
  Star, Phone, MapPin, FolderKanban, ArrowRight
} from "lucide-react";
import { inPhase, typingProgress, phaseProgress } from "@/lib/demoAnimations";

interface StepProps {
  phase?: number;
}

// ===========================================
// PLATFORM OVERVIEW TUTORIAL
// 12 Steps showing the complete InterioApp experience
// Reuses existing demo patterns for visual consistency
// ===========================================

// ===== SHARED MOCK COMPONENTS =====

const MockCard = ({ children, className = "", highlighted = false }: { 
  children: React.ReactNode; 
  className?: string; 
  highlighted?: boolean;
}) => (
  <motion.div 
    className={`bg-card rounded-lg border ${highlighted ? "border-primary ring-2 ring-primary/20" : "border-border"} ${className}`}
    animate={highlighted ? { scale: 1.02 } : {}}
  >
    {children}
  </motion.div>
);

const MockAvatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
  const colorIndex = name.length % colors.length;
  const sizeClass = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[9px]";
  
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

const MockStatusBadge = ({ status, color }: { status: string; color: string }) => (
  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${color}`}>
    {status}
  </span>
);

// ===== STEP 1: Dashboard Overview =====
export const OverviewStep1 = ({ phase = 0 }: StepProps) => {
  const showWelcome = inPhase(phase, 0, 0.3);
  const showStats = inPhase(phase, 0.2, 0.6);
  const showActivity = inPhase(phase, 0.5, 1);

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">InterioApp</span>
          <div className="flex gap-1.5">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-3 w-3 text-primary" />
            </div>
            <MockAvatar name="John Designer" size="sm" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-hidden">
        {/* Welcome Card */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Welcome back, John!</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                You have 3 quotes pending and 2 installations scheduled
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { label: "Active Jobs", value: "12", icon: FolderOpen, color: "text-blue-500" },
                { label: "This Month", value: "$24.5k", icon: DollarSign, color: "text-green-500" },
                { label: "Clients", value: "48", icon: Users, color: "text-purple-500" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-2 rounded-lg bg-card border border-border text-center"
                >
                  <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                  <div className="text-sm font-bold">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Activity */}
        <AnimatePresence>
          {showActivity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Recent Activity
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { text: "Quote sent to Sarah J.", time: "2m ago", color: "bg-blue-500" },
                  { text: "Job #P-1234 approved", time: "1h ago", color: "bg-green-500" },
                  { text: "New lead: Chen Industries", time: "3h ago", color: "bg-purple-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded bg-muted/50"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    <span className="text-[10px] flex-1">{item.text}</span>
                    <span className="text-[9px] text-muted-foreground">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ===== STEP 2: Jobs/Projects List =====
export const OverviewStep2 = ({ phase = 0 }: StepProps) => {
  const jobs = [
    { id: "P-1234", client: "Sarah J.", status: "Approved", statusColor: "bg-green-100 text-green-700", total: "$4,250" },
    { id: "P-1235", client: "Chen Ind.", status: "In Progress", statusColor: "bg-purple-100 text-purple-700", total: "$12,800" },
    { id: "P-1236", client: "Wilson H.", status: "Quote Sent", statusColor: "bg-blue-100 text-blue-700", total: "$1,950" },
  ];

  const highlightedIndex = Math.floor(phase * 3) % 3;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Projects</span>
            <span className="px-1.5 py-0.5 bg-secondary text-[10px] rounded">24</span>
          </div>
          <motion.button
            className="h-7 px-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1"
            animate={{ scale: inPhase(phase, 0.7, 1) ? 1.05 : 1 }}
          >
            <Plus className="h-3 w-3" /> New
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-input bg-background">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Search projects...</span>
        </div>
      </div>

      {/* Job Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: i === highlightedIndex ? 1.02 : 1,
            }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-lg border bg-card ${i === highlightedIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MockAvatar name={job.client} />
                <div>
                  <div className="text-xs font-semibold">{job.client}</div>
                  <div className="text-[10px] text-muted-foreground">{job.id}</div>
                </div>
              </div>
              <MockStatusBadge status={job.status} color={job.statusColor} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Total Quote</span>
              <span className="text-sm font-bold text-primary">{job.total}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 3: Room Management =====
export const OverviewStep3 = ({ phase = 0 }: StepProps) => {
  const rooms = [
    { name: "Living Room", icon: Home, windows: 3, total: "$2,450" },
    { name: "Master Bedroom", icon: Bed, windows: 2, total: "$1,800" },
    { name: "Kitchen", icon: ChefHat, windows: 2, total: "$980" },
  ];

  const expandedRoom = inPhase(phase, 0.3, 0.8) ? 0 : -1;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Home className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold">P-1234 · Sarah Johnson</div>
            <div className="text-[10px] text-muted-foreground">3 Rooms · 7 Windows</div>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {rooms.map((room, i) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-lg border overflow-hidden ${i === expandedRoom ? "border-primary" : "border-border"}`}
          >
            <div className={`p-3 flex items-center justify-between ${i === expandedRoom ? "bg-primary/5" : "bg-card"}`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${i === expandedRoom ? "bg-primary/20" : "bg-muted"}`}>
                  <room.icon className={`h-3.5 w-3.5 ${i === expandedRoom ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="text-xs font-semibold">{room.name}</div>
                  <div className="text-[10px] text-muted-foreground">{room.windows} windows</div>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">{room.total}</span>
            </div>
            
            <AnimatePresence>
              {i === expandedRoom && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-3 space-y-2 bg-muted/30">
                    {["Sheer Curtains - Bay Window", "Roller Blinds - Side Window"].map((treatment, ti) => (
                      <div key={ti} className="flex items-center gap-2 p-2 rounded bg-card border border-border">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] flex-1">{treatment}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 4: Treatment Selection =====
export const OverviewStep4 = ({ phase = 0 }: StepProps) => {
  const treatments = [
    { name: "Sheer Curtains", icon: Layers, color: "bg-pink-100 text-pink-600" },
    { name: "Blockout Curtains", icon: Layers, color: "bg-purple-100 text-purple-600" },
    { name: "Roller Blinds", icon: Blinds, color: "bg-blue-100 text-blue-600" },
    { name: "Roman Blinds", icon: Layers, color: "bg-orange-100 text-orange-600" },
    { name: "Venetian Blinds", icon: Grid3X3, color: "bg-cyan-100 text-cyan-600" },
    { name: "Shutters", icon: Grid3X3, color: "bg-green-100 text-green-600" },
  ];

  const selectedIndex = inPhase(phase, 0.4, 0.9) ? 2 : -1;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="text-xs font-semibold">Select Treatment Type</div>
        <div className="text-[10px] text-muted-foreground">Living Room · Bay Window</div>
      </div>

      {/* Treatment Grid */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="grid grid-cols-2 gap-2">
          {treatments.map((treatment, i) => (
            <motion.div
              key={treatment.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: i === selectedIndex ? 1.05 : 1,
              }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                i === selectedIndex 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-lg ${treatment.color} flex items-center justify-center mb-2`}>
                <treatment.icon className="h-5 w-5" />
              </div>
              <div className="text-[10px] font-medium">{treatment.name}</div>
              {i === selectedIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1"
                >
                  <CheckCircle className="h-4 w-4 text-primary mx-auto" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-3 border-t border-border bg-card">
        <motion.button
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
          animate={{ scale: inPhase(phase, 0.8, 1) ? 1.02 : 1 }}
        >
          Continue <ArrowRight className="h-3 w-3 inline ml-1" />
        </motion.button>
      </div>
    </div>
  );
};

// ===== STEP 5: Measurements =====
export const OverviewStep5 = ({ phase = 0 }: StepProps) => {
  const width = Math.round(phaseProgress(phase, 0.2, 0.5) * 180);
  const height = Math.round(phaseProgress(phase, 0.4, 0.7) * 240);

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" />
          <div>
            <div className="text-xs font-semibold">Measurements</div>
            <div className="text-[10px] text-muted-foreground">Living Room · Bay Window</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-3">
        {/* Visual Window Diagram */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-40 border-4 border-primary/30 rounded-sm bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-800/10">
              {/* Width indicator */}
              <motion.div 
                className="absolute -top-6 left-0 right-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: width > 0 ? 1 : 0.3 }}
              >
                <div className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-white/30 text-[8px] flex items-center justify-center">W</span>
                  {width > 0 ? `${width} cm` : "---"}
                </div>
              </motion.div>
              
              {/* Height indicator */}
              <motion.div 
                className="absolute -right-14 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: height > 0 ? 1 : 0.3 }}
              >
                <div className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-white/30 text-[8px] flex items-center justify-center">H</span>
                  {height > 0 ? `${height} cm` : "---"}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Width (cm)</label>
            <motion.div 
              className="h-9 rounded-lg border border-input bg-background px-3 flex items-center text-sm font-medium"
              animate={{ borderColor: inPhase(phase, 0.2, 0.5) ? "hsl(var(--primary))" : "hsl(var(--input))" }}
            >
              {width || ""}
              {inPhase(phase, 0.2, 0.5) && <span className="w-0.5 h-4 bg-primary animate-pulse ml-0.5" />}
            </motion.div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Height (cm)</label>
            <motion.div 
              className="h-9 rounded-lg border border-input bg-background px-3 flex items-center text-sm font-medium"
              animate={{ borderColor: inPhase(phase, 0.4, 0.7) ? "hsl(var(--primary))" : "hsl(var(--input))" }}
            >
              {height || ""}
              {inPhase(phase, 0.4, 0.7) && <span className="w-0.5 h-4 bg-primary animate-pulse ml-0.5" />}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-3 border-t border-border bg-card">
        <motion.button
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-2"
          animate={{ scale: inPhase(phase, 0.8, 1) ? 1.02 : 1 }}
        >
          <CheckCircle className="h-3.5 w-3.5" /> Save Measurements
        </motion.button>
      </div>
    </div>
  );
};

// ===== STEP 6: Quote Generation =====
export const OverviewStep6 = ({ phase = 0 }: StepProps) => {
  const showLineItems = inPhase(phase, 0.2, 0.6);
  const showTotal = inPhase(phase, 0.5, 1);

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <div className="text-xs font-semibold">Quote #Q-1234</div>
          </div>
          <MockStatusBadge status="Draft" color="bg-gray-100 text-gray-700" />
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-auto">
        {/* Client Info */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <MockAvatar name="Sarah Johnson" />
          <div>
            <div className="text-xs font-medium">Sarah Johnson</div>
            <div className="text-[10px] text-muted-foreground">Living Room Renovation</div>
          </div>
        </div>

        {/* Line Items */}
        <AnimatePresence>
          {showLineItems && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="text-[10px] font-medium text-muted-foreground uppercase">Line Items</div>
              {[
                { name: "Sheer Curtains - Bay Window", qty: "3 panels", price: "$1,450" },
                { name: "Roller Blinds - Side Windows", qty: "2 units", price: "$680" },
                { name: "Installation Labor", qty: "1", price: "$320" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-2 rounded bg-card border border-border"
                >
                  <div>
                    <div className="text-[10px] font-medium">{item.name}</div>
                    <div className="text-[9px] text-muted-foreground">{item.qty}</div>
                  </div>
                  <span className="text-xs font-semibold">{item.price}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total */}
        <AnimatePresence>
          {showTotal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Quote Total</span>
                <span className="text-lg font-bold text-primary">$2,450.00</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border bg-card flex gap-2">
        <button className="flex-1 py-2 rounded-lg border border-input text-xs font-medium">
          Preview PDF
        </button>
        <motion.button
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1"
          animate={{ scale: inPhase(phase, 0.8, 1) ? 1.02 : 1 }}
        >
          <Send className="h-3 w-3" /> Send Quote
        </motion.button>
      </div>
    </div>
  );
};

// ===== STEP 7: Client CRM =====
export const OverviewStep7 = ({ phase = 0 }: StepProps) => {
  const clients = [
    { name: "Sarah J.", stage: "Client", stageColor: "bg-primary/10 text-primary", value: "$24.5k", hot: false },
    { name: "Chen Ind.", stage: "Proposal", stageColor: "bg-yellow-100 text-yellow-700", value: "$18.2k", hot: true },
    { name: "Wilson H.", stage: "Lead", stageColor: "bg-blue-100 text-blue-700", value: "$0", hot: false },
  ];

  const highlightedIndex = Math.floor(phase * 3) % 3;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Clients</span>
            <span className="px-1.5 py-0.5 bg-secondary text-[10px] rounded">48</span>
          </div>
          <div className="flex gap-1.5">
            <div className="h-7 w-7 rounded-lg border border-input flex items-center justify-center">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <button className="h-7 px-2 rounded-lg bg-primary text-primary-foreground text-xs">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Pipeline */}
      <div className="px-3 py-2 border-b border-border flex gap-1 overflow-x-auto">
        {["All", "Leads", "Proposals", "Clients"].map((tab, i) => (
          <span 
            key={tab}
            className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Client List */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {clients.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: i === highlightedIndex ? 1.02 : 1,
            }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-lg border bg-card ${i === highlightedIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-center gap-3">
              <MockAvatar name={client.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{client.name}</span>
                  {client.hot && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <MockStatusBadge status={client.stage} color={client.stageColor} />
                  {client.value !== "$0" && (
                    <span className="text-[10px] text-muted-foreground">{client.value}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 8: Email & Messaging =====
export const OverviewStep8 = ({ phase = 0 }: StepProps) => {
  const composing = inPhase(phase, 0.3, 0.8);
  const subjectText = "Quote #Q-1234 for your Living Room project";
  const typedSubject = subjectText.slice(0, Math.floor(phaseProgress(phase, 0.3, 0.6) * subjectText.length));

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Messages</span>
          </div>
          <motion.button
            className="h-7 px-2 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1"
            animate={{ scale: composing ? 0.95 : 1 }}
          >
            <Plus className="h-3 w-3" /> Compose
          </motion.button>
        </div>
      </div>

      {/* Compose Area */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border"
          >
            <div className="p-3 space-y-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8">To:</span>
                <div className="flex-1 flex items-center gap-1 px-2 py-1 rounded bg-card border border-input">
                  <MockAvatar name="Sarah Johnson" size="sm" />
                  <span className="text-[10px]">sarah@email.com</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8">Subj:</span>
                <div className="flex-1 px-2 py-1.5 rounded bg-card border border-primary text-[10px]">
                  {typedSubject}
                  <span className="w-0.5 h-3 bg-primary animate-pulse inline-block ml-0.5" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {[
          { from: "Sarah J.", subject: "Re: Quote approved!", time: "2h", unread: true },
          { from: "Chen Ind.", subject: "Question about fabric options", time: "1d", unread: false },
          { from: "Wilson H.", subject: "Scheduling consultation", time: "3d", unread: false },
        ].map((email, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-2.5 rounded-lg border bg-card ${email.unread ? "border-primary/30 bg-primary/5" : "border-border"}`}
          >
            <div className="flex items-center gap-2">
              <MockAvatar name={email.from} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${email.unread ? "font-semibold" : ""}`}>{email.from}</span>
                  <span className="text-[9px] text-muted-foreground">{email.time}</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{email.subject}</div>
              </div>
              {email.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 9: Inventory Library =====
export const OverviewStep9 = ({ phase = 0 }: StepProps) => {
  const items = [
    { name: "Linen Blend Sheer", category: "Fabric", stock: 45, unit: "m", price: "$28/m" },
    { name: "Blockout Velvet", category: "Fabric", stock: 12, unit: "m", price: "$65/m" },
    { name: "Motorized Track 3m", category: "Hardware", stock: 8, unit: "pcs", price: "$180" },
  ];

  const highlightedIndex = Math.floor(phase * 3) % 3;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Package className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Library</span>
          </div>
          <div className="flex gap-1.5">
            <div className="h-7 w-7 rounded-lg border border-input flex items-center justify-center">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 py-2 border-b border-border flex gap-1 overflow-x-auto">
        {["All", "Fabrics", "Hardware", "Accessories"].map((tab, i) => (
          <span 
            key={tab}
            className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: i === highlightedIndex ? 1.02 : 1,
            }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-lg border bg-card ${i === highlightedIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold">{item.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted">{item.category}</span>
                  <span className="text-[10px] text-muted-foreground">{item.stock} {item.unit} in stock</span>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">{item.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 10: Calendar & Scheduling =====
export const OverviewStep10 = ({ phase = 0 }: StepProps) => {
  const events = [
    { time: "9:00 AM", title: "Site Measure - Sarah J.", color: "bg-blue-500" },
    { time: "2:00 PM", title: "Installation - Chen Ind.", color: "bg-green-500" },
    { time: "4:30 PM", title: "Quote Presentation", color: "bg-purple-500" },
  ];

  const highlightedIndex = Math.floor(phase * 3) % 3;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Calendar</span>
          </div>
          <button className="h-7 px-2 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1">
            <Plus className="h-3 w-3" /> Event
          </button>
        </div>
      </div>

      {/* Date Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="text-center">
          <div className="text-sm font-semibold">Today, January 20</div>
          <div className="text-[10px] text-muted-foreground">3 appointments scheduled</div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: i === highlightedIndex ? 1.02 : 1,
            }}
            transition={{ delay: i * 0.15 }}
            className={`p-3 rounded-lg border bg-card ${i === highlightedIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-10 rounded-full ${event.color}`} />
              <div className="flex-1">
                <div className="text-xs font-semibold">{event.title}</div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 11: Settings & Customization =====
export const OverviewStep11 = ({ phase = 0 }: StepProps) => {
  const settings = [
    { icon: Building2, label: "Business Profile", desc: "Company details & branding" },
    { icon: Percent, label: "Pricing & Markup", desc: "Margins and calculations" },
    { icon: Users, label: "Team Members", desc: "Roles and permissions" },
    { icon: Palette, label: "Theme & Colors", desc: "Customize appearance" },
    { icon: Globe, label: "Integrations", desc: "Connect external services" },
  ];

  const highlightedIndex = Math.floor(phase * settings.length) % settings.length;

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Settings className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">Settings</span>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 p-3 space-y-2 overflow-auto">
        {settings.map((setting, i) => (
          <motion.div
            key={setting.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: i === highlightedIndex ? 1.02 : 1,
            }}
            transition={{ delay: i * 0.08 }}
            className={`p-3 rounded-lg border bg-card ${i === highlightedIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${i === highlightedIndex ? "bg-primary/10" : "bg-muted"}`}>
                <setting.icon className={`h-4 w-4 ${i === highlightedIndex ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold">{setting.label}</div>
                <div className="text-[10px] text-muted-foreground">{setting.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===== STEP 12: Final Summary =====
export const OverviewStep12 = ({ phase = 0 }: StepProps) => {
  const features = [
    { icon: FolderOpen, label: "Job Management", color: "bg-blue-500" },
    { icon: Ruler, label: "Measurements", color: "bg-green-500" },
    { icon: Receipt, label: "Quotes & Invoices", color: "bg-purple-500" },
    { icon: Users, label: "Client CRM", color: "bg-orange-500" },
    { icon: Package, label: "Inventory", color: "bg-pink-500" },
    { icon: Calendar, label: "Scheduling", color: "bg-cyan-500" },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg"
        >
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-bold text-center mb-1"
        >
          Your Complete Solution
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] text-muted-foreground text-center mb-4"
        >
          Everything you need to run your business
        </motion.p>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-2 rounded-lg bg-card border border-border text-center"
            >
              <div className={`w-8 h-8 mx-auto rounded-lg ${feature.color} flex items-center justify-center mb-1`}>
                <feature.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-[9px] font-medium">{feature.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 text-center"
        >
          <div className="text-[10px] text-muted-foreground mb-2">
            Use the ? buttons throughout the app for detailed guides
          </div>
        </motion.div>
      </div>
    </div>
  );
};
