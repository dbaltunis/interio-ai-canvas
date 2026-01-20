import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { LayoutDashboard, Users, FileText, Package, Calendar, Settings } from "lucide-react";

interface SceneProps {
  progress: number;
}

export const AppOverviewScene = ({ progress }: SceneProps) => {
  const fadeIn = phaseProgress(progress, 0, 0.3);
  const elementsIn = phaseProgress(progress, 0.2, 0.7);
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", color: "bg-primary" },
    { icon: Users, label: "Clients", color: "bg-blue-500" },
    { icon: FileText, label: "Jobs", color: "bg-emerald-500" },
    { icon: Package, label: "Library", color: "bg-amber-500" },
    { icon: Calendar, label: "Calendar", color: "bg-purple-500" },
    { icon: Settings, label: "Settings", color: "bg-zinc-500" },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Animated background pattern */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeIn * 0.05 }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </motion.div>

      {/* Logo and title */}
      <motion.div 
        className="absolute top-6 left-6 flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: fadeIn, x: 0 }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
          <span className="text-primary-foreground font-bold text-lg">I</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">InterioApp</h1>
          <p className="text-xs text-muted-foreground">Window Treatment Platform</p>
        </div>
      </motion.div>

      {/* Feature cards grid */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <div className="grid grid-cols-3 gap-3 p-4 max-w-xs">
          {menuItems.map((item, index) => {
            const delay = index * 0.1;
            const itemProgress = phaseProgress(elementsIn, delay, delay + 0.4);
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.label}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: itemProgress, 
                  scale: 0.8 + itemProgress * 0.2,
                  y: 20 - itemProgress * 20
                }}
              >
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating accent elements */}
      <motion.div
        className="absolute top-20 right-8 w-16 h-16 rounded-full bg-primary/10 blur-xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-8 w-20 h-20 rounded-full bg-blue-500/10 blur-xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};
