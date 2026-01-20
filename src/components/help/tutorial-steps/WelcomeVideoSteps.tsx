/**
 * WelcomeVideoSteps - 6-Scene Cinematic Product Showcase
 * IMPROVED: Larger fonts, realistic names, focus highlights, Scene 3 fixed
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sun, Plus, ChevronRight, ChevronDown, Check, Trash2,
  Share2, FileText, Users, Home, Bed, ChefHat, Bath, MoreHorizontal,
  MessageSquare, Receipt, Layers, Eye, X,
  ShoppingBag, Package, UserPlus, Copy, ExternalLink,
  DollarSign, Calendar, Lightbulb, Settings, Ruler, Scissors, Mail,
  CreditCard, Download, Send, CheckCircle2, Wrench, ClipboardList
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

// SCENE 5: PROJECT DEEP DIVE - Dummy data, no cursor
export const Scene5ProjectDeepDive = ({ phase = 0 }: StepProps) => {
  const showClientTab = inPhase(phase, 0, 0.10);
  const showProjectTab = inPhase(phase, 0.10, 0.20);
  const showQuoteTab = inPhase(phase, 0.20, 0.65);
  const focusOnPayment = inPhase(phase, 0.38, 0.42);
  const showPaymentDropdown = inPhase(phase, 0.42, 0.48);
  const showPaymentConfig = inPhase(phase, 0.48, 0.52);
  const showEmailDialog = inPhase(phase, 0.52, 0.62);
  const showEmailSuccess = inPhase(phase, 0.60, 0.65);
  const showWorkroomTab = inPhase(phase, 0.65, 0.80);
  const showInstallationTab = inPhase(phase, 0.80, 0.90);
  const focusOnShare = inPhase(phase, 0.86, 0.90);
  const showSharePopover = inPhase(phase, 0.90, 1);
  
  const activeTab = showInstallationTab || showSharePopover ? "installation" : showWorkroomTab ? "workroom" : showQuoteTab ? "quote" : showProjectTab ? "project" : "client";
  
  const tabs = [{ id: "client", label: "Client", icon: Users }, { id: "project", label: "Project", icon: Layers }, { id: "quote", label: "Quote", icon: Receipt }, { id: "workroom", label: "Workroom", icon: FileText }, { id: "installation", label: "Install", icon: Wrench }];
  
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
          {showProjectTab && (
            <motion.div key="project" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {[{ room: "Master Bedroom", amount: "£2,200", icon: Bed }, { room: "Living Room", amount: "£1,450", icon: Home }, { room: "Kitchen", amount: "£612", icon: ChefHat }, { room: "Bathroom", amount: "£404", icon: Bath }].map((item) => (
                <div key={item.room} className="bg-card rounded-lg border p-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><item.icon className="h-5 w-5 text-muted-foreground" /></div><span className="text-sm font-medium">{item.room}</span></div><span className="text-sm font-bold text-primary">{item.amount}</span></div>
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
                  <div className="relative">
                    <motion.button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-muted rounded border relative" animate={{ backgroundColor: showPaymentDropdown || showPaymentConfig ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))" }}><FocusRing active={focusOnPayment} /><CreditCard className="h-3.5 w-3.5" />Payment<ChevronDown className="h-3 w-3" /></motion.button>
                    <AnimatePresence>{showPaymentDropdown && !showPaymentConfig && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-lg shadow-xl z-30 py-1"><div className="px-4 py-2.5 text-sm hover:bg-primary/10 flex items-center gap-2"><Settings className="h-4 w-4" /><span className="font-medium">Configure Payment</span></div></motion.div>}</AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-lg border shadow-sm">
                <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-start justify-between"><div><img src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" alt="Logo" className="h-6 w-auto mb-2" /><div className="text-xs text-muted-foreground">Demo Interiors Ltd</div></div><div className="text-right"><div className="text-base font-bold text-primary">Quotation</div><div className="text-sm text-muted-foreground"># QUOTE-001</div></div></div>
                <div className="p-3 border-b bg-muted/30"><div className="text-xs font-medium text-muted-foreground uppercase mb-1">👤 Bill To</div><div className="text-sm font-medium">Smith Family</div></div>
                <div className="divide-y">
                  <div className="p-3 flex items-start gap-3"><div className="w-11 h-11 rounded bg-indigo-100 flex items-center justify-center"><Scissors className="h-5 w-5 text-indigo-400" /></div><div className="flex-1"><div className="text-sm font-medium">Lined Curtains</div><div className="text-xs text-muted-foreground">1800×2000mm</div></div><div className="text-sm font-semibold">£1,200</div></div>
                  <div className="p-3 flex items-start gap-3"><div className="w-11 h-11 rounded bg-gray-100 flex items-center justify-center"><Ruler className="h-5 w-5 text-gray-400" /></div><div className="flex-1"><div className="text-sm font-medium">Curtain Track</div><div className="text-xs text-muted-foreground">2400mm</div></div><div className="text-sm font-semibold">£250</div></div>
                </div>
                <div className="p-3 bg-muted/30 border-t"><div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">£1,740</span></div></div>
              </div>
              <AnimatePresence>
                {showPaymentConfig && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-background rounded-xl border shadow-xl w-full max-w-[300px]">
                      <div className="flex items-center justify-between px-4 py-3 border-b"><div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><span className="text-base font-semibold">Configure Payment</span></div><X className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="p-4 space-y-3">
                        <motion.label className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5"><div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-primary" /></div><div><div className="text-sm font-medium text-primary">50% Deposit</div><div className="text-xs text-muted-foreground">£870 now, rest later</div></div></motion.label>
                        <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5"><Check className="h-4 w-4" />Save</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                {showEmailDialog && !showPaymentConfig && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-background rounded-xl border shadow-xl w-full max-w-[320px]">
                      <div className="flex items-center justify-between px-4 py-3 border-b"><div className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /><span className="text-base font-semibold">Email Quote</span></div><X className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="p-4 space-y-3">
                        <div><label className="text-xs font-medium text-muted-foreground">To</label><input type="text" value="smith@example.com" readOnly className="w-full px-3 py-2 text-sm border rounded bg-muted/50" /></div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><div className="text-sm text-blue-600 flex items-center gap-1.5"><FileText className="h-4 w-4" /><span>Quote PDF attached</span></div></div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2.5 rounded-lg border text-sm font-medium">Cancel</button>
                          <motion.button className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5" animate={{ backgroundColor: showEmailSuccess ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--primary))", color: "white" }}>{showEmailSuccess ? <><CheckCircle2 className="h-4 w-4" />Sent!</> : <><Send className="h-4 w-4" />Send</>}</motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {showWorkroomTab && (
            <motion.div key="workroom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white dark:bg-card rounded-lg border shadow-sm">
                <div className="p-3 border-b bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20"><div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-orange-600" /><span className="text-base font-bold text-orange-700">WORK ORDER</span></div><div className="text-sm font-medium mt-1">Master Bedroom - Wave Curtains</div></div>
                <div className="p-4 border-b"><div className="text-xs font-medium text-muted-foreground uppercase mb-3">Window Diagram</div><div className="relative bg-muted/30 rounded-lg p-5 flex items-center justify-center"><div className="relative"><div className="w-40 h-32 border-2 border-primary rounded" /><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">W: 1800mm</div><div className="absolute -right-14 top-1/2 -translate-y-1/2 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">H: 2000mm</div></div></div></div>
                <div className="p-3"><div className="text-xs font-medium text-muted-foreground uppercase mb-2">Materials</div>{[{ name: "Lining Fabric", qty: "6.5m" }, { name: "Heading Tape", qty: "2.4m" }].map((item) => (<div key={item.name} className="flex items-center justify-between text-sm p-2.5 bg-muted/30 rounded mb-2"><span>{item.name}</span><span className="font-medium">{item.qty}</span></div>))}</div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: showCTA ? 1 : 0 }} className="flex flex-wrap justify-center gap-2 max-w-xs">{["Quote Builder", "Team Notes", "Work Orders", "Payments", "Installation"].map((feature, i) => (<motion.span key={feature} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full font-medium">{feature}</motion.span>))}</motion.div>
    </div>
  );
};
