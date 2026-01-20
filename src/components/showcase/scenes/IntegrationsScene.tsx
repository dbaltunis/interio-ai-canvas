import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Zap, Check, X, RefreshCw, ExternalLink, Settings, Mail, Calendar, ShoppingBag, MessageCircle, Database, Cloud, CheckCircle, AlertCircle } from "lucide-react";

interface SceneProps { progress: number; }

const integrations = [
  { name: "Google Calendar", icon: Calendar, color: "bg-blue-500", status: "connected", lastSync: "2 min ago" },
  { name: "Gmail", icon: Mail, color: "bg-red-500", status: "connected", lastSync: "5 min ago" },
  { name: "Shopify", icon: ShoppingBag, color: "bg-emerald-500", status: "disconnected", lastSync: null },
  { name: "WhatsApp", icon: MessageCircle, color: "bg-green-500", status: "connected", lastSync: "Just now" },
  { name: "Xero", icon: Database, color: "bg-cyan-500", status: "pending", lastSync: null },
  { name: "Cloud Backup", icon: Cloud, color: "bg-purple-500", status: "connected", lastSync: "1 hour ago" },
];

export const IntegrationsScene = ({ progress }: SceneProps) => {
  const headerIn = phaseProgress(progress, 0, 0.12);
  const gridIn = phaseProgress(progress, 0.08, 0.45);
  const connectingIn = phaseProgress(progress, 0.4, 0.65);
  const successIn = phaseProgress(progress, 0.8, 1);
  const shopifyConnecting = connectingIn > 0.3 && connectingIn < 0.8;
  const shopifyConnected = connectingIn >= 0.8;

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
      <motion.div className="p-2 border-b border-border bg-card/50" initial={{ opacity: 0, y: -10 }} animate={{ opacity: headerIn, y: 0 }}>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="p-1.5 bg-primary/10 rounded-lg"><Zap className="w-4 h-4 text-primary" /></div><div><h3 className="text-[11px] font-semibold">Integrations</h3><p className="text-[8px] text-muted-foreground">Connect tools</p></div></div><div className="flex items-center gap-1 text-[9px]"><CheckCircle className="w-3 h-3 text-emerald-500" /><span className="text-muted-foreground">4 connected</span></div></div>
      </motion.div>
      <div className="flex-1 p-2 overflow-auto">
        <div className="grid grid-cols-2 gap-1.5">{integrations.map((int, i) => {
          const itemProgress = phaseProgress(gridIn, i * 0.05, i * 0.05 + 0.2);
          const Icon = int.icon;
          const isShopify = int.name === "Shopify";
          const status = isShopify ? (shopifyConnected ? "connected" : shopifyConnecting ? "connecting" : "disconnected") : int.status;
          return (
            <motion.div key={int.name} className={`bg-card border rounded-lg p-2 ${status === "connected" ? 'border-emerald-500/30' : status === "connecting" ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: itemProgress, scale: 1 }}>
              <div className="flex items-start gap-2 mb-1.5"><div className={`w-8 h-8 rounded-lg ${int.color} flex items-center justify-center shrink-0`}><Icon className="w-4 h-4 text-white" /></div><div className="flex-1 min-w-0"><p className="text-[9px] font-semibold truncate">{int.name}</p></div></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {status === "connected" && <><CheckCircle className="w-3 h-3 text-emerald-500" /><span className="text-[7px] text-emerald-600">Connected</span></>}
                  {status === "connecting" && <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw className="w-3 h-3 text-primary" /></motion.div><span className="text-[7px] text-primary">Connecting...</span></>}
                  {status === "disconnected" && <><X className="w-3 h-3 text-muted-foreground" /><span className="text-[7px] text-muted-foreground">Not connected</span></>}
                  {status === "pending" && <><AlertCircle className="w-3 h-3 text-amber-500" /><span className="text-[7px] text-amber-600">Setup required</span></>}
                </div>
                {status === "connected" ? <Settings className="w-3 h-3 text-muted-foreground" /> : status !== "connecting" && <motion.button className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[7px] font-medium" animate={isShopify && !shopifyConnecting && !shopifyConnected ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>Connect</motion.button>}
              </div>
              {(status === "connected" || shopifyConnected) && <motion.div className="mt-1.5 pt-1.5 border-t border-border flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><RefreshCw className="w-2.5 h-2.5 text-muted-foreground" /><span className="text-[7px] text-muted-foreground">{isShopify ? "Just now" : int.lastSync}</span></motion.div>}
            </motion.div>
          );
        })}</div>
      </div>
      <AnimatePresence>{successIn > 0.3 && (<motion.div className="absolute bottom-14 left-2 right-2" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}><div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></motion.div><span className="text-[9px] text-emerald-600">Shopify connected!</span></div></motion.div>)}</AnimatePresence>
      <motion.div className="p-2 border-t border-border bg-card/50" initial={{ opacity: 0 }} animate={{ opacity: headerIn }}><div className="flex items-center justify-between text-[8px] text-muted-foreground"><span>All integrations sync in real-time</span><button className="flex items-center gap-1 text-primary">View all <ExternalLink className="w-2.5 h-2.5" /></button></div></motion.div>
    </div>
  );
};
