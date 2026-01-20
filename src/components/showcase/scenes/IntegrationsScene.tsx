import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { ShoppingBag, Mail, Database, Zap, Workflow } from "lucide-react";

interface SceneProps {
  progress: number;
}

const integrations = [
  { icon: ShoppingBag, name: "Shopify", color: "bg-green-500", position: { x: 15, y: 30 } },
  { icon: Mail, name: "Email", color: "bg-blue-500", position: { x: 75, y: 25 } },
  { icon: Database, name: "ERP", color: "bg-purple-500", position: { x: 20, y: 70 } },
  { icon: Workflow, name: "Zapier", color: "bg-orange-500", position: { x: 70, y: 65 } },
];

export const IntegrationsScene = ({ progress }: SceneProps) => {
  const hubIn = phaseProgress(progress, 0, 0.3);
  const logosIn = phaseProgress(progress, 0.2, 0.6);
  const linesIn = phaseProgress(progress, 0.4, 0.8);
  const pulseEffect = phaseProgress(progress, 0.7, 1);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Central hub */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: hubIn,
          scale: 0.5 + hubIn * 0.5
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 w-16 h-16 -m-2 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: pulseEffect > 0 ? [1, 1.3, 1] : 1,
            opacity: pulseEffect > 0 ? [0.3, 0.6, 0.3] : 0.3,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        
        <motion.span
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-foreground whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: hubIn }}
        >
          InterioApp Hub
        </motion.span>
      </motion.div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {integrations.map((integration, index) => {
          const lineProgress = phaseProgress(linesIn, index * 0.1, index * 0.1 + 0.4);
          
          return (
            <motion.line
              key={`line-${index}`}
              x1="50%"
              y1="50%"
              x2={`${integration.position.x}%`}
              y2={`${integration.position.y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: lineProgress,
                opacity: lineProgress * 0.5
              }}
            />
          );
        })}
      </svg>

      {/* Integration logos */}
      {integrations.map((integration, index) => {
        const delay = index * 0.12;
        const logoProgress = phaseProgress(logosIn, delay, delay + 0.4);
        const Icon = integration.icon;
        const isPulsing = pulseEffect > 0.5 && index === Math.floor(pulseEffect * 4) % 4;
        
        // Calculate flying animation
        const startX = index % 2 === 0 ? -50 : 150;
        const startY = index < 2 ? -50 : 150;
        
        return (
          <motion.div
            key={integration.name}
            className="absolute"
            style={{
              left: `${integration.position.x}%`,
              top: `${integration.position.y}%`,
            }}
            initial={{ 
              x: startX - integration.position.x,
              y: startY - integration.position.y,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              x: 0,
              y: 0,
              opacity: logoProgress,
              scale: isPulsing ? 1.15 : 0.5 + logoProgress * 0.5
            }}
          >
            <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center shadow-lg -translate-x-1/2 -translate-y-1/2`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <motion.span
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-medium text-muted-foreground whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: logoProgress }}
            >
              {integration.name}
            </motion.span>
            
            {/* Connection pulse */}
            {isPulsing && (
              <motion.div
                className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-primary"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Data flow particles */}
      {linesIn > 0.5 && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                y: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 160],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
