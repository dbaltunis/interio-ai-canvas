import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Sun, Moon, Palette, Check, Paintbrush, CheckCircle } from "lucide-react";

interface SceneProps { progress: number; }

const colorPresets = [
  { name: "Ocean", primary: "hsl(221, 83%, 53%)" },
  { name: "Forest", primary: "hsl(142, 71%, 45%)" },
  { name: "Sunset", primary: "hsl(24, 95%, 53%)" },
  { name: "Berry", primary: "hsl(330, 81%, 60%)" },
  { name: "Slate", primary: "hsl(215, 20%, 40%)" },
  { name: "Royal", primary: "hsl(262, 83%, 58%)" },
];

const SampleCard = ({ isDark, color }: { isDark: boolean; color: string }) => (
  <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}>
    <div className="p-2">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-medium" style={{ backgroundColor: color }}>SJ</div>
        <div className="flex-1"><p className={`text-[9px] font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>Sarah Johnson</p><p className={`text-[7px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>P-1234</p></div>
      </div>
      <div className="flex items-center justify-between">
        <span className="px-1.5 py-0.5 rounded text-[7px] font-medium bg-green-100 text-green-700">Approved</span>
        <span className="text-[9px] font-semibold" style={{ color }}>$4,250</span>
      </div>
    </div>
  </div>
);

export const ThemeColorsScene = ({ progress }: SceneProps) => {
  const introIn = phaseProgress(progress, 0, 0.15);
  const splitIn = phaseProgress(progress, 0.1, 0.35);
  const toggleIn = phaseProgress(progress, 0.3, 0.5);
  const colorsIn = phaseProgress(progress, 0.45, 0.7);
  const selectionIn = phaseProgress(progress, 0.65, 0.85);
  const applyIn = phaseProgress(progress, 0.8, 1);
  const isDark = toggleIn > 0.5;
  const selectedIdx = selectionIn > 0.5 ? 5 : 0;
  const currentColor = colorPresets[selectedIdx].primary;

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
      <motion.div className="p-2 border-b border-border bg-card/50" initial={{ opacity: 0, y: -10 }} animate={{ opacity: introIn, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="p-1.5 bg-primary/10 rounded-lg"><Paintbrush className="w-4 h-4 text-primary" /></div><div><h3 className="text-[11px] font-semibold">Theme & Colors</h3><p className="text-[8px] text-muted-foreground">Customize workspace</p></div></div>
          <motion.div className="flex items-center gap-1.5 bg-muted rounded-full p-0.5" initial={{ opacity: 0 }} animate={{ opacity: toggleIn }}>
            <motion.div className={`p-1 rounded-full ${!isDark ? 'bg-background shadow-sm' : ''}`}><Sun className="w-3 h-3" /></motion.div>
            <motion.div className={`p-1 rounded-full ${isDark ? 'bg-background shadow-sm' : ''}`}><Moon className="w-3 h-3" /></motion.div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="flex-1 flex overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: splitIn }}>
        <motion.div className="flex-1 p-2 bg-zinc-50" animate={{ opacity: isDark ? 0.5 : 1 }}><div className="flex items-center gap-1 mb-2"><Sun className="w-3 h-3 text-amber-500" /><span className="text-[8px] font-medium text-zinc-600">Light</span></div><SampleCard isDark={false} color={currentColor} /></motion.div>
        <motion.div className="flex-1 p-2 bg-zinc-900" animate={{ opacity: !isDark ? 0.5 : 1 }}><div className="flex items-center gap-1 mb-2"><Moon className="w-3 h-3 text-indigo-400" /><span className="text-[8px] font-medium text-zinc-400">Dark</span></div><SampleCard isDark={true} color={currentColor} /></motion.div>
      </motion.div>
      <motion.div className="p-2 border-t border-border bg-card/50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: colorsIn, y: 0 }}>
        <div className="flex items-center gap-1.5 mb-2"><Palette className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] font-semibold">Color Palette</span></div>
        <div className="grid grid-cols-6 gap-1.5">{colorPresets.map((p, i) => { const isSel = i === selectedIdx; return (<motion.div key={p.name} className={`aspect-square rounded-lg cursor-pointer ${isSel ? 'ring-2 ring-offset-2 ring-primary' : ''}`} style={{ backgroundColor: p.primary }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: phaseProgress(colorsIn, i * 0.03, i * 0.03 + 0.2), scale: isSel && selectionIn > 0.7 ? 1.1 : 1 }}>{isSel && <motion.div className="w-full h-full flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-white drop-shadow-md" /></motion.div>}</motion.div>); })}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[8px] text-muted-foreground">Selected: <span className="font-medium">{colorPresets[selectedIdx].name}</span></span>
          <motion.button className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[9px] font-medium" initial={{ opacity: 0 }} animate={{ opacity: applyIn }}><CheckCircle className="w-3 h-3" />Apply</motion.button>
        </div>
      </motion.div>
    </div>
  );
};
