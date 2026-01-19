/**
 * DemoClientDrawer - Presentation-only version extracted from ClientDetailDrawer.tsx
 * 100% visual accuracy with no data dependencies
 */

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronDown, Mail, Phone, MessageSquare, Calendar, 
  Edit2, FileText, Folder, Activity, StickyNote 
} from "lucide-react";
import { DemoClientData } from "./DemoClientCard";

interface DemoClientDrawerProps {
  visible?: boolean;
  client?: DemoClientData;
  activeTab?: "activity" | "notes" | "files" | "projects";
  activeAction?: string | null;
}

// Exact stage color from ClientDetailDrawer
const getStageColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'lead':
      return 'bg-blue-100 text-blue-700';
    case 'contacted':
      return 'bg-purple-100 text-purple-700';
    case 'qualified':
      return 'bg-green-100 text-green-700';
    case 'proposal':
      return 'bg-yellow-100 text-yellow-700';
    case 'negotiation':
      return 'bg-orange-100 text-orange-700';
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'lost':
      return 'bg-red-100 text-red-700';
    case 'client':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const DemoClientDrawer = ({ 
  visible = false, 
  client,
  activeTab = "activity",
  activeAction = null,
}: DemoClientDrawerProps) => {
  const displayClient = client || {
    id: "demo",
    name: "Sarah Johnson",
    email: "sarah@designstudio.com",
    stage: "qualified" as const,
    company: "Design Studio",
  };

  const initials = displayClient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const stageColor = getStageColor(displayClient.stage);

  const quickActions = [
    { icon: Mail, label: "Email", id: "email" },
    { icon: Phone, label: "Call", id: "call" },
    { icon: MessageSquare, label: "WhatsApp", id: "whatsapp" },
    { icon: Calendar, label: "Schedule", id: "schedule" },
    { icon: Edit2, label: "Edit", id: "edit" },
  ];

  const tabs = [
    { id: "activity", icon: Activity, label: "Activity" },
    { id: "notes", icon: StickyNote, label: "Notes" },
    { id: "files", icon: FileText, label: "Files" },
    { id: "projects", icon: Folder, label: "Projects" },
  ];

  return (
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
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold leading-tight">{displayClient.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {displayClient.company || "Client"}
                    </p>
                    
                    {/* Stage selector + Lead source */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <motion.div 
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium cursor-pointer ${stageColor}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span>{displayClient.stage.toUpperCase()}</span>
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                      <span className="px-1.5 py-0.5 bg-secondary text-[9px] rounded">Direct</span>
                    </div>
                    
                    <p className="text-[9px] text-muted-foreground mt-1">In this stage 3 days</p>
                  </div>
                  <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="px-3 pb-2">
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action) => (
                    <motion.div
                      key={action.id}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-colors ${
                        activeAction === action.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      animate={activeAction === action.id ? { scale: 1.05 } : { scale: 1 }}
                    >
                      <action.icon className="h-3 w-3" />
                      <span>{action.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="px-3 pb-2">
                <div className="flex gap-1 border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Content placeholder */}
            <div className="p-3">
              <div className="space-y-2">
                <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
