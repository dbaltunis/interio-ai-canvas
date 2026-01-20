import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Layers, Blinds, Grid3X3, Search, Check, ChevronRight, Ruler, Palette, Package, DollarSign, Settings2 } from "lucide-react";

interface SceneProps { progress: number; }

const treatmentCategories = [
  { name: "CURTAINS", treatments: [{ name: "Sheer Curtains", icon: Layers, color: "bg-pink-100 text-pink-600" }, { name: "Blockout", icon: Layers, color: "bg-purple-100 text-purple-600" }, { name: "S-Fold", icon: Layers, color: "bg-violet-100 text-violet-600" }] },
  { name: "BLINDS", treatments: [{ name: "Roller Blinds", icon: Blinds, color: "bg-blue-100 text-blue-600" }, { name: "Venetian", icon: Grid3X3, color: "bg-cyan-100 text-cyan-600" }, { name: "Roman", icon: Layers, color: "bg-orange-100 text-orange-600" }] }
];
const configOptions = [{ label: "Width", value: "1500 mm", icon: Ruler }, { label: "Height", value: "2100 mm", icon: Ruler }, { label: "Fabric", value: "Premium Linen", icon: Palette }, { label: "Lining", value: "Blockout", icon: Layers }];
const fabricSwatches = [{ color: "bg-amber-100" }, { color: "bg-slate-400" }, { color: "bg-blue-300" }, { color: "bg-pink-200" }, { color: "bg-emerald-200" }, { color: "bg-zinc-600" }];

export const ProductBuilderScene = ({ progress }: SceneProps) => {
  const headerIn = phaseProgress(progress, 0, 0.15);
  const categoriesIn = phaseProgress(progress, 0.1, 0.35);
  const selectionIn = phaseProgress(progress, 0.3, 0.5);
  const configIn = phaseProgress(progress, 0.45, 0.7);
  const fabricsIn = phaseProgress(progress, 0.65, 0.85);
  const previewIn = phaseProgress(progress, 0.8, 1);
  const selectedIdx = selectionIn > 0.5 ? 0 : -1;

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
      <motion.div className="p-2 border-b border-border bg-card/50" initial={{ opacity: 0, y: -10 }} animate={{ opacity: headerIn, y: 0 }}>
        <div className="flex items-center gap-2"><div className="p-1.5 bg-primary/10 rounded-lg"><Package className="w-4 h-4 text-primary" /></div><div><h3 className="text-[11px] font-semibold">Product Builder</h3><p className="text-[8px] text-muted-foreground">Configure treatments</p></div></div>
        <motion.div className="mt-2 h-7 rounded-md border border-input bg-background flex items-center gap-1.5 px-2" initial={{ opacity: 0 }} animate={{ opacity: headerIn }}><Search className="w-3 h-3 text-muted-foreground" /><span className="text-[9px] text-muted-foreground">Search...</span></motion.div>
      </motion.div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-2 space-y-2 overflow-auto border-r border-border">
          {treatmentCategories.map((cat, ci) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: phaseProgress(categoriesIn, ci * 0.1, ci * 0.1 + 0.25), y: 0 }}>
              <div className="flex items-center gap-1 mb-1.5"><span className="text-[8px] font-semibold text-muted-foreground tracking-wide">{cat.name}</span><div className="flex-1 h-px bg-border" /></div>
              <div className="grid grid-cols-3 gap-1">{cat.treatments.map((t, ti) => { const isSelected = ci === 0 && ti === selectedIdx; const Icon = t.icon; return (
                <motion.div key={t.name} className={`relative p-1.5 rounded-lg border ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border'}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: phaseProgress(categoriesIn, ti * 0.05, ti * 0.05 + 0.3), scale: 1 }}>
                  <div className={`w-full h-8 rounded-md ${t.color} flex items-center justify-center mb-1`}><Icon className="w-4 h-4" /></div>
                  <p className="text-[8px] text-center font-medium truncate">{t.name}</p>
                  {isSelected && <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-2.5 h-2.5 text-primary-foreground" /></motion.div>}
                </motion.div>
              ); })}</div>
            </motion.div>
          ))}
          <AnimatePresence>{fabricsIn > 0 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: fabricsIn, y: 0 }}><div className="flex items-center gap-1 mb-1.5"><Palette className="w-3 h-3 text-primary" /><span className="text-[8px] font-semibold">Select Fabric</span></div><div className="grid grid-cols-6 gap-1">{fabricSwatches.map((s, i) => { const isSel = i === 0 && fabricsIn > 0.5; return (<motion.div key={i} className={`aspect-square rounded-lg ${s.color} ${isSel ? 'ring-2 ring-primary ring-offset-1' : ''}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: phaseProgress(fabricsIn, i * 0.03, i * 0.03 + 0.2), scale: 1 }}>{isSel && <div className="w-full h-full flex items-center justify-center"><Check className="w-3 h-3 text-white drop-shadow-md" /></div>}</motion.div>); })}</div></motion.div>)}</AnimatePresence>
        </div>
        <motion.div className="w-[110px] p-2 space-y-2 bg-card/30" initial={{ opacity: 0, x: 10 }} animate={{ opacity: configIn, x: 0 }}>
          <div className="flex items-center gap-1"><Settings2 className="w-3 h-3 text-primary" /><span className="text-[9px] font-semibold">Configuration</span></div>
          {configOptions.map((opt, i) => { const Icon = opt.icon; return (<motion.div key={opt.label} className="bg-card border border-border rounded-md p-1.5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: phaseProgress(configIn, i * 0.1 + 0.1, i * 0.1 + 0.3), x: 0 }}><div className="flex items-center gap-1 text-[7px] text-muted-foreground mb-0.5"><Icon className="w-2.5 h-2.5" />{opt.label}</div><p className="text-[9px] font-medium">{opt.value}</p></motion.div>); })}
          <AnimatePresence>{previewIn > 0 && (<motion.div className="bg-primary/10 border border-primary/20 rounded-lg p-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: previewIn, scale: 1 }}><div className="flex items-center gap-1 text-[8px] text-muted-foreground mb-1"><DollarSign className="w-3 h-3" />Price</div><motion.p className="text-lg font-bold text-primary" animate={previewIn > 0.7 ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>$847.50</motion.p></motion.div>)}</AnimatePresence>
        </motion.div>
      </div>
      <motion.div className="p-2 border-t border-border bg-card/50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: previewIn, y: 0 }}><button className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium">Add to Quote<ChevronRight className="w-3 h-3" /></button></motion.div>
    </div>
  );
};
