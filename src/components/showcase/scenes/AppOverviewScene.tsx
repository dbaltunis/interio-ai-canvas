import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { 
  LayoutDashboard, Users, FolderOpen, Package, Calendar, Settings, 
  TrendingUp, DollarSign, Clock, CheckCircle, ChevronRight, Bell,
  Search, Plus, MoreVertical
} from "lucide-react";

interface SceneProps {
  progress: number;
}

// KPI data matching real CompactKPIRow
const kpiData = [
  { label: "Active Jobs", value: "24", change: "+3", icon: FolderOpen, color: "text-blue-500" },
  { label: "Revenue MTD", value: "$47.2K", change: "+12%", icon: DollarSign, color: "text-emerald-500" },
  { label: "Due Today", value: "5", change: "", icon: Clock, color: "text-amber-500" },
  { label: "Completed", value: "18", change: "+2", icon: CheckCircle, color: "text-green-500" },
];

// Recent jobs matching real DemoJobCard structure
const recentJobs = [
  { id: "P-1234", client: "Sarah J.", status: "approved", total: "$4,250", color: "bg-green-500" },
  { id: "P-1235", client: "Chen Ind.", status: "in_production", total: "$12,800", color: "bg-purple-500" },
  { id: "P-1236", client: "Wilson H.", status: "quote_sent", total: "$1,950", color: "bg-blue-500" },
];

// Navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FolderOpen, label: "Jobs", count: 24 },
  { icon: Users, label: "Clients", count: 156 },
  { icon: Package, label: "Library" },
  { icon: Calendar, label: "Calendar" },
  { icon: Settings, label: "Settings" },
];

export const AppOverviewScene = ({ progress }: SceneProps) => {
  const headerIn = phaseProgress(progress, 0, 0.15);
  const navIn = phaseProgress(progress, 0.1, 0.3);
  const kpiIn = phaseProgress(progress, 0.25, 0.5);
  const jobsIn = phaseProgress(progress, 0.45, 0.75);
  const actionsIn = phaseProgress(progress, 0.7, 1);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex">
      {/* Sidebar navigation - matching real app */}
      <motion.div 
        className="w-[72px] bg-card border-r border-border flex flex-col items-center py-2 gap-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: navIn, x: 0 }}
      >
        {/* Logo */}
        <motion.div 
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3"
          initial={{ scale: 0.8 }}
          animate={{ scale: 0.8 + headerIn * 0.2 }}
        >
          <span className="text-primary-foreground font-bold text-lg">I</span>
        </motion.div>

        {/* Nav items */}
        {navItems.map((item, index) => {
          const delay = index * 0.05;
          const itemProgress = phaseProgress(navIn, delay, delay + 0.3);
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.label}
              className={`relative w-12 h-10 rounded-lg flex items-center justify-center transition-colors ${
                item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: itemProgress, x: 0 }}
            >
              <Icon className="w-4 h-4" />
              {item.count && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center font-medium">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar - matching real WelcomeHeader */}
        <motion.div 
          className="h-11 border-b border-border flex items-center justify-between px-3 bg-card/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: headerIn, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-primary">JD</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium">Good morning, John!</p>
              <p className="text-[8px] text-muted-foreground">3 tasks due today</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-7 px-2 rounded-md border border-input bg-background flex items-center gap-1">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Search...</span>
            </div>
            <motion.div 
              className="relative"
              animate={actionsIn > 0.5 ? { scale: [1, 1.1, 1] } : {}}
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
            </motion.div>
          </div>
        </motion.div>

        {/* Dashboard content */}
        <div className="flex-1 p-2 space-y-2 overflow-hidden">
          {/* KPI Row - matching real CompactKPIRow */}
          <motion.div 
            className="grid grid-cols-4 gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: kpiIn, y: 0 }}
          >
            {kpiData.map((kpi, index) => {
              const delay = index * 0.08;
              const itemProgress = phaseProgress(kpiIn, delay, delay + 0.3);
              const Icon = kpi.icon;
              
              return (
                <motion.div
                  key={kpi.label}
                  className="bg-card border border-border rounded-lg p-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: itemProgress, scale: 0.95 + itemProgress * 0.05 }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className={`w-3 h-3 ${kpi.color}`} />
                    <span className="text-[8px] text-muted-foreground">{kpi.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold">{kpi.value}</span>
                    {kpi.change && (
                      <span className="text-[8px] text-emerald-500 font-medium">{kpi.change}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent Jobs section - matching real job cards */}
          <motion.div
            className="bg-card border border-border rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: jobsIn, y: 0 }}
          >
            <div className="flex items-center justify-between p-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-medium">Recent Jobs</span>
                <span className="px-1 py-0.5 bg-secondary text-secondary-foreground text-[8px] rounded">24</span>
              </div>
              <motion.button 
                className="flex items-center gap-0.5 text-[8px] text-primary"
                animate={actionsIn > 0.3 ? { x: [0, 2, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                View all <ChevronRight className="w-3 h-3" />
              </motion.button>
            </div>

            <div className="divide-y divide-border">
              {recentJobs.map((job, index) => {
                const delay = index * 0.1;
                const itemProgress = phaseProgress(jobsIn, delay + 0.2, delay + 0.5);
                
                return (
                  <motion.div
                    key={job.id}
                    className="flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: itemProgress, x: 0 }}
                  >
                    <div className={`w-6 h-6 rounded-full ${job.color} flex items-center justify-center`}>
                      <span className="text-[8px] font-medium text-white">
                        {job.client.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium">{job.client}</span>
                        <span className="text-[8px] text-muted-foreground">{job.id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-1 py-0.5 rounded text-[7px] font-medium ${
                          job.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          job.status === 'in_production' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-primary">{job.total}</span>
                    <MoreVertical className="w-3 h-3 text-muted-foreground" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div 
            className="flex gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: actionsIn, y: 0 }}
          >
            <motion.button 
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium"
              animate={actionsIn > 0.7 ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Plus className="w-3 h-3" />
              New Job
            </motion.button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 border border-border bg-card rounded-lg text-[10px] font-medium">
              <Users className="w-3 h-3" />
              Add Client
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
