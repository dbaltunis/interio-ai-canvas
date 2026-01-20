import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Package, Calendar, QrCode, Plus, Check, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";

interface SceneProps { progress: number; }

const inventoryItems = [
  { name: "Premium Linen", sku: "FAB-001", price: "$45/m", stock: 34, color: "bg-amber-100" },
  { name: "Blockout White", sku: "FAB-002", price: "$38/m", stock: 28, color: "bg-slate-200" },
  { name: "Track 120cm", sku: "HW-015", price: "$85", stock: 12, color: "bg-zinc-300" },
  { name: "S-Fold Glides", sku: "HW-022", price: "$2.50", stock: 156, color: "bg-blue-100" },
];
const appointments = [
  { time: "9:00 AM", title: "Sarah J - Measure", client: "Sarah Johnson", location: "123 Oak St", color: "bg-blue-500" },
  { time: "11:30 AM", title: "Chen Ind - Install", client: "Chen Industries", location: "45 Business Ave", color: "bg-emerald-500" },
  { time: "2:00 PM", title: "Emma D - Consult", client: "Emma Davis", location: "78 Pine Rd", color: "bg-purple-500" },
];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const LibraryCalendarScene = ({ progress }: SceneProps) => {
  const splitIn = phaseProgress(progress, 0, 0.15);
  const libraryIn = phaseProgress(progress, 0.1, 0.4);
  const qrScanIn = phaseProgress(progress, 0.35, 0.55);
  const calendarIn = phaseProgress(progress, 0.5, 0.75);
  const appointmentsIn = phaseProgress(progress, 0.7, 0.95);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex">
      <motion.div className="w-1/2 border-r border-border flex flex-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: splitIn, x: 0 }}>
        <div className="p-2 border-b border-border"><div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] font-semibold">Library</span></div><motion.button className="p-1 bg-primary/10 rounded" animate={qrScanIn > 0.2 && qrScanIn < 0.8 ? { scale: [1, 1.1, 1] } : {}}><QrCode className="w-3 h-3 text-primary" /></motion.button></div><div className="flex gap-1">{["Fabrics", "Hardware"].map((t, i) => (<motion.div key={t} className={`flex-1 py-1 text-center text-[8px] rounded-md ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`} initial={{ opacity: 0 }} animate={{ opacity: libraryIn }}>{t}</motion.div>))}</div></div>
        <div className="flex-1 p-1.5 space-y-1 overflow-auto">{inventoryItems.map((item, i) => { const itemProgress = phaseProgress(libraryIn, i * 0.08 + 0.15, i * 0.08 + 0.35); const isScanned = qrScanIn > 0.7 && i === 0; return (
          <motion.div key={item.sku} className={`flex gap-2 p-1.5 bg-card border rounded-lg relative ${isScanned ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: itemProgress, x: 0, scale: isScanned ? 1.02 : 1 }}>
            <div className={`w-8 h-10 rounded ${item.color} shrink-0`} />
            <div className="flex-1 min-w-0"><div className="flex items-start justify-between"><div><p className="text-[8px] font-medium truncate">{item.name}</p><p className="text-[6px] text-muted-foreground">{item.sku}</p></div><span className="text-[8px] font-semibold text-primary">{item.price}</span></div><div className="flex items-center gap-1 mt-0.5"><span className={`text-[6px] px-1 py-0.5 rounded ${item.stock > 20 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.stock} stock</span></div></div>
            {isScanned && <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-2.5 h-2.5 text-primary-foreground" /></motion.div>}
          </motion.div>
        ); })}</div>
        <AnimatePresence>{qrScanIn > 0.3 && qrScanIn < 0.65 && (<motion.div className="absolute left-0 top-0 w-1/2 h-full bg-black/80 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="relative w-24 h-24"><div className="absolute inset-0 border-2 border-primary rounded-lg" /><motion.div className="absolute left-0 right-0 h-0.5 bg-primary" animate={{ top: ["10%", "90%", "10%"] }} transition={{ repeat: Infinity, duration: 1.5 }} /><QrCode className="absolute inset-0 m-auto w-8 h-8 text-white/50" /></div></motion.div>)}</AnimatePresence>
      </motion.div>
      <motion.div className="w-1/2 flex flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: splitIn, x: 0 }}>
        <div className="p-2 border-b border-border"><div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /><span className="text-[9px] font-semibold">Calendar</span></div><div className="flex items-center gap-1"><ChevronLeft className="w-3 h-3 text-muted-foreground" /><span className="text-[8px] font-medium">Jan 2026</span><ChevronRight className="w-3 h-3 text-muted-foreground" /></div></div><motion.div className="flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: calendarIn }}>{weekDays.map((d, i) => (<motion.div key={d} className={`flex-1 py-1 text-center text-[7px] rounded ${i === 2 ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`} initial={{ opacity: 0, y: -5 }} animate={{ opacity: calendarIn, y: 0 }} transition={{ delay: i * 0.03 }}>{d}<span className="block text-[9px] font-medium">{13 + i}</span></motion.div>))}</motion.div></div>
        <div className="flex-1 p-1.5 space-y-1 overflow-auto">{appointments.map((apt, i) => { const aptProgress = phaseProgress(appointmentsIn, i * 0.1, i * 0.1 + 0.25); return (
          <motion.div key={apt.time} className="relative p-2 rounded-lg border-l-2 bg-card" style={{ borderLeftColor: apt.color.includes('blue') ? '#3b82f6' : apt.color.includes('emerald') ? '#10b981' : '#a855f7' }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: aptProgress, x: 0 }}>
            <div className="flex items-start justify-between mb-1"><span className="text-[7px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{apt.time}</span><div className={`w-2 h-2 rounded-full ${apt.color}`} /></div>
            <p className="text-[9px] font-medium mb-0.5">{apt.title}</p>
            <div className="flex items-center gap-2 text-[7px] text-muted-foreground"><span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{apt.client}</span><span className="flex items-center gap-0.5 truncate"><MapPin className="w-2.5 h-2.5 shrink-0" />{apt.location}</span></div>
          </motion.div>
        ); })}<motion.button className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-primary/30 rounded-lg text-[8px] text-primary" initial={{ opacity: 0 }} animate={{ opacity: appointmentsIn > 0.8 ? 1 : 0 }}><Plus className="w-3 h-3" />Add Appointment</motion.button></div>
      </motion.div>
    </div>
  );
};
