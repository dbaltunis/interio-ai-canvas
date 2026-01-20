import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Shield, Users, Factory, Check, X } from "lucide-react";

interface SceneProps {
  progress: number;
}

const roles = [
  { 
    icon: Users, 
    label: "Dealer", 
    color: "from-blue-500 to-blue-600",
    permissions: [true, true, false, true]
  },
  { 
    icon: Shield, 
    label: "Admin", 
    color: "from-emerald-500 to-emerald-600",
    permissions: [true, true, true, true]
  },
  { 
    icon: Factory, 
    label: "Manufacturer", 
    color: "from-amber-500 to-amber-600",
    permissions: [false, true, true, false]
  },
];

const permissionLabels = ["View Quotes", "Edit Orders", "Manage Team", "Access Reports"];

export const TeamPermissionsScene = ({ progress }: SceneProps) => {
  const cardsIn = phaseProgress(progress, 0, 0.4);
  const togglesAnimate = phaseProgress(progress, 0.3, 0.9);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden p-4">
      {/* Header */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: cardsIn, y: 0 }}
      >
        <h2 className="text-sm font-semibold text-foreground">Team Permissions</h2>
        <p className="text-[10px] text-muted-foreground">Custom access for every role</p>
      </motion.div>

      {/* Role cards */}
      <div className="flex gap-2 justify-center">
        {roles.map((role, roleIndex) => {
          const delay = roleIndex * 0.15;
          const cardProgress = phaseProgress(cardsIn, delay, delay + 0.5);
          const Icon = role.icon;

          return (
            <motion.div
              key={role.label}
              className="flex-1 max-w-[100px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ 
                opacity: cardProgress,
                x: 50 - cardProgress * 50
              }}
            >
              <div className="bg-card rounded-xl border border-border/50 p-2 shadow-lg">
                {/* Role header */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[10px] font-medium text-center text-foreground mb-2">{role.label}</h3>
                
                {/* Permission toggles */}
                <div className="space-y-1.5">
                  {role.permissions.map((enabled, permIndex) => {
                    const toggleDelay = (roleIndex * 0.1) + (permIndex * 0.08);
                    const toggleProgress = phaseProgress(togglesAnimate, toggleDelay, toggleDelay + 0.3);
                    
                    return (
                      <motion.div
                        key={permIndex}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: toggleProgress }}
                      >
                        <span className="text-[8px] text-muted-foreground truncate max-w-[50px]">
                          {permissionLabels[permIndex]}
                        </span>
                        <motion.div
                          className={`w-6 h-3.5 rounded-full flex items-center px-0.5 ${
                            enabled ? 'bg-primary' : 'bg-muted'
                          }`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 0.8 + toggleProgress * 0.2 }}
                        >
                          <motion.div
                            className="w-2.5 h-2.5 rounded-full bg-white shadow-sm flex items-center justify-center"
                            animate={{ 
                              x: enabled ? toggleProgress * 8 : 0 
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            {enabled ? (
                              <Check className="w-1.5 h-1.5 text-primary" />
                            ) : (
                              <X className="w-1.5 h-1.5 text-muted-foreground" />
                            )}
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Highlight glow */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: phaseProgress(progress, 0.7, 1),
          scale: 0.9 + phaseProgress(progress, 0.7, 1) * 0.1
        }}
      >
        <span className="text-[9px] font-medium text-primary">✨ Granular Control</span>
      </motion.div>
    </div>
  );
};
