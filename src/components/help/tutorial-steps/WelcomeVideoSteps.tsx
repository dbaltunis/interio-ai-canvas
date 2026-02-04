/**
 * WelcomeVideoSteps - 8-Scene Cinematic Product Showcase
 * IMPROVED: Larger fonts, realistic names, focus highlights, Scene 3 fixed
 * UPDATED: Added Scene0Welcome and Scene7Calendar
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sun, Plus, ChevronRight, ChevronDown, Check, Trash2,
  Share2, FileText, Users, Home, Bed, ChefHat, Bath, MoreHorizontal,
  MessageSquare, Receipt, Layers, Eye, X, Clock, Phone, Globe,
  ShoppingBag, Package, UserPlus, Copy, ExternalLink, CalendarDays,
  DollarSign, Calendar, Lightbulb, Settings, Ruler, Scissors, Mail,
  CreditCard, Download, Send, CheckCircle2, Wrench, ClipboardList, Sparkles,
  Link, QrCode, Smartphone, Camera, Search, FolderOpen, Grid, ScanLine, Tag, Star
} from "lucide-react";
import { inPhase, phaseProgress, typingProgress } from "@/lib/demoAnimations";
import { DemoCursor } from "@/components/help/DemoCursor";

interface StepProps {
  phase?: number;
}

// Focus highlight ring - pulsing effect before clicking
const FocusRing = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute inset-0 rounded-lg ring-2 ring-primary/60"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 1, 0.4] }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    )}
  </AnimatePresence>
);

// SCENE 0: WELCOME GREETING - New warm opening scene
export const Scene0Welcome = ({ phase = 0 }: StepProps) => {
  const showWave = inPhase(phase, 0.1, 1);
  const showWelcome = inPhase(phase, 0.2, 1);
  const showApp = inPhase(phase, 0.35, 1);
  const showSubtitle = inPhase(phase, 0.5, 1);
  const showHint = inPhase(phase, 0.75, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      {/* Pulsing background gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.08) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.15) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.08) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Wave emoji with bounce */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ 
          opacity: showWave ? 1 : 0, 
          scale: showWave ? 1 : 0.5,
          rotate: showWave ? [0, 15, -10, 15, 0] : -20
        }}
        transition={{ 
          duration: 0.6, 
          rotate: { duration: 1.2, ease: "easeInOut" }
        }}
        className="text-6xl mb-6"
      >
        👋
      </motion.div>
      
      {/* Welcome text */}
      <div className="relative z-10">
        <motion.h1
          className="text-2xl md:text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showWelcome ? 1 : 0, y: showWelcome ? 0 : 20 }}
        >
          Welcome to{" "}
          <motion.span
            className="text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: showApp ? 1 : 0 }}
          >
            InterioApp!
          </motion.span>
        </motion.h1>
        
        <motion.p
          className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: showSubtitle ? 1 : 0, y: showSubtitle ? 0 : 15 }}
        >
          Let's show you around your new platform
        </motion.p>
      </div>
      
      {/* Continue hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: showHint ? 0.7 : 0 }}
      >
        <span>Press</span>
        <kbd className="px-2 py-0.5 rounded bg-muted border text-[10px] font-mono">→</kbd>
        <span>or wait to continue</span>
      </motion.div>
    </div>
  );
};

// SCENE 1: OPENING BRANDING
export const Scene1IntroLogo = ({ phase = 0 }: StepProps) => {
  const showLogo = inPhase(phase, 0, 1);
  const showHeadline = inPhase(phase, 0.2, 1);
  const showSubtitle = inPhase(phase, 0.4, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 60%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 40%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.8 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ margin: "-20px" }}
        />
        <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="InterioApp" className="h-20 w-auto relative z-10" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: showHeadline ? 1 : 0, y: showHeadline ? 0 : 30 }}
        className="text-2xl md:text-3xl font-bold mb-4"
      >
        Sell <span className="text-primary">blinds</span> and <span className="text-primary">curtains</span>
        <br />online and in-store
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showSubtitle ? 1 : 0, y: showSubtitle ? 0 : 20 }}
        className="text-muted-foreground max-w-md text-sm md:text-base"
      >
        InterioApp is an online store and quoting platform for made-to-measure blinds and curtains.
      </motion.p>
    </div>
  );
};

// SCENE 2: DASHBOARD - Scrolls content once to reveal Shopify section
export const Scene2Dashboard = ({ phase = 0 }: StepProps) => {
  // Phase 0-0.4: Show full dashboard with charts animating
  // Phase 0.4-0.8: Scroll down and zoom to Shopify section (single smooth animation)
  const scrollProgress = phaseProgress(phase, 0.35, 0.6);
  const zoomToShopify = inPhase(phase, 0.55, 0.95);
  const chartProgress = phaseProgress(phase, 0.1, 0.35);
  const donutProgress = phaseProgress(phase, 0.15, 0.4);
  
  // Scroll the inner content (negative Y moves content up, revealing bottom)
  const contentScrollY = scrollProgress * -120; // pixels to scroll
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Fixed Header - stays in place */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-3 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="IA" className="h-6 w-auto" />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Messages", "Calendar"].map((nav, i) => (
              <span key={nav} className={`text-xs ${i === 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>{nav}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
        <motion.div 
          className="p-3 space-y-3"
          animate={{ 
            y: contentScrollY,
            scale: zoomToShopify ? 1.3 : 1,
            x: zoomToShopify ? "15%" : "0%",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ transformOrigin: "bottom center" }}
        >
          {/* Welcome with icons on the right */}
          <div className="px-2 py-2 border-b border-border bg-card/50 rounded-lg flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Good afternoon, John</h2>
              <p className="text-sm text-muted-foreground">24 pending quotes • 156 clients</p>
            </div>
            <div className="flex items-center gap-1">
              {[Users, Lightbulb, Sun, Settings].map((Icon, i) => (
                <div key={i} className="w-4 h-4 rounded flex items-center justify-center">
                  <Icon className={`h-2.5 w-2.5 ${i === 1 ? "text-amber-500" : "text-muted-foreground"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Revenue", value: "£59,872", icon: DollarSign, bg: "bg-primary/5" },
              { label: "Projects", value: "138", icon: Calendar, bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Quotes", value: "177", icon: Receipt, bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Clients", value: "19", icon: Users, bg: "bg-purple-50 dark:bg-purple-900/20" },
            ].map((stat) => (
              <div key={stat.label} className={`p-3 ${stat.bg} rounded-lg border border-border`}>
                <stat.icon className="h-4 w-4 text-primary mb-1" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Revenue Trend</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">-54.9%</span>
              </div>
              <svg className="w-full h-16" viewBox="0 0 100 32">
                <motion.path d="M 12 8 Q 25 12, 40 18 T 65 22 T 88 25 T 100 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: chartProgress }} />
              </svg>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="text-sm font-medium mb-2">Jobs by Status</div>
              <div className="flex items-center gap-3">
                <svg className="w-16 h-16" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="3" />
                  <motion.circle cx="18" cy="18" r="12" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeDasharray={`${donutProgress * 45} 100`} transform="rotate(-90 18 18)" />
                </svg>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#9CA3AF]" /><span>Draft (97)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /><span>Approved (5)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Shopify - This is what we scroll to and zoom */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 rounded-lg border border-green-200">
              <div className="flex items-center gap-1.5 mb-2"><ShoppingBag className="h-4 w-4 text-green-600" /><span className="text-xs font-semibold text-green-700">Shopify Sales</span><span className="ml-auto text-[9px] px-1.5 py-0.5 bg-green-500 text-white rounded animate-pulse">Live</span></div>
              <div className="text-xl font-bold text-green-600 text-center">£5,000</div>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-1.5 mb-2"><Users className="h-4 w-4 text-purple-500" /><span className="text-xs font-medium">Clients</span></div>
              <div className="text-lg font-bold">156</div>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-1.5 mb-2"><DollarSign className="h-4 w-4 text-primary" /><span className="text-xs font-medium">Revenue</span></div>
              <div className="text-lg font-bold">£59,872</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// SCENE 3: THEME TOGGLE - Same dashboard as Scene 2, just toggles theme
export const Scene3ThemeToggle = ({ phase = 0 }: StepProps) => {
  const isDarkMode = inPhase(phase, 0.4, 0.8);
  const focusOnToggle = inPhase(phase, 0.32, 0.42) || inPhase(phase, 0.72, 0.82);
  const isClicking = inPhase(phase, 0.38, 0.42) || inPhase(phase, 0.76, 0.80);
  
  // Dark/light mode colors
  const bgColor = isDarkMode ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)";
  const cardBg = isDarkMode ? "hsl(222.2 47.4% 11.2%)" : "hsl(0 0% 100%)";
  const borderColor = isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)";
  const textColor = isDarkMode ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)";
  const mutedColor = isDarkMode ? "hsl(215 20.2% 65.1%)" : "hsl(215.4 16.3% 46.9%)";
  
  return (
    <motion.div className="h-full w-full rounded-xl overflow-hidden border border-border relative" animate={{ backgroundColor: bgColor }}>
      {/* Header */}
      <motion.div className="h-12 border-b flex items-center px-3" animate={{ borderColor, backgroundColor: cardBg }}>
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="IA" className="h-6 w-auto" />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Messages", "Calendar"].map((nav, i) => (
              <motion.span key={nav} className={`text-xs ${i === 0 ? "font-semibold" : ""}`} animate={{ color: i === 0 ? "hsl(var(--primary))" : mutedColor }}>{nav}</motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content - Matches Scene 2 exactly */}
      <motion.div className="p-3 space-y-3" animate={{ backgroundColor: bgColor }}>
        {/* Welcome with icons */}
        <motion.div className="px-2 py-2 rounded-lg flex items-center justify-between" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
          <div>
            <motion.h2 className="text-base font-semibold" animate={{ color: textColor }}>Good afternoon, John</motion.h2>
            <motion.p className="text-sm" animate={{ color: mutedColor }}>24 pending quotes • 156 clients</motion.p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded flex items-center justify-center"><Users className="h-2.5 w-2.5 text-muted-foreground" /></div>
            <div className="w-4 h-4 rounded flex items-center justify-center"><Lightbulb className="h-2.5 w-2.5 text-amber-500" /></div>
            <motion.div className="w-4 h-4 rounded flex items-center justify-center relative" animate={{ scale: isClicking ? 0.9 : 1 }}>
              <FocusRing active={focusOnToggle} />
              <AnimatePresence mode="wait">
                {isDarkMode ? <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><Moon className="h-2.5 w-2.5 text-blue-400" /></motion.div> : <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sun className="h-2.5 w-2.5 text-amber-500" /></motion.div>}
              </AnimatePresence>
            </motion.div>
            <div className="w-4 h-4 rounded flex items-center justify-center"><Settings className="h-2.5 w-2.5 text-muted-foreground" /></div>
          </div>
        </motion.div>

        {/* Stats - Same as Scene 2 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Revenue", value: "£59,872" },
            { label: "Projects", value: "138" },
            { label: "Quotes", value: "177" },
            { label: "Clients", value: "19" },
          ].map((stat) => (
            <motion.div key={stat.label} className="p-2 rounded-lg" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
              <motion.div className="text-lg font-bold" animate={{ color: textColor }}>{stat.value}</motion.div>
              <motion.div className="text-xs" animate={{ color: mutedColor }}>{stat.label}</motion.div>
            </motion.div>
          ))}
        </div>

        {/* Charts - Same as Scene 2 */}
        <div className="grid grid-cols-2 gap-2">
          <motion.div className="p-3 rounded-lg" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
            <div className="flex items-center justify-between mb-2">
              <motion.span className="text-sm font-medium" animate={{ color: textColor }}>Revenue Trend</motion.span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">-54.9%</span>
            </div>
            <svg className="w-full h-12" viewBox="0 0 100 32">
              <path d="M 12 8 Q 25 12, 40 18 T 65 22 T 88 25 T 100 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>
          </motion.div>
          <motion.div className="p-3 rounded-lg" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
            <motion.div className="text-sm font-medium mb-2" animate={{ color: textColor }}>Jobs by Status</motion.div>
            <div className="flex items-center gap-3">
              <svg className="w-12 h-12" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="10" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="3" />
                <circle cx="18" cy="18" r="10" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeDasharray="35 100" transform="rotate(-90 18 18)" />
              </svg>
              <motion.div className="text-xs space-y-1" animate={{ color: mutedColor }}>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#9CA3AF]" /><span>Draft (97)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /><span>Approved (5)</span></div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Shopify section - Same as Scene 2 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 mb-1"><ShoppingBag className="h-3 w-3 text-green-600" /><span className="text-[10px] font-semibold text-green-700">Shopify Sales</span><span className="ml-auto text-[8px] px-1 py-0.5 bg-green-500 text-white rounded">Live</span></div>
            <div className="text-base font-bold text-green-600 text-center">£5,000</div>
          </div>
          <motion.div className="p-2 rounded-lg" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
            <div className="flex items-center gap-1 mb-1"><Users className="h-3 w-3 text-purple-500" /><motion.span className="text-[10px] font-medium" animate={{ color: textColor }}>Clients</motion.span></div>
            <motion.div className="text-base font-bold" animate={{ color: textColor }}>156</motion.div>
          </motion.div>
          <motion.div className="p-2 rounded-lg" animate={{ backgroundColor: cardBg, borderColor }} style={{ border: '1px solid' }}>
            <div className="flex items-center gap-1 mb-1"><DollarSign className="h-3 w-3 text-primary" /><motion.span className="text-[10px] font-medium" animate={{ color: textColor }}>Revenue</motion.span></div>
            <motion.div className="text-base font-bold" animate={{ color: textColor }}>£59,872</motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mode indicator */}
      <motion.div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium" animate={{ backgroundColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)", color: textColor }}>{isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</motion.div>
    </motion.div>
  );
};

