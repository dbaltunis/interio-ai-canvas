import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { TrendingUp, DollarSign, Percent, Calculator } from "lucide-react";

interface SceneProps {
  progress: number;
}

const pricingRules = [
  { label: "Material Markup", value: 40, color: "bg-blue-500" },
  { label: "Labor Rate", value: 55, color: "bg-emerald-500" },
  { label: "Installation", value: 25, color: "bg-amber-500" },
  { label: "Overhead", value: 15, color: "bg-purple-500" },
];

export const MarkupPricingScene = ({ progress }: SceneProps) => {
  const cardsIn = phaseProgress(progress, 0, 0.4);
  const barsAnimate = phaseProgress(progress, 0.2, 0.7);
  const totalCalc = phaseProgress(progress, 0.6, 1);

  const totalValue = Math.round(totalCalc * 2450);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden p-3">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: cardsIn }}
      >
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pricing Rules</h2>
          <p className="text-[10px] text-muted-foreground">Smart margin calculations</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
      </motion.div>

      {/* Pricing rule cards */}
      <div className="space-y-2 mb-3">
        {pricingRules.map((rule, index) => {
          const delay = index * 0.1;
          const cardProgress = phaseProgress(cardsIn, delay, delay + 0.4);
          const barProgress = phaseProgress(barsAnimate, delay, delay + 0.5);
          
          return (
            <motion.div
              key={rule.label}
              className="bg-card rounded-xl border border-border/50 p-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: cardProgress,
                x: -20 + cardProgress * 20
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-foreground">{rule.label}</span>
                <div className="flex items-center gap-1">
                  <Percent className="w-2.5 h-2.5 text-muted-foreground" />
                  <motion.span 
                    className="text-[10px] font-semibold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: barProgress }}
                  >
                    {Math.round(barProgress * rule.value)}%
                  </motion.span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${rule.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barProgress * rule.value}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total calculator */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: totalCalc,
          scale: 0.95 + totalCalc * 0.05
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground block">Quote Total</span>
              <span className="text-[10px] font-medium text-foreground">All markups applied</span>
            </div>
          </div>
          
          <motion.div
            className="text-right"
            initial={{ scale: 1 }}
            animate={{ scale: totalCalc > 0.9 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-0.5">
              <DollarSign className="w-4 h-4 text-primary" />
              <motion.span 
                className="text-lg font-bold text-primary"
                key={totalValue}
              >
                {totalValue.toLocaleString()}
              </motion.span>
            </div>
            <span className="text-[8px] text-muted-foreground">inc. margins</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-5, 5, -5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};
