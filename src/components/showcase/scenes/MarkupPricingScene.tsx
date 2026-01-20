import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { DollarSign, Percent, Calculator, TrendingUp, Check, Wrench, Truck, Package, Layers, Users } from "lucide-react";

interface SceneProps { progress: number; }

const pricingRules = [
  { category: "Materials", icon: Package, color: "bg-blue-500", markup: 65, cost: 1200 },
  { category: "Labor", icon: Wrench, color: "bg-purple-500", markup: 45, cost: 800 },
  { category: "Installation", icon: Truck, color: "bg-emerald-500", markup: 30, cost: 350 },
  { category: "Overhead", icon: Layers, color: "bg-amber-500", markup: 15, cost: 200 },
];

const calculatePrice = (cost: number, markup: number) => cost * (1 + markup / 100);

export const MarkupPricingScene = ({ progress }: SceneProps) => {
  const headerIn = phaseProgress(progress, 0, 0.15);
  const rulesIn = phaseProgress(progress, 0.1, 0.45);
  const editingIn = phaseProgress(progress, 0.4, 0.6);
  const calculatorIn = phaseProgress(progress, 0.55, 0.8);
  const dealerIn = phaseProgress(progress, 0.75, 0.95);
  const materialMarkup = editingIn > 0.3 ? 70 : 65;
  const isEditing = editingIn > 0.2 && editingIn < 0.8;
  const totalCost = pricingRules.reduce((s, r) => s + r.cost, 0);
  const totalWithMarkup = pricingRules.reduce((s, r, i) => s + calculatePrice(r.cost, i === 0 ? materialMarkup : r.markup), 0);
  const margin = ((totalWithMarkup - totalCost) / totalWithMarkup * 100).toFixed(1);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
      <motion.div className="p-2 border-b border-border bg-card/50" initial={{ opacity: 0, y: -10 }} animate={{ opacity: headerIn, y: 0 }}>
        <div className="flex items-center gap-2"><div className="p-1.5 bg-primary/10 rounded-lg"><Percent className="w-4 h-4 text-primary" /></div><div><h3 className="text-[11px] font-semibold">Pricing & Markups</h3><p className="text-[8px] text-muted-foreground">Configure margins</p></div></div>
      </motion.div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-2 space-y-1.5 overflow-auto">
          {pricingRules.map((rule, i) => {
            const ruleProgress = phaseProgress(rulesIn, i * 0.08, i * 0.08 + 0.25);
            const Icon = rule.icon;
            const markup = i === 0 ? materialMarkup : rule.markup;
            const price = calculatePrice(rule.cost, markup);
            const isRuleEditing = i === 0 && isEditing;
            return (
              <motion.div key={rule.category} className={`bg-card border rounded-lg p-2 ${isRuleEditing ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: ruleProgress, x: 0, scale: isRuleEditing ? 1.02 : 1 }}>
                <div className="flex items-center gap-2 mb-1.5"><div className={`w-6 h-6 rounded-md ${rule.color} flex items-center justify-center`}><Icon className="w-3 h-3 text-white" /></div><p className="text-[9px] font-semibold">{rule.category}</p></div>
                <div className="flex items-center gap-2">
                  <div className="flex-1"><span className="text-[7px] text-muted-foreground block">Cost</span><span className="text-[9px] font-medium">${rule.cost}</span></div>
                  <div className="flex-1"><span className="text-[7px] text-muted-foreground block">Markup</span><motion.div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-medium ${isRuleEditing ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`} animate={isRuleEditing ? { scale: [1, 1.05, 1] } : {}}><span>{markup}</span><Percent className="w-2.5 h-2.5 text-muted-foreground" /></motion.div></div>
                  <div className="flex-1 text-right"><span className="text-[7px] text-muted-foreground block">Sell</span><span className="text-[9px] font-semibold text-primary">${price.toFixed(0)}</span></div>
                </div>
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden"><motion.div className={`h-full ${rule.color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(markup, 100)}%` }} /></div>
              </motion.div>
            );
          })}
        </div>
        <motion.div className="w-[105px] p-2 space-y-2 bg-card/30 border-l border-border" initial={{ opacity: 0, x: 10 }} animate={{ opacity: calculatorIn, x: 0 }}>
          <div className="flex items-center gap-1"><Calculator className="w-3 h-3 text-primary" /><span className="text-[9px] font-semibold">Summary</span></div>
          <div className="bg-card border border-border rounded-md p-1.5"><span className="text-[7px] text-muted-foreground block">Cost</span><span className="text-[10px] font-medium">${totalCost}</span></div>
          <div className="bg-card border border-border rounded-md p-1.5"><span className="text-[7px] text-muted-foreground block">Sell</span><span className="text-[10px] font-bold text-primary">${totalWithMarkup.toFixed(0)}</span></div>
          <div className="bg-primary/10 border border-primary/20 rounded-md p-1.5"><span className="text-[7px] text-muted-foreground block">Margin</span><div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-[11px] font-bold text-emerald-500">{margin}%</span></div></div>
          <AnimatePresence>{dealerIn > 0 && (<motion.div className="bg-card border border-border rounded-md p-1.5" initial={{ opacity: 0, y: 5 }} animate={{ opacity: dealerIn, y: 0 }}><div className="flex items-center justify-between"><div className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" /><span className="text-[8px]">Dealer</span></div><div className="w-6 h-3.5 rounded-full bg-primary relative"><div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" /></div></div></motion.div>)}</AnimatePresence>
        </motion.div>
      </div>
      <motion.div className="p-2 border-t border-border bg-card/50" initial={{ opacity: 0 }} animate={{ opacity: dealerIn }}><button className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium"><Check className="w-3 h-3" />Save Pricing</button></motion.div>
    </div>
  );
};