// SCENE 4: JOBS & NOTES - With team members and full nav
export const Scene4JobsNotes = ({ phase = 0 }: StepProps) => {
  const showJobsList = inPhase(phase, 0.1, 1);
  const focusOnAction = inPhase(phase, 0.20, 0.40); // Doubled duration
  const showActionMenu = inPhase(phase, 0.40, 0.55);
  const showNoteDialog = inPhase(phase, 0.5, 0.95);
  const noteText = typingProgress(phase, 0.55, 0.8, "Measurements confirmed ✓ @Marcus please order fabrics");
  const showSuccess = inPhase(phase, 0.88, 1);
  
  const jobs = [
    { id: "JOB-001", client: "Smith Family", status: "In Progress", amount: "£2,450", color: "bg-blue-500", team: { name: "John", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" } },
    { id: "JOB-002", client: "Riverside Hotel", status: "Quote Sent", amount: "£8,900", color: "bg-amber-500", team: { name: "Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lee" } },
    { id: "JOB-003", client: "Jane Cooper", status: "Completed", amount: "£1,850", color: "bg-green-500", team: { name: "Rachel", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel" } },
    { id: "JOB-004", client: "Morrison Estate", status: "In Progress", amount: "£4,200", color: "bg-blue-500", team: { name: "John", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" } },
    { id: "JOB-005", client: "The Grand Hotel", status: "Quote Sent", amount: "£12,500", color: "bg-amber-500", team: { name: "Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lee" } },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Header with full nav */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="IA" className="h-6 w-auto" />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Messages", "Calendar"].map((nav, i) => (
              <span key={nav} className={`text-xs ${nav === "Jobs" ? "font-semibold text-primary" : "text-muted-foreground"}`}>{nav}</span>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium"><Plus className="h-3 w-3" />New Job</button>
      </div>
      
      <div className="px-3 py-2 border-b border-border"><h2 className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Jobs</h2></div>
      
      <div className="p-2">
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {/* Header row */}
          <div className="grid grid-cols-6 gap-1 px-3 py-1.5 bg-muted/50 text-[10px] font-medium text-muted-foreground uppercase">
            <span>Job #</span>
            <span>Client</span>
            <span>Team</span>
            <span>Status</span>
            <span>Amount</span>
            <span></span>
          </div>
          
          {/* Job rows */}
          {jobs.map((job, i) => (
            <motion.div 
              key={job.id} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: showJobsList ? 1 : 0 }} 
              className={`grid grid-cols-6 gap-1 px-3 py-2 border-t border-border items-center ${i === 0 ? "bg-primary/5" : ""}`}
            >
              <span className="text-xs font-medium text-primary">{job.id}</span>
              <span className="text-xs truncate">{job.client}</span>
              <div className="flex items-center gap-1.5">
                <img src={job.team.avatar} alt={job.team.name} className="w-5 h-5 rounded-full bg-muted" />
                <span className="text-xs truncate">{job.team.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${job.color}`} />
                <span className="text-[10px]">{job.status}</span>
              </div>
              <span className="text-xs font-semibold">{job.amount}</span>
              
              {/* Action button - only on first row */}
              <div className="justify-self-end">
                {i === 0 ? (
                  <div className="relative">
                    <motion.div 
                      className="w-6 h-6 rounded flex items-center justify-center bg-muted relative" 
                      animate={{ backgroundColor: showActionMenu ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))" }}
                    >
                      {focusOnAction && !showActionMenu && (
                        <motion.div
                          className="absolute inset-0 rounded ring-2 ring-primary/60"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}
                      <MoreHorizontal className="h-3 w-3" />
                    </motion.div>
                    <AnimatePresence>
                      {showActionMenu && !showNoteDialog && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-7 w-36 bg-popover border border-border rounded-lg shadow-lg z-20 py-1">
                          {[{ label: "View Job", icon: Eye }, { label: "Write Note", icon: MessageSquare, highlight: true }, { label: "Duplicate", icon: Copy }].map((item) => (
                            <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer ${item.highlight ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}><item.icon className="h-3 w-3" /><span>{item.label}</span></div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-muted opacity-50">
                    <MoreHorizontal className="h-3 w-3" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Note Dialog */}
      <AnimatePresence>
        {showNoteDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-background rounded-xl border border-border shadow-xl w-full max-w-xs">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Write Note</span></div><X className="h-4 w-4 text-muted-foreground" /></div>
              <div className="p-3 space-y-2">
                <div className="text-xs text-muted-foreground">JOB-001 • Smith Family</div>
                <div className="min-h-[60px] p-2 bg-muted/50 rounded-lg border border-border text-xs">{noteText}{inPhase(phase, 0.55, 0.8) && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-4 bg-primary ml-0.5" />}</div>
                {noteText.includes("@Marcus") && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200"><UserPlus className="h-3 w-3 text-blue-500" /><span className="text-xs text-blue-600">Mentioning: Marcus (Team)</span></motion.div>}
                <motion.button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2" animate={{ backgroundColor: showSuccess ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--primary))" }}>{showSuccess ? <><Check className="h-4 w-4" />Saved!</> : "Save Note"}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// SCENE 5: PROJECT DEEP DIVE - With Window Creation Workflow
export const Scene5ProjectDeepDive = ({ phase = 0 }: StepProps) => {
  // Restructured phases to include window creation workflow
  const showClientTab = inPhase(phase, 0, 0.08);
  const showProjectTab = inPhase(phase, 0.08, 0.18);
  const focusAddWindow = inPhase(phase, 0.14, 0.18);
  
  // Window Creation Popup phases (34% of scene)
  const showWindowPopup = inPhase(phase, 0.18, 0.52);
  const showTreatmentStep = inPhase(phase, 0.20, 0.36);
  const selectCurtains = inPhase(phase, 0.30, 0.36);
  const showLibraryStep = inPhase(phase, 0.36, 0.46);
  const selectFabric = inPhase(phase, 0.40, 0.46);
  const showMeasurementsStep = inPhase(phase, 0.46, 0.52);
  const widthValue = typingProgress(phase, 0.48, 0.50, "200");
  const dropValue = typingProgress(phase, 0.50, 0.52, "240");
  
  // Quote and remaining tabs
  const showQuoteTab = inPhase(phase, 0.52, 0.70);
  const showWorkroomTab = inPhase(phase, 0.70, 0.82);
  const showInstallationTab = inPhase(phase, 0.82, 0.92);
  const focusOnShare = inPhase(phase, 0.88, 0.92);
  const showSharePopover = inPhase(phase, 0.92, 1);
  
  // Determine stepper status
  const getTreatmentStatus = () => {
    if (phase >= 0.36) return "complete";
    if (phase >= 0.20) return "active";
    return "pending";
  };
  const getLibraryStatus = () => {
    if (phase >= 0.46) return "complete";
    if (phase >= 0.36) return "active";
    return "pending";
  };
  const getMeasurementsStatus = () => {
    if (phase >= 0.52) return "complete";
    if (phase >= 0.46) return "active";
    return "pending";
  };
  
  const activeTab = showInstallationTab || showSharePopover ? "installation" : showWorkroomTab ? "workroom" : showQuoteTab ? "quote" : (showProjectTab || showWindowPopup) ? "project" : "client";
  
  const tabs = [{ id: "client", label: "Client", icon: Users }, { id: "project", label: "Project", icon: Layers }, { id: "quote", label: "Quote", icon: Receipt }, { id: "workroom", label: "Workroom", icon: FileText }, { id: "installation", label: "Install", icon: Wrench }];
  
  // Treatment cards data
  const treatments = [
    { id: "curtains", name: "Curtains", selected: selectCurtains },
    { id: "blinds", name: "Roller Blinds", selected: false },
    { id: "shutters", name: "Shutters", selected: false },
  ];
  
  // Fabric cards data
  const fabrics = [
    { id: "adara", name: "ADARA", price: "£26.50/m", width: "290cm", selected: selectFabric },
    { id: "velvet", name: "Velvet Drapery", price: "£45.00/m", width: "140cm", selected: false },
    { id: "linen", name: "Pure Linen", price: "£38.00/m", width: "300cm", selected: false },
    { id: "silk", name: "Silk Blend", price: "£65.00/m", width: "140cm", selected: false },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      <div className="h-11 border-b border-border bg-card flex items-center px-3 gap-2">
        <span className="text-sm text-muted-foreground">Jobs</span><ChevronRight className="h-4 w-4 text-muted-foreground" /><span className="text-base font-semibold">JOB-065</span>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs font-medium text-blue-700">In Progress</span></div>
      </div>
      <div className="flex border-b border-border bg-muted/20">
        {tabs.map((tab) => (
          <button key={tab.id} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><tab.icon className="h-4 w-4" />{tab.label}</button>
        ))}
      </div>
      <div className="p-3 relative overflow-y-auto" style={{ height: 'calc(100% - 92px)' }}>
        <AnimatePresence mode="wait">
          {showClientTab && (
            <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-4 bg-card rounded-lg border border-border flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-lg font-bold text-primary">SF</span></div>
                <div><div className="text-base font-semibold">Smith Family</div><div className="text-sm text-muted-foreground">smith@example.com</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-card rounded-lg border text-center"><div className="text-2xl font-bold">3</div><div className="text-sm text-muted-foreground">Rooms</div></div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 text-center"><div className="text-2xl font-bold text-green-600">£2,450</div><div className="text-sm text-green-600">Total</div></div>
              </div>
            </motion.div>
          )}
          {(showProjectTab || showWindowPopup) && (
            <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {/* Rooms list */}
              {[{ room: "Master Bedroom", amount: "£2,200", icon: Bed, windows: 2 }, { room: "Living Room", amount: "£1,450", icon: Home, windows: 1 }].map((item, i) => (
                <div key={item.room} className="bg-card rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><item.icon className="h-5 w-5 text-muted-foreground" /></div>
                      <div>
                        <span className="text-sm font-medium">{item.room}</span>
                        <div className="text-xs text-muted-foreground">{item.windows} windows</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">{item.amount}</span>
                  </div>
                  {i === 0 && (
                    <motion.button 
                      className="w-full py-2 mt-2 rounded-lg border-2 border-dashed border-primary/30 text-xs font-medium text-primary flex items-center justify-center gap-1.5 relative"
                      animate={{ backgroundColor: focusAddWindow ? "hsl(var(--primary)/0.05)" : "transparent" }}
                    >
                      {focusAddWindow && (
                        <motion.div
                          className="absolute inset-0 rounded-lg ring-2 ring-primary/60"
                          animate={{ scale: [1, 1.02, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}
                      <Plus className="h-3.5 w-3.5" />Add Window
                    </motion.button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
          {showQuoteTab && (
            <motion.div key="quote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative">
              <div className="flex items-center justify-between mb-3 p-3 bg-card rounded-lg border">
                <span className="text-sm font-medium">Quotation</span>
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-muted rounded border"><Download className="h-3.5 w-3.5" />PDF</button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-muted rounded border"><Mail className="h-3.5 w-3.5" />Email</button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded"><CreditCard className="h-3.5 w-3.5" />Payment</button>
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg border shadow-sm">
                <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-start justify-between">
                  <div><img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="Logo" className="h-6 w-auto mb-2" /><div className="text-xs text-muted-foreground">Demo Interiors Ltd</div></div>
                  <div className="text-right"><div className="text-base font-bold text-primary">Quotation</div><div className="text-sm text-muted-foreground"># QUOTE-001</div></div>
                </div>
                <div className="p-3 border-b bg-muted/30"><div className="text-xs font-medium text-muted-foreground uppercase mb-1">👤 Bill To</div><div className="text-sm font-medium">Smith Family</div></div>
                <div className="divide-y">
                  {/* New line item from window creation */}
                  <motion.div 
                    className="p-3 flex items-start gap-3 bg-green-50/50 dark:bg-green-900/10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="w-11 h-11 rounded bg-green-100 flex items-center justify-center"><Check className="h-5 w-5 text-green-500" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium flex items-center gap-2">S-Fold Curtains <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded">NEW</span></div>
                      <div className="text-xs text-muted-foreground">ADARA • 2000×2400mm</div>
                    </div>
                    <div className="text-sm font-semibold">£1,450</div>
                  </motion.div>
                  <div className="p-3 flex items-start gap-3"><div className="w-11 h-11 rounded bg-indigo-100 flex items-center justify-center"><Scissors className="h-5 w-5 text-indigo-400" /></div><div className="flex-1"><div className="text-sm font-medium">Lined Curtains</div><div className="text-xs text-muted-foreground">1800×2000mm</div></div><div className="text-sm font-semibold">£1,200</div></div>
                  <div className="p-3 flex items-start gap-3"><div className="w-11 h-11 rounded bg-gray-100 flex items-center justify-center"><Ruler className="h-5 w-5 text-gray-400" /></div><div className="flex-1"><div className="text-sm font-medium">Curtain Track</div><div className="text-xs text-muted-foreground">2400mm</div></div><div className="text-sm font-semibold">£250</div></div>
                </div>
                <div className="p-3 bg-muted/30 border-t"><div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">£2,900</span></div></div>
              </div>
            </motion.div>
          )}
          {showWorkroomTab && (
            <motion.div key="workroom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted rounded border"><FileText className="h-3.5 w-3.5" />Workshop Details<ChevronDown className="h-3 w-3" /></button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded"><Share2 className="h-3.5 w-3.5" />Shared<span className="px-1.5 py-0.5 bg-primary-foreground/20 rounded text-[10px]">1</span></button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted rounded border"><Download className="h-3.5 w-3.5" />PDF</button>
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg border shadow-sm overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
                <motion.div 
                  className="h-full"
                  animate={{ y: [0, -100, -100, 0] }}
                  transition={{ duration: 3, times: [0, 0.4, 0.8, 1], ease: "easeInOut" }}
                >
                  <div className="p-3 border-b">
                    <div className="text-lg font-bold">WORK ORDER</div>
                    <div className="text-xs text-muted-foreground">Manufacturing Instructions</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-3 border-b text-[10px]">
                    <div><div className="text-muted-foreground uppercase">Project</div><div className="font-medium">Smith Family</div></div>
                    <div><div className="text-muted-foreground uppercase">Order #</div><div className="font-medium">JOB-065</div></div>
                    <div><div className="text-muted-foreground uppercase">Client</div><div className="font-medium">Smith</div></div>
                    <div><div className="text-muted-foreground uppercase">Due Date</div><div className="font-medium">—</div></div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border-b">
                    <span className="text-sm font-semibold text-primary">Master Bedroom</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 px-3 py-1.5 text-[9px] font-medium text-muted-foreground uppercase bg-muted/30 border-b">
                    <span>Item</span><span>Fabric</span><span>Measurements</span><span>Details</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 px-3 py-2 text-[10px] border-b">
                    <div className="font-medium">Window 1</div>
                    <div><div className="text-primary font-medium">ADARA</div><div className="text-muted-foreground">290cm width</div></div>
                    <div><div><span className="font-medium">W:</span> 200cm</div><div><span className="font-medium">D:</span> 240cm</div></div>
                    <div><div className="text-primary">S-Fold 2.2x</div><div className="text-muted-foreground">Blackout lining</div></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          {(showInstallationTab || showSharePopover) && (
            <motion.div key="installation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <div className="flex items-center justify-between mb-3 p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /><span className="text-sm font-medium">Installation</span></div>
                <div className="relative">
                  <motion.button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted rounded border relative" animate={{ backgroundColor: showSharePopover ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))" }}><FocusRing active={focusOnShare} /><Share2 className="h-4 w-4" />Share</motion.button>
                  <AnimatePresence>{showSharePopover && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-lg shadow-xl z-30 p-3"><div className="text-sm font-medium mb-2">Share with Team</div><div className="p-3 bg-muted/50 rounded-lg mb-2"><div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium">ABC Workroom</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></div><div className="flex items-center gap-1.5"><span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Work Order</span></div></div><button className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed rounded-lg text-sm text-muted-foreground"><Plus className="h-4 w-4" />New Share Link</button></motion.div>}</AnimatePresence>
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg border shadow-sm">
                <div className="p-3 border-b bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20"><div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-green-600" /><span className="text-base font-bold text-green-700">INSTALLATION GUIDE</span></div></div>
                <div className="p-3"><div className="text-xs font-medium text-muted-foreground uppercase mb-2">Checklist</div>{["Site access confirmed", "Materials checked", "Installer: Marcus"].map((item, i) => (<div key={i} className="flex items-center gap-2 text-sm mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span>{item}</span></div>))}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Window Creation Popup Overlay */}
      <AnimatePresence>
        {showWindowPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-2"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background w-full h-full rounded-xl border shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header: Design | Treatment | Description */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-card">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm">Design: <strong>Window 1</strong></span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="text-sm text-muted-foreground">
                  Treatment: <strong className="text-foreground">{selectCurtains ? "Curtains" : "—"}</strong>
                </div>
                <div className="ml-auto">
                  <X className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center justify-center gap-2 py-3 px-4 border-b bg-muted/20">
                {/* Window Selected - always complete */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  <Check className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Window Selected</span>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                
                {/* Treatment */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  getTreatmentStatus() === "complete" ? "bg-green-100 text-green-700" :
                  getTreatmentStatus() === "active" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {getTreatmentStatus() === "complete" ? <Check className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
                  <span className="text-[10px] font-medium">Treatment</span>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                
                {/* Library */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  getLibraryStatus() === "complete" ? "bg-green-100 text-green-700" :
                  getLibraryStatus() === "active" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {getLibraryStatus() === "complete" ? <Check className="h-3 w-3" /> : <Grid className="h-3 w-3" />}
                  <span className="text-[10px] font-medium">Library</span>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                
                {/* Measurements */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  getMeasurementsStatus() === "complete" ? "bg-green-100 text-green-700" :
                  getMeasurementsStatus() === "active" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {getMeasurementsStatus() === "complete" ? <Check className="h-3 w-3" /> : <Ruler className="h-3 w-3" />}
                  <span className="text-[10px] font-medium">Measurements</span>
                </div>
              </div>
              
              {/* Step Content */}
              <div className="flex-1 overflow-hidden p-4">
                <AnimatePresence mode="wait">
                  {/* Treatment Step */}
                  {showTreatmentStep && (
                    <motion.div 
                      key="treatment"
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <div className="mb-3">
                        <div className="text-sm font-semibold mb-1">Select Treatment Type</div>
                        <div className="text-xs text-muted-foreground">Choose the type of window treatment</div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {treatments.map((treatment, i) => (
                          <motion.div
                            key={treatment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              treatment.selected 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="w-full aspect-square rounded bg-muted mb-2 flex items-center justify-center">
                              <Layers className={`h-8 w-8 ${treatment.selected ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-medium ${treatment.selected ? "text-primary" : ""}`}>{treatment.name}</div>
                            </div>
                            {treatment.selected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Library Step */}
                  {showLibraryStep && (
                    <motion.div 
                      key="library"
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <div className="mb-3">
                        <div className="text-sm font-semibold mb-1">Select Fabric</div>
                        <div className="text-xs text-muted-foreground">Browse your fabric library</div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary font-medium">Blockout</span>
                        <span className="px-2 py-1 text-[10px] rounded-full bg-muted text-muted-foreground">Light Filter</span>
                        <span className="px-2 py-1 text-[10px] rounded-full bg-muted text-muted-foreground">Wide (300cm+)</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {fabrics.map((fabric, i) => (
                          <motion.div
                            key={fabric.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`p-2 rounded-lg border-2 cursor-pointer transition-all relative ${
                              fabric.selected 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="absolute top-1.5 left-1.5">
                              <Star className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-100 to-amber-200 mb-1.5" />
                            <div className="text-[11px] font-medium truncate">{fabric.name}</div>
                            <div className="text-[10px] text-muted-foreground">{fabric.width}</div>
                            <div className="text-[10px] text-primary font-semibold">{fabric.price}</div>
                            {fabric.selected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Measurements Step */}
                  {showMeasurementsStep && (
                    <motion.div 
                      key="measurements"
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <div className="mb-3">
                        <div className="text-sm font-semibold mb-1">Window Measurements</div>
                        <div className="text-xs text-muted-foreground">Enter dimensions and options</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Curtain Diagram */}
                        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center">
                          <div className="relative">
                            {/* Simple curtain visualization */}
                            <div className="w-32 h-40 border-2 border-dashed border-primary/40 rounded relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-primary font-medium px-1 bg-background">Rail Width</div>
                              <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-[10px] text-primary font-medium rotate-90">Drop</div>
                              {/* Curtain shapes */}
                              <div className="absolute inset-2 flex">
                                <div className="flex-1 bg-primary/10 rounded-t border-t-4 border-primary/30" />
                                <div className="flex-1 bg-primary/10 rounded-t border-t-4 border-primary/30 ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Form */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase mb-1 block">Rail Width</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-9 px-3 border rounded-lg bg-background flex items-center text-sm">
                                {widthValue}
                                {widthValue && widthValue.length < 3 && (
                                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-0.5 h-4 bg-primary ml-0.5" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">cm</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase mb-1 block">Curtain Drop</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-9 px-3 border rounded-lg bg-background flex items-center text-sm">
                                {dropValue}
                                {widthValue.length >= 3 && dropValue.length < 3 && (
                                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-0.5 h-4 bg-primary ml-0.5" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">cm</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase mb-1 block">Heading Type</label>
                            <div className="h-9 px-3 border rounded-lg bg-background flex items-center justify-between text-sm">
                              <span>S-Fold 2.2x</span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase mb-1 block">Lining</label>
                            <div className="h-9 px-3 border rounded-lg bg-background flex items-center justify-between text-sm">
                              <span>Blockout</span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Save button */}
                      <div className="mt-4 flex justify-end">
                        <motion.button 
                          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
                          animate={{ scale: phase >= 0.51 ? [1, 0.95, 1] : 1 }}
                        >
                          <Check className="h-4 w-4" />
                          Save Window
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// SCENE 6: CLOSING
export const Scene6Closing = ({ phase = 0 }: StepProps) => {
  const showLogo = inPhase(phase, 0.1, 1);
  const showMessage = inPhase(phase, 0.3, 1);
  const showCTA = inPhase(phase, 0.5, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      <motion.div className="absolute inset-0 opacity-30" animate={{ background: ["radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.2) 0%, transparent 60%)", "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.3) 0%, transparent 60%)", "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.2) 0%, transparent 60%)"] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.9 }} className="mb-6"><img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="InterioApp" className="h-16 w-auto" /></motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: showMessage ? 1 : 0, y: showMessage ? 0 : 20 }} className="mb-8"><h2 className="text-xl font-bold mb-2">Ready to get started?</h2><p className="text-sm text-muted-foreground max-w-sm">Your complete platform for made-to-measure window treatments</p></motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: showCTA ? 1 : 0 }} className="flex flex-wrap justify-center gap-2 max-w-xs">{["Quote Builder", "Team Notes", "Work Orders", "Payments", "Installation", "Bookings"].map((feature, i) => (<motion.span key={feature} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full font-medium">{feature}</motion.span>))}</motion.div>
    </div>
  );
};

// SCENE 7: CALENDAR & BOOKINGS - Google Calendar sync and booking system
export const Scene7Calendar = ({ phase = 0 }: StepProps) => {
  // Phase breakdown:
  // 0.00-0.20: Calendar week view with Google sync badge
  // 0.20-0.40: Booking template list + dropdown showing multiple types
  // 0.40-0.55: Template form + Share link copied
  // 0.55-0.80: Public booking page (split panel, date/time selection, form)
  // 0.80-1.00: Success confirmation with confetti
  
  const showCalendarView = inPhase(phase, 0, 0.20);
  const showTemplateSetup = inPhase(phase, 0.20, 0.55);
  const showBookingPage = inPhase(phase, 0.55, 0.80);
  const showSuccess = inPhase(phase, 0.80, 1);
  
  const templateDropdown = inPhase(phase, 0.22, 0.32);
  const templateForm = inPhase(phase, 0.32, 0.45);
  const showShareLink = inPhase(phase, 0.45, 0.55);
  const linkCopied = inPhase(phase, 0.50, 0.55);
  
  const dateSelection = phaseProgress(phase, 0.57, 0.63);
  const timeSelection = inPhase(phase, 0.63, 0.68);
  const formFilling = inPhase(phase, 0.68, 0.78);
  const clientName = typingProgress(phase, 0.69, 0.73, "Holly Watson");
  const clientEmail = typingProgress(phase, 0.73, 0.77, "holly@email.com");
  const confirmClick = inPhase(phase, 0.78, 0.80);
  
  // Calendar events for week view
  const events = [
    { day: 1, time: "09:00", title: "Blind Install", color: "bg-blue-500", duration: "1h" },
    { day: 2, time: "10:30", title: "Design Session", color: "bg-green-500", duration: "30m" },
    { day: 3, time: "14:00", title: "Curtain Measure", color: "bg-purple-500", duration: "1h" },
    { day: 4, time: "11:00", title: "Client Consult", color: "bg-amber-500", duration: "45m" },
  ];
  
  // Template types for dropdown
  const templateTypes = [
    { name: "Design Consultation", icon: Scissors, duration: "30 min", selected: true },
    { name: "Installation Appointment", icon: Wrench, duration: "60 min", selected: false },
    { name: "Measurement Session", icon: Ruler, duration: "45 min", selected: false },
  ];
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00"];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Header */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="IA" className="h-6 w-auto" />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Messages", "Calendar"].map((nav) => (
              <span key={nav} className={`text-xs ${nav === "Calendar" ? "font-semibold text-primary" : "text-muted-foreground"}`}>{nav}</span>
            ))}
          </div>
        </div>
        {/* Google Sync Badge */}
        <motion.div 
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs"
          animate={{ opacity: showCalendarView || showTemplateSetup ? 1 : 0.5 }}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-medium">Google Sync</span>
        </motion.div>
      </div>
      
      <div className="p-3 h-[calc(100%-48px)] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Phase 1: Calendar Week View */}
          {showCalendarView && (
            <motion.div 
              key="calendar" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  February 2026
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1.5 text-xs bg-muted rounded border">Today</button>
                  <button className="px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New Template
                  </button>
                </div>
              </div>
              
              {/* Week grid */}
              <div className="bg-card rounded-lg border overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b bg-muted/30">
                  {days.map((day, i) => (
                    <div key={day} className="p-2 text-center border-r last:border-r-0">
                      <div className="text-[10px] text-muted-foreground uppercase">{day}</div>
                      <div className={`text-sm font-medium ${i === 2 ? "text-primary" : ""}`}>{i + 2}</div>
                    </div>
                  ))}
                </div>
                
                {/* Event slots */}
                <div className="grid grid-cols-7 min-h-[140px]">
                  {days.map((_, dayIndex) => (
                    <div key={dayIndex} className="border-r last:border-r-0 p-1 min-h-[140px]">
                      {events.filter(e => e.day === dayIndex).map((event, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className={`${event.color} text-white text-[9px] p-1.5 rounded mb-1`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="opacity-80">{event.time}</div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sync indicator */}
              <motion.div 
                className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Two-way sync with Google Calendar</span>
                <Check className="h-3.5 w-3.5 text-green-500" />
              </motion.div>
            </motion.div>
          )}
          
          {/* Phase 2: Template Setup */}
          {showTemplateSetup && (
            <motion.div 
              key="template" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Booking Templates
                </h2>
                <div className="relative">
                  <motion.button 
                    className="px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded flex items-center gap-1"
                    animate={{ scale: templateDropdown && !templateForm && !showShareLink ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="h-3 w-3" />
                    New Template
                    <ChevronDown className="h-3 w-3" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {templateDropdown && !templateForm && !showShareLink && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-full mt-1 w-52 bg-popover border rounded-lg shadow-xl z-20 py-1"
                      >
                        {templateTypes.map((template, i) => (
                          <div 
                            key={template.name}
                            className={`px-3 py-2 text-xs flex items-center gap-2 ${
                              template.selected ? "bg-primary/10" : "hover:bg-muted"
                            }`}
                          >
                            <template.icon className={`h-3.5 w-3.5 ${template.selected ? "text-primary" : ""}`} />
                            <div className="flex-1">
                              <span className={template.selected ? "font-medium text-primary" : ""}>
                                {template.name}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-[10px]">{template.duration}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Template form */}
              <AnimatePresence>
                {templateForm && !showShareLink && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-card rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Design Consultation</div>
                        <div className="text-xs text-muted-foreground">Let clients book design sessions</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Duration</label>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded border text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>30 minutes</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Buffer Time</label>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded border text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>15 minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button 
                      className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 relative"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <FocusRing active={true} />
                      <Check className="h-4 w-4" />
                      Create Template
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Share Link Phase */}
              <AnimatePresence>
                {showShareLink && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Template Created!</div>
                        <div className="text-xs text-muted-foreground">Share this link with your clients</div>
                      </div>
                    </div>
                    
                    {/* Share link input */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted/50 rounded border text-xs font-mono truncate">
                        <Link className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-muted-foreground">yourstore.interioapp.com/book/design</span>
                      </div>
                      <motion.button 
                        className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-1.5 ${
                          linkCopied 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                            : "bg-primary text-primary-foreground"
                        }`}
                        animate={linkCopied ? { scale: [1, 1.05, 1] } : {}}
                      >
                        {linkCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Share options */}
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex-1 py-2 rounded border text-xs flex items-center justify-center gap-1.5 hover:bg-muted">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </button>
                      <button className="flex-1 py-2 rounded border text-xs flex items-center justify-center gap-1.5 hover:bg-muted">
                        <Phone className="h-3.5 w-3.5" />
                        SMS
                      </button>
                      <button className="flex-1 py-2 rounded border text-xs flex items-center justify-center gap-1.5 hover:bg-muted">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Preview
                      </button>
                    </div>
                    
                    <motion.p 
                      className="text-[10px] text-center text-muted-foreground pt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Clients can book appointments directly from this link
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* Phase 3: Public Booking Page */}
          {showBookingPage && !showSuccess && (
            <motion.div 
              key="booking" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              {/* Split panel layout - matches the actual public booking UI */}
              <div className="h-full grid grid-cols-[1.2fr_2fr] gap-0 rounded-lg overflow-hidden border shadow-lg">
                {/* Left panel - Branding (dark slate gradient like real app) */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 flex flex-col">
                  {/* Generic business logo placeholder - not InterioApp branding */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Your Business</div>
                      <div className="text-[9px] text-slate-300">Window Treatments</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold mb-1">Installation Appointment</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
                      <Clock className="h-3.5 w-3.5" />
                      <span>30 minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Phone className="h-3.5 w-3.5" />
                      <span>+44 20 7123 4567</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Secure booking powered by InterioApp
                  </div>
                </div>
                
                {/* Right panel - Booking form */}
                <div className="bg-background p-3 space-y-2 overflow-y-auto">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Select Date & Time</div>
                  
                  {/* Mini calendar */}
                  <div className="bg-card rounded-lg border p-2">
                    <div className="text-xs font-medium mb-2 text-center">February 2026</div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div key={i} className="text-[9px] text-muted-foreground py-1">{d}</div>
                      ))}
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
                        const isSelected = day === 12 && dateSelection > 0.5;
                        const isAvailable = [10, 11, 12, 13, 14, 17, 18, 19].includes(day);
                        return (
                          <motion.div
                            key={day}
                            className={`text-[10px] py-1 rounded ${
                              isSelected 
                                ? "bg-primary text-primary-foreground font-medium" 
                                : isAvailable 
                                  ? "hover:bg-muted cursor-pointer" 
                                  : "text-muted-foreground/40"
                            }`}
                            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                          >
                            {day}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Time slots */}
                  <AnimatePresence>
                    {dateSelection > 0.5 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1"
                      >
                        <div className="text-xs font-medium text-muted-foreground">Available Times</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {timeSlots.map((slot, i) => {
                            const isSelected = slot === "10:30" && timeSelection;
                            return (
                              <motion.button
                                key={slot}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`px-2 py-1.5 text-xs rounded border ${
                                  isSelected 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "hover:border-primary"
                                }`}
                              >
                                {slot}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Client form */}
                  <AnimatePresence>
                    {formFilling && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2 pt-1"
                      >
                        <div className="text-xs font-medium text-muted-foreground">Your Details</div>
                        <div className="space-y-1.5">
                          <input 
                            type="text" 
                            value={clientName}
                            readOnly
                            placeholder="Name"
                            className="w-full px-2.5 py-1.5 text-xs border rounded bg-background"
                          />
                          <input 
                            type="email" 
                            value={clientEmail}
                            readOnly
                            placeholder="Email"
                            className="w-full px-2.5 py-1.5 text-xs border rounded bg-background"
                          />
                        </div>
                        
                        <motion.button 
                          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 relative"
                          animate={confirmClick ? { scale: 0.97 } : { scale: 1 }}
                        >
                          {confirmClick && <FocusRing active={true} />}
                          <Check className="h-3.5 w-3.5" />
                          Confirm Booking
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Phase 4: Success Confirmation */}
          {showSuccess && (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center relative"
            >
              {/* Mini confetti particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${
                    ["bg-primary", "bg-green-500", "bg-amber-500", "bg-blue-500"][i % 4]
                  }`}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 150,
                    scale: [0, 1, 0.5],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                />
              ))}
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold mb-1"
              >
                Booking Confirmed! 🎉
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground mb-4"
              >
                Holly's appointment is scheduled
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200"
              >
                <CalendarDays className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Synced to Google Calendar ✓
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// SCENE 8: LIBRARY - Product management, QR codes, and mobile scanning
export const Scene8Library = ({ phase = 0 }: StepProps) => {
  // Phase breakdown:
  // 0.00-0.20: Library overview with tabs and collections grid
  // 0.20-0.40: Add new product dialog with category dropdown
  // 0.40-0.60: QR code generation for the new product
  // 0.60-0.85: Mobile scanning demo showing instant product lookup
  // 0.85-1.00: Success summary with feature badges
  
  const showLibraryView = inPhase(phase, 0, 0.20);
  const showAddProduct = inPhase(phase, 0.20, 0.40);
  const showQRCode = inPhase(phase, 0.40, 0.60);
  const showMobileScanning = inPhase(phase, 0.60, 0.85);
  const showSuccess = inPhase(phase, 0.85, 1);
  
  const categoryDropdown = inPhase(phase, 0.23, 0.30);
  const productName = typingProgress(phase, 0.30, 0.36, "Velvet Drapery");
  const productSku = typingProgress(phase, 0.34, 0.38, "VD-001");
  
  const qrAnimating = inPhase(phase, 0.42, 0.55);
  const scanningProgress = phaseProgress(phase, 0.65, 0.75);
  const productFound = inPhase(phase, 0.75, 0.85);
  
  // Library tabs
  const tabs = [
    { name: "Collections", icon: FolderOpen, count: 160 },
    { name: "Fabrics", icon: Layers, count: 245 },
    { name: "Hardware", icon: Package, count: 89 },
    { name: "Vendors", icon: Users, count: 12 },
  ];
  
  // Collection cards
  const collections = [
    { name: "TWC Curtains", count: 45, brand: "TWC" },
    { name: "ADARA Blinds", count: 32, brand: "ADARA" },
    { name: "Premium Fabrics", count: 28, brand: "TWC" },
    { name: "Hardware Pro", count: 18, brand: "SMITH" },
  ];
  
  // Category options
  const categories = [
    { name: "Fabrics", icon: Layers },
    { name: "Blind Materials", icon: Grid },
    { name: "Hardware", icon: Package },
    { name: "Headings", icon: Scissors },
    { name: "Wallcoverings", icon: Home },
    { name: "Services", icon: Wrench },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Header */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="IA" className="h-6 w-auto" />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Library", "Calendar"].map((nav) => (
              <span key={nav} className={`text-xs ${nav === "Library" ? "font-semibold text-primary" : "text-muted-foreground"}`}>{nav}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">381 items</span>
        </div>
      </div>
      
      <div className="p-3 h-[calc(100%-48px)] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Phase 1: Library Overview */}
          {showLibraryView && (
            <motion.div 
              key="library" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Library
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1.5 text-xs bg-muted rounded border flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Search
                  </button>
                  <button className="px-2.5 py-1.5 text-xs bg-muted rounded border flex items-center gap-1">
                    <ScanLine className="h-3 w-3" />
                    Scan
                  </button>
                  <motion.button 
                    className="px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded flex items-center gap-1 relative"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <FocusRing active={inPhase(phase, 0.15, 0.20)} />
                    <Plus className="h-3 w-3" />
                    Add Item
                  </motion.button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex items-center gap-1 mb-3 border-b">
                {tabs.map((tab, i) => (
                  <motion.button
                    key={tab.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-3 py-2 text-xs flex items-center gap-1.5 border-b-2 ${
                      i === 0 ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.name}
                    <span className="text-[10px] text-muted-foreground">({tab.count})</span>
                  </motion.button>
                ))}
              </div>
              
              {/* Collections grid */}
              <div className="grid grid-cols-2 gap-2">
                {collections.map((collection, i) => (
                  <motion.div
                    key={collection.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-3 bg-card rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">{collection.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{collection.brand}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{collection.count} items</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Phase 2: Add Product Dialog */}
          {showAddProduct && (
            <motion.div 
              key="add-product" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              <div className="bg-card rounded-lg border shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Add New Inventory Item</h3>
                    <p className="text-xs text-muted-foreground">Add a new product or service to your inventory</p>
                  </div>
                  <button className="p-1 rounded hover:bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Category dropdown */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
                  <div className="relative">
                    <button className="w-full px-3 py-2 text-xs border rounded flex items-center justify-between bg-background">
                      <span className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        Fabrics
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    
                    <AnimatePresence>
                      {categoryDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute left-0 top-full mt-1 w-full bg-popover border rounded-lg shadow-xl z-20 py-1"
                        >
                          {categories.map((cat, i) => (
                            <div 
                              key={cat.name}
                              className={`px-3 py-2 text-xs flex items-center gap-2 ${
                                i === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted"
                              }`}
                            >
                              <cat.icon className={`h-3.5 w-3.5 ${i === 0 ? "text-primary" : ""}`} />
                              <span className={i === 0 ? "font-medium" : ""}>{cat.name}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Name</label>
                    <input 
                      type="text" 
                      value={productName}
                      readOnly
                      placeholder="Product name"
                      className="w-full px-3 py-2 text-xs border rounded bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">SKU</label>
                    <input 
                      type="text" 
                      value={productSku}
                      readOnly
                      placeholder="SKU-001"
                      className="w-full px-3 py-2 text-xs border rounded bg-background"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Price (per m)</label>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded border text-xs">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>45.00</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Vendor</label>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded border text-xs">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>TWC</span>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 relative"
                  animate={{ scale: inPhase(phase, 0.38, 0.40) ? [1, 1.02, 1] : 1 }}
                >
                  <FocusRing active={inPhase(phase, 0.36, 0.40)} />
                  <Check className="h-4 w-4" />
                  Create Item
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {/* Phase 3: QR Code Generation */}
          {showQRCode && (
            <motion.div 
              key="qr-code" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="bg-card rounded-lg border shadow-lg p-6 text-center max-w-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-4"
                >
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg p-2 border-2 border-muted relative overflow-hidden">
                    {/* Animated QR code pattern */}
                    <motion.div 
                      className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {[...Array(64)].map((_, i) => {
                        const isCorner = (i < 24 && i % 8 < 3) || (i < 24 && i % 8 > 4) || (i > 39 && i % 8 < 3);
                        const isRandom = Math.random() > 0.5;
                        return (
                          <motion.div
                            key={i}
                            className={`rounded-sm ${isCorner || isRandom ? "bg-foreground" : "bg-transparent"}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: qrAnimating ? 1 : 0 }}
                            transition={{ delay: i * 0.008 }}
                          />
                        );
                      })}
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-sm font-semibold mb-1">Velvet Drapery</div>
                  <div className="text-xs text-muted-foreground mb-3">SKU: VD-001</div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <button className="px-3 py-1.5 text-xs rounded border flex items-center gap-1.5 hover:bg-muted">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded border flex items-center gap-1.5 hover:bg-muted">
                      <FileText className="h-3.5 w-3.5" />
                      Print
                    </button>
                  </div>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] text-muted-foreground mt-4"
                >
                  Every product gets a unique QR code for instant lookup
                </motion.p>
              </div>
            </motion.div>
          )}
          
          {/* Phase 4: Mobile Scanning Demo */}
          {showMobileScanning && (
            <motion.div 
              key="mobile-scan" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              {/* Phone mockup */}
              <motion.div 
                className="relative w-36 h-64 bg-foreground rounded-3xl p-1.5 shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Phone screen */}
                <div className="w-full h-full bg-background rounded-2xl overflow-hidden relative">
                  {/* Camera viewfinder */}
                  {!productFound && (
                    <motion.div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                      <motion.div 
                        className="w-24 h-24 border-2 border-primary rounded-lg relative"
                        animate={{ 
                          borderColor: ["hsl(var(--primary))", "hsl(var(--primary)/0.5)", "hsl(var(--primary))"],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {/* Scanning line */}
                        <motion.div 
                          className="absolute left-0 right-0 h-0.5 bg-primary"
                          animate={{ 
                            top: [`${scanningProgress * 100}%`, `${scanningProgress * 100 + 5}%`] 
                          }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-primary" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-primary" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-primary" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-primary" />
                      </motion.div>
                      
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <div className="text-[9px] text-muted-foreground flex items-center justify-center gap-1">
                          <Camera className="h-3 w-3" />
                          Scanning...
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Product found */}
                  {productFound && (
                    <motion.div 
                      className="absolute inset-0 bg-background p-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-[10px] font-medium text-green-600">Product Found!</span>
                      </div>
                      
                      {/* Product image placeholder */}
                      <div className="w-full h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg mb-2 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-purple-400" />
                      </div>
                      
                      <div className="text-xs font-semibold mb-1">Velvet Drapery</div>
                      <div className="text-[10px] text-muted-foreground mb-2">SKU: VD-001</div>
                      
                      <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                        <div className="p-1.5 bg-muted/50 rounded">
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-medium">£45/m</div>
                        </div>
                        <div className="p-1.5 bg-muted/50 rounded">
                          <div className="text-muted-foreground">Stock</div>
                          <div className="font-medium">25m</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Phone notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-foreground rounded-full" />
              </motion.div>
              
              {/* Caption */}
              <motion.div
                className="absolute bottom-4 left-0 right-0 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-muted-foreground">
                  Find any fabric instantly with your phone or tablet
                </p>
              </motion.div>
            </motion.div>
          )}
          
          {/* Phase 5: Success Summary */}
          {showSuccess && (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <Package className="h-7 w-7 text-primary" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-base font-bold mb-1"
              >
                Your Product Library
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground mb-4"
              >
                160 collections • 381 products
              </motion.p>
              
              {/* Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {[
                  { icon: Download, label: "Import from CSV" },
                  { icon: Globe, label: "Sync with suppliers" },
                  { icon: Smartphone, label: "Mobile scanning" },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-full text-xs"
                  >
                    <feature.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{feature.label}</span>
                    <Check className="h-3 w-3 text-green-500" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
