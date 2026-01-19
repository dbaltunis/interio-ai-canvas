import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Send, Inbox, FileText, BarChart3,
  Search, Plus, MoreHorizontal, ArrowLeft,
  CheckCircle2, Eye, MousePointerClick, XCircle,
  Users, Sparkles, Copy, Reply, Forward,
  Archive, Trash2, RefreshCw, ChevronRight,
  Zap, TrendingUp, Target, Check, Wand2,
  MessageSquare, Calendar, Clock, AlertTriangle
} from "lucide-react";
import { MockCard } from "../TutorialVisuals";
import { typingProgress, phaseProgress } from "@/lib/demoAnimations";
import { 
  DemoEmailCard, 
  DemoCampaignCard, 
  DemoEmailAnalytics,
  DemoTemplateCard 
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// MESSAGES TUTORIAL - 12 ACTION-PACKED STEPS
// Multi-phase animations for engaging experience
// ===========================================

// ===== SHARED ANIMATED COMPONENTS =====

const MockTabBar = ({ 
  activeTab = "inbox",
  animatingTab,
}: { 
  activeTab?: "inbox" | "campaigns" | "templates" | "analytics";
  animatingTab?: string | null;
}) => {
  const tabs = [
    { id: "inbox", label: "Inbox", shortLabel: "In", icon: Inbox, count: 156 },
    { id: "campaigns", label: "Campaigns", shortLabel: "Camp", icon: Send, count: 12 },
    { id: "templates", label: "Templates", shortLabel: "Tmpl", icon: FileText, count: 24 },
    { id: "analytics", label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="flex border-b border-border/50 bg-card/50 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isAnimating = animatingTab === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive 
                ? "text-foreground border-primary bg-primary/5" 
                : "text-muted-foreground border-transparent"
            }`}
            animate={isAnimating ? { 
              scale: [1, 1.1, 1],
              backgroundColor: ["transparent", "hsl(var(--primary) / 0.1)", "transparent"]
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
            {tab.count && (
              <motion.span 
                className="text-[9px] sm:text-[10px] opacity-70"
                animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
              >
                {tab.count}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const MockMessagesHeader = ({
  composeHighlighted = false,
  composeClicked = false,
  messageCount = 156,
  countAnimating = false,
}: {
  composeHighlighted?: boolean;
  composeClicked?: boolean;
  messageCount?: number;
  countAnimating?: boolean;
}) => (
  <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-b border-border bg-card/50">
    <div className="flex items-center gap-1.5 sm:gap-2">
      <motion.div 
        className="p-1 sm:p-1.5 bg-primary/10 rounded-lg"
        animate={countAnimating ? { scale: [1, 1.1, 1] } : {}}
      >
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
      </motion.div>
      <span className="text-xs sm:text-sm font-semibold">Messages</span>
      <motion.span 
        className="px-1 sm:px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium rounded"
        animate={countAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        {messageCount}
      </motion.span>
    </div>
    <motion.div
      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] sm:text-xs font-medium ${
        composeHighlighted ? "ring-2 ring-primary/50 ring-offset-1 sm:ring-offset-2" : ""
      }`}
      animate={
        composeClicked 
          ? { scale: [1, 0.95, 1.05, 1] }
          : composeHighlighted 
            ? { scale: [1, 1.05, 1] } 
            : {}
      }
      transition={{ duration: 0.3, repeat: composeHighlighted && !composeClicked ? Infinity : 0 }}
    >
      <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      <span className="hidden sm:inline">Compose</span>
      <span className="sm:hidden">New</span>
    </motion.div>
  </div>
);

// Animated counter component
const AnimatedCounter = ({ 
  value, 
  suffix = "", 
  animate = false,
  delay = 0,
}: { 
  value: number; 
  suffix?: string;
  animate?: boolean;
  delay?: number;
}) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        let current = 0;
        const step = value / 20;
        const interval = setInterval(() => {
          current += step;
          if (current >= value) {
            setCount(value);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, 50);
        return () => clearInterval(interval);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setCount(value);
    }
  }, [animate, value, delay]);
  
  return <span>{count}{suffix}</span>;
};

// Sample data
const sampleEmails = [
  { clientName: "Sarah J.", subject: "Quote Follow-up", preview: "Thank you for the quote...", channel: "email" as const, status: "opened" as const, timestamp: "2h" },
  { clientName: "Chen Ind.", subject: "Order Confirmation", preview: "This is to confirm...", channel: "email" as const, status: "delivered" as const, timestamp: "5h" },
  { clientName: "Wilson H.", subject: "Measurement", preview: "Your appointment is...", channel: "whatsapp" as const, status: "sent" as const, timestamp: "1d" },
];

// ===========================================
// STEP 1: Messages Hub - Tab cycling + count animation
// ===========================================
export const MessagesStep1 = ({ phase = 0 }: StepProps) => {
  const showHeader = phase > 0.1;
  const tabsAnimate = phase > 0.2;
  const countAnimates = phase > 0.5;
  const composeGlows = phase > 0.7;
  
  const currentTabIndex = Math.floor(phaseProgress(phase, 0.2, 0.7) * 4);
  const tabs = ["inbox", "campaigns", "templates", "analytics"] as const;
  const activeTab = tabs[Math.min(currentTabIndex, 3)];

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showHeader ? 1 : 0, y: showHeader ? 0 : -10 }}
      >
        <MockMessagesHeader 
          composeHighlighted={composeGlows} 
          countAnimating={countAnimates}
        />
      </motion.div>
      <MockTabBar 
        activeTab={activeTab} 
        animatingTab={tabsAnimate ? activeTab : null} 
      />
      <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-2 sm:py-4"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-xs sm:text-sm font-medium">Email Marketing Hub</span>
          </div>
          {phase > 0.3 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]"
            >
              {[
                { label: "Inbox", value: 156 },
                { label: "Campaigns", value: 12 },
                { label: "Templates", value: 24 },
                { label: "Analytics", value: 89 },
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-1.5 sm:p-2 bg-muted/30 rounded-lg"
                >
                  <div className="text-base sm:text-lg font-bold text-primary">
                    <AnimatedCounter value={item.value} animate={countAnimates} delay={i * 100} />
                  </div>
                  <div className="text-muted-foreground">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 2: Compose Email - Dialog slides in, typing animation
// ===========================================
export const MessagesStep2 = ({ phase = 0 }: StepProps) => {
  const showInbox = phase > 0.05;
  const composeClick = phase > 0.15;
  const dialogSlides = phase > 0.25;
  const recipientFills = phase > 0.35;
  const subjectTypes = phase > 0.45;
  const bodyTypes = phase > 0.6;
  const sendGlows = phase > 0.85;
  
  const subjectText = typingProgress(phase, 0.45, 0.6, "New Spring Collection!");
  const bodyText = typingProgress(phase, 0.6, 0.85, "Hi Sarah,\n\nExcited to share our latest fabrics...");

  return (
    <MockCard className="bg-card overflow-hidden w-full relative min-h-[280px] sm:min-h-[320px]">
      <MockMessagesHeader composeClicked={composeClick} />
      <MockTabBar activeTab="inbox" />
      
      {/* Background inbox */}
      <motion.div 
        className="p-1.5 sm:p-2 space-y-1"
        animate={{ opacity: dialogSlides ? 0.3 : 1, scale: dialogSlides ? 0.98 : 1 }}
      >
        {sampleEmails.slice(0, 2).map((email, i) => (
          <div key={i} className="opacity-50">
            <DemoEmailCard {...email} />
          </div>
        ))}
      </motion.div>

      {/* Compose dialog overlay */}
      <AnimatePresence>
        {dialogSlides && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-1.5 sm:inset-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col"
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border bg-muted/30">
              <span className="text-xs sm:text-sm font-semibold">New Email</span>
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground cursor-pointer" />
            </div>
            
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 flex-1 overflow-hidden">
              {/* To field */}
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">To:</span>
                <motion.div 
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 border border-border rounded bg-background"
                  animate={recipientFills ? { borderColor: "hsl(var(--primary))" } : {}}
                >
                  {recipientFills && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-primary/10 rounded-full text-[10px] sm:text-xs"
                    >
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-info flex items-center justify-center text-[7px] sm:text-[8px] text-white font-bold">SJ</div>
                      <span>Sarah J.</span>
                      <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                    </motion.div>
                  )}
                  {!recipientFills && <span className="text-[10px] sm:text-xs text-muted-foreground">Select recipient...</span>}
                </motion.div>
              </div>
              
              {/* Subject field */}
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">Subject:</span>
                <motion.div 
                  className="p-1.5 sm:p-2 border border-border rounded bg-background text-[10px] sm:text-xs"
                  animate={subjectTypes ? { borderColor: "hsl(var(--primary))" } : {}}
                >
                  {subjectText || <span className="text-muted-foreground">Enter subject...</span>}
                  {subjectTypes && !bodyTypes && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="inline-block w-0.5 h-2.5 sm:h-3 bg-primary ml-0.5"
                    />
                  )}
                </motion.div>
              </div>
              
              {/* Body field */}
              <div className="space-y-0.5 sm:space-y-1 flex-1">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">Message:</span>
                <motion.div 
                  className="p-1.5 sm:p-2 border border-border rounded bg-background text-[10px] sm:text-xs min-h-[40px] sm:min-h-[60px] whitespace-pre-wrap"
                  animate={bodyTypes ? { borderColor: "hsl(var(--primary))" } : {}}
                >
                  {bodyText || <span className="text-muted-foreground">Write your message...</span>}
                  {bodyTypes && !sendGlows && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="inline-block w-0.5 h-2.5 sm:h-3 bg-primary ml-0.5"
                    />
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-2 sm:p-3 border-t border-border flex justify-end gap-2">
              <motion.button
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-primary text-primary-foreground rounded text-[10px] sm:text-xs font-medium"
                animate={sendGlows ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 0 4px hsl(var(--primary) / 0.3)", "0 0 0 0 hsl(var(--primary) / 0)"] } : {}}
                transition={{ duration: 0.8, repeat: sendGlows ? Infinity : 0 }}
              >
                <Send className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Send
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MockCard>
  );
};

// ===========================================
// STEP 3: Split-Pane Inbox - Select + detail view
// ===========================================
export const MessagesStep3 = ({ phase = 0 }: StepProps) => {
  const showList = phase > 0.1;
  const selectEmail = phase > 0.25;
  const showDetail = phase > 0.4;
  const trackingAnimate = phase > 0.6;
  const openCountUp = phase > 0.75;

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <MockMessagesHeader />
      <MockTabBar activeTab="inbox" />
      <div className="flex flex-col sm:flex-row min-h-[180px] sm:min-h-[200px]">
        {/* Left panel - message list */}
        <motion.div 
          className="w-full sm:w-2/5 border-b sm:border-b-0 sm:border-r border-border overflow-hidden max-h-[100px] sm:max-h-none"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: showList ? 1 : 0, x: showList ? 0 : -20 }}
        >
          {sampleEmails.slice(0, 2).map((email, i) => (
            <motion.div
              key={i}
              animate={selectEmail && i === 0 ? { 
                backgroundColor: "hsl(var(--primary) / 0.1)",
                borderLeftWidth: "3px",
                borderLeftColor: "hsl(var(--primary))"
              } : {}}
              className="border-l-0"
            >
              <DemoEmailCard {...email} selected={selectEmail && i === 0} />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Right panel - detail view */}
        <motion.div 
          className="flex-1 p-2 sm:p-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: showDetail ? 1 : 0, x: showDetail ? 0 : 20 }}
        >
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs sm:text-sm">Quote Follow-up</h3>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-info flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold">SJ</div>
              <span>Sarah Johnson</span>
            </div>

            {/* Tracking stats with animation */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-muted/30 rounded-lg"
              animate={trackingAnimate ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: trackingAnimate ? 2 : 0 }}
            >
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px]">
                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                <span>Delivered</span>
              </div>
              <motion.div 
                className="flex items-center gap-1 text-[9px] sm:text-[10px] text-purple-500"
                animate={openCountUp ? { scale: [1, 1.2, 1] } : {}}
              >
                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>Opened <AnimatedCounter value={3} suffix="x" animate={openCountUp} /></span>
              </motion.div>
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-primary">
                <MousePointerClick className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>1 click</span>
              </div>
            </motion.div>

            <div className="text-[9px] sm:text-[10px] text-muted-foreground bg-muted/20 rounded p-1.5 sm:p-2">
              Thank you for the quote. I have a few questions...
            </div>
          </div>
        </motion.div>
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 4: Email Actions - Dropdown animation
// ===========================================
export const MessagesStep4 = ({ phase = 0 }: StepProps) => {
  const showEmail = phase > 0.1;
  const clickMenu = phase > 0.25;
  const showDropdown = phase > 0.35;
  const highlightAction = Math.floor(phaseProgress(phase, 0.4, 0.85) * 5);
  const showToast = phase > 0.9;

  const actions = [
    { icon: Reply, label: "Reply" },
    { icon: Forward, label: "Forward" },
    { icon: Copy, label: "Copy" },
    { icon: Archive, label: "Archive" },
    { icon: Trash2, label: "Delete", danger: true },
  ];

  return (
    <MockCard className="bg-card overflow-hidden w-full relative min-h-[200px]">
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm font-medium">Quote Follow-up</span>
        </div>
        <motion.div
          animate={clickMenu ? { scale: [1, 1.2, 1] } : {}}
          className="cursor-pointer p-1 hover:bg-muted rounded"
        >
          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </motion.div>
      </div>
      
      {/* Email preview */}
      <motion.div 
        className="p-2 sm:p-4"
        animate={{ opacity: showDropdown ? 0.5 : 1 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-info flex items-center justify-center text-[9px] sm:text-xs text-white font-bold">SJ</div>
          <div>
            <p className="text-xs sm:text-sm font-medium">Sarah Johnson</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">sarah@example.com</p>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground">
          Thank you for the quote. I have a few questions...
        </div>
      </motion.div>
      
      {/* Dropdown menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-10 sm:top-12 right-2 sm:right-3 w-28 sm:w-36 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden"
          >
            {actions.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  backgroundColor: highlightAction === i ? "hsl(var(--primary) / 0.1)" : "transparent"
                }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs cursor-pointer ${
                  item.danger ? "text-destructive" : ""
                }`}
              >
                <item.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{item.label}</span>
                {highlightAction === i && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-auto text-primary" />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg text-[10px] sm:text-xs shadow-lg"
          >
            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </MockCard>
  );
};

// ===========================================
// STEP 5: Launch Campaign - Template selection + wizard
// ===========================================
export const MessagesStep5 = ({ phase = 0 }: StepProps) => {
  const showCampaigns = phase > 0.1;
  const templatesShuffle = phase > 0.2;
  const selectTemplate = phase > 0.35;
  const wizardStep = Math.min(Math.floor(phaseProgress(phase, 0.45, 0.9) * 4), 3);
  const wizardActive = phase > 0.45;

  const templates = [
    { name: "Spring Sale", category: "promotion" as const, highlighted: selectTemplate && !wizardActive },
    { name: "Quote Follow-up", category: "follow-up" as const },
  ];

  const wizardSteps = ["Template", "Recipients", "Schedule", "Review"];

  return (
    <MockCard className="bg-card overflow-hidden w-full relative min-h-[240px] sm:min-h-[280px]">
      <MockMessagesHeader />
      <MockTabBar activeTab="campaigns" />
      
      {/* Template grid */}
      <motion.div 
        className="p-2 sm:p-3 grid grid-cols-2 gap-1.5 sm:gap-2"
        animate={{ opacity: wizardActive ? 0.3 : 1, scale: wizardActive ? 0.98 : 1 }}
      >
        {templates.map((template, i) => (
          <motion.div
            key={template.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showCampaigns ? 1 : 0, 
              y: showCampaigns ? 0 : 20,
              scale: templatesShuffle ? [1, 1.02, 1] : 1
            }}
            transition={{ delay: i * 0.1 }}
          >
            <DemoTemplateCard 
              {...template}
              description=""
              usageCount={0}
              highlighted={template.highlighted}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Campaign wizard overlay */}
      <AnimatePresence>
        {wizardActive && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-2 sm:inset-3 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          >
            {/* Wizard header */}
            <div className="p-2 sm:p-3 border-b border-border">
              <span className="text-xs sm:text-sm font-semibold">Create Campaign</span>
              {/* Step indicator */}
              <div className="flex items-center gap-1 sm:gap-2 mt-2">
                {wizardSteps.map((step, i) => (
                  <React.Fragment key={step}>
                    <motion.div 
                      className={`flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] ${
                        i < wizardStep ? "text-green-500" : 
                        i === wizardStep ? "text-primary" : 
                        "text-muted-foreground"
                      }`}
                      animate={i === wizardStep ? { scale: [1, 1.1, 1] } : {}}
                    >
                      <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold ${
                        i < wizardStep ? "bg-green-500 text-white" :
                        i === wizardStep ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i < wizardStep ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : i + 1}
                      </div>
                      <span className="hidden sm:inline">{step}</span>
                    </motion.div>
                    {i < wizardSteps.length - 1 && (
                      <motion.div 
                        className={`flex-1 h-0.5 ${i < wizardStep ? "bg-green-500" : "bg-muted"}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i < wizardStep ? 1 : 0 }}
                        style={{ originX: 0 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Wizard content */}
            <div className="p-3 sm:p-4 text-center">
              <motion.div
                key={wizardStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-4 sm:py-6"
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
                  {wizardStep === 0 && "📄"}
                  {wizardStep === 1 && "👥"}
                  {wizardStep === 2 && "📅"}
                  {wizardStep === 3 && "✅"}
                </div>
                <span className="text-xs sm:text-sm font-medium">{wizardSteps[wizardStep]}</span>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                  {wizardStep === 0 && "Spring Sale selected"}
                  {wizardStep === 1 && "245 recipients"}
                  {wizardStep === 2 && "Send immediately"}
                  {wizardStep === 3 && "Ready to launch!"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MockCard>
  );
};

// ===========================================
// STEP 6: Campaign Sent! - Success explosion + stats animate
// ===========================================
export const MessagesStep6 = ({ phase = 0 }: StepProps) => {
  const showCard = phase > 0.1;
  const progressFills = phase > 0.2;
  const progressComplete = phase > 0.4;
  const confetti = phase > 0.45;
  const stat1 = phase > 0.55;
  const stat2 = phase > 0.65;
  const stat3 = phase > 0.75;
  const badge = phase > 0.85;

  return (
    <MockCard className="bg-card overflow-hidden w-full relative">
      <div className="p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showCard ? 1 : 0, scale: showCard ? 1 : 0.9 }}
          className="text-center"
        >
          {/* Progress bar */}
          {!progressComplete && (
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Sending campaign...</div>
              <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: progressFills ? "100%" : "0%" }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </div>
          )}

          {/* Success state */}
          {progressComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Confetti effect */}
              <div className="relative">
                <motion.div
                  animate={confetti ? { scale: [1, 1.2, 1] } : {}}
                  className="text-3xl sm:text-5xl"
                >
                  🎉
                </motion.div>
                {confetti && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-sm sm:text-lg"
                        initial={{ 
                          opacity: 1,
                          x: 0, y: 0,
                          scale: 1
                        }}
                        animate={{ 
                          opacity: 0,
                          x: Math.cos(i * Math.PI / 2) * 40,
                          y: Math.sin(i * Math.PI / 2) * 40,
                          scale: 0.5
                        }}
                        transition={{ duration: 0.8 }}
                        style={{ left: "50%", top: "50%" }}
                      >
                        {["✨", "🎊", "⭐", "💫"][i]}
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="text-base sm:text-lg font-bold text-green-500">Campaign Sent!</div>
              
              {/* Animated stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mt-3 sm:mt-4">
                <motion.div 
                  className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: stat1 ? 1 : 0, y: stat1 ? 0 : 20 }}
                >
                  <div className="text-lg sm:text-xl font-bold text-blue-500">
                    <AnimatedCounter value={245} animate={stat1} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">Sent</div>
                </motion.div>
                <motion.div 
                  className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: stat2 ? 1 : 0, y: stat2 ? 0 : 20 }}
                >
                  <div className="text-lg sm:text-xl font-bold text-green-500">
                    <AnimatedCounter value={189} animate={stat2} delay={100} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">Delivered</div>
                </motion.div>
                <motion.div 
                  className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: stat3 ? 1 : 0, y: stat3 ? 0 : 20 }}
                >
                  <div className="text-lg sm:text-xl font-bold text-purple-500">
                    <AnimatedCounter value={82} animate={stat3} delay={200} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">Opened</div>
                </motion.div>
              </div>

              {/* Success badge */}
              <AnimatePresence>
                {badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm font-medium"
                  >
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    42% Open Rate!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 7: Template Library - Grid fade + filter cycle
// ===========================================
export const MessagesStep7 = ({ phase = 0 }: StepProps) => {
  const showGrid = phase > 0.1;
  const filterCycle = phase > 0.25;
  const currentFilter = Math.floor(phaseProgress(phase, 0.25, 0.7) * 4);
  const selectTemplate = phase > 0.75;
  const useButtonGlow = phase > 0.85;

  const filters = ["All", "Follow-up", "Promo", "News"];
  const templates = [
    { name: "Quote Follow-up", category: "follow-up" as const, description: "After quote", usageCount: 45 },
    { name: "Spring Sale", category: "promotion" as const, description: "Seasonal", usageCount: 28 },
    { name: "Monthly Update", category: "newsletter" as const, description: "News & tips", usageCount: 12, isAI: true },
  ];

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <MockMessagesHeader />
      <MockTabBar activeTab="templates" />
      
      {/* Filter bar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 border-b border-border overflow-x-auto">
        {filters.map((filter, i) => (
          <motion.div
            key={filter}
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium whitespace-nowrap ${
              filterCycle && currentFilter === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            animate={filterCycle && currentFilter === i ? { scale: [1, 1.1, 1] } : {}}
          >
            {filter}
          </motion.div>
        ))}
      </div>

      {/* Template grid */}
      <div className="p-2 sm:p-3 grid grid-cols-2 gap-1.5 sm:gap-2">
        {templates.slice(0, 2).map((template, i) => (
          <motion.div
            key={template.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showGrid ? 1 : 0, 
              y: showGrid ? 0 : 20 
            }}
            transition={{ delay: i * 0.1 }}
          >
            <DemoTemplateCard 
              {...template}
              highlighted={selectTemplate && i === 0}
            />
          </motion.div>
        ))}
      </div>

      {/* Use Template button */}
      {selectTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 sm:p-3 border-t border-border"
        >
          <motion.button
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg text-[10px] sm:text-xs font-medium"
            animate={useButtonGlow ? { 
              scale: [1, 1.02, 1],
              boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 0 4px hsl(var(--primary) / 0.3)", "0 0 0 0 hsl(var(--primary) / 0)"]
            } : {}}
            transition={{ duration: 0.8, repeat: useButtonGlow ? Infinity : 0 }}
          >
            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Use Template
          </motion.button>
        </motion.div>
      )}
    </MockCard>
  );
};

// ===========================================
// STEP 8: AI Magic - Generate content animation
// ===========================================
export const MessagesStep8 = ({ phase = 0 }: StepProps) => {
  const showComposer = phase > 0.1;
  const clickAI = phase > 0.2;
  const shimmer = phase > 0.3 && phase < 0.6;
  const contentTypes = phase > 0.6;
  
  const generatedText = typingProgress(phase, 0.6, 0.95, 
    "Dear valued customer,\n\nWe're thrilled to announce our Spring Collection! " +
    "Featuring luxurious new fabrics in trending colors.\n\n" +
    "Book a consultation today and receive 15% off!"
  );

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <div className="p-2 sm:p-3 border-b border-border flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold">New Email</span>
        <motion.button
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-[10px] sm:text-xs font-medium"
          animate={clickAI ? { scale: [1, 1.1, 1] } : {}}
        >
          <Wand2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Generate with AI</span>
          <span className="sm:hidden">AI</span>
        </motion.button>
      </div>
      
      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Subject */}
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">Subject:</span>
          <div className="p-1.5 sm:p-2 border border-border rounded bg-background text-[10px] sm:text-xs">
            Spring Collection Launch!
          </div>
        </div>
        
        {/* Body with AI generation */}
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">Message:</span>
          <motion.div 
            className="p-1.5 sm:p-2 border border-border rounded bg-background text-[10px] sm:text-xs min-h-[80px] sm:min-h-[100px] whitespace-pre-wrap relative overflow-hidden"
            animate={shimmer ? { borderColor: "hsl(var(--primary))" } : {}}
          >
            {/* Shimmer effect */}
            {shimmer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            {/* Shimmer loading lines */}
            {shimmer && !contentTypes && (
              <div className="space-y-1.5 sm:space-y-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2.5 sm:h-3 bg-muted rounded"
                    style={{ width: `${80 - i * 10}%` }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
            
            {/* Generated content */}
            {contentTypes && (
              <>
                {generatedText}
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-0.5 h-2.5 sm:h-3 bg-purple-500 ml-0.5"
                />
              </>
            )}
          </motion.div>
        </div>
        
        {/* AI badge */}
        {contentTypes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-purple-500"
          >
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            AI-generated content ready
          </motion.div>
        )}
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 9: Real-Time Analytics - KPI counters + chart animation
// ===========================================
export const MessagesStep9 = ({ phase = 0 }: StepProps) => {
  const showKPIs = phase > 0.1;
  const countersAnimate = phase > 0.25;
  const chartDraws = phase > 0.5;
  const barsGrow = phase > 0.7;

  const chartProgress = phaseProgress(phase, 0.5, 0.9);

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <MockMessagesHeader />
      <MockTabBar activeTab="analytics" />
      
      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showKPIs ? 1 : 0, y: showKPIs ? 0 : 10 }}
        >
          <DemoEmailAnalytics />
        </motion.div>

        {/* Mini chart */}
        <motion.div
          className="p-2 sm:p-3 border border-border rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: chartDraws ? 1 : 0 }}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-medium">Email Activity</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">Last 7 days</span>
          </div>
          
          {/* Bar chart */}
          <div className="h-16 sm:h-20 flex items-end gap-0.5 sm:gap-1">
            {[45, 62, 38, 71, 55, 89, 67].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1">
                <motion.div 
                  className="w-full bg-primary/20 rounded-t relative overflow-hidden"
                  style={{ height: `${value}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: barsGrow ? `${value * chartProgress}%` : 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <motion.div 
                    className="absolute bottom-0 w-full bg-primary rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: barsGrow ? `${value * 0.6 * chartProgress}%` : 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  />
                </motion.div>
                <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 10: Personalization Tokens
// ===========================================
export const MessagesStep10 = ({ phase = 0 }: StepProps) => {
  const showTokens = phase > 0.1;
  const tokenBlink = phase > 0.2 && phase < 0.5;
  const transform = phase > 0.55;
  
  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <div className="p-2 sm:p-3 border-b border-border">
        <span className="text-xs sm:text-sm font-semibold">Personalization Tokens</span>
      </div>
      
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Token list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showTokens ? 1 : 0 }}
          className="flex flex-wrap gap-1.5 sm:gap-2"
        >
          {["{{client_name}}", "{{company}}", "{{project}}", "{{total}}"].map((token, i) => (
            <motion.span
              key={token}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded text-[9px] sm:text-xs font-mono"
              animate={tokenBlink ? { 
                scale: [1, 1.1, 1],
                backgroundColor: ["hsl(var(--primary) / 0.1)", "hsl(var(--primary) / 0.2)", "hsl(var(--primary) / 0.1)"]
              } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, repeat: tokenBlink ? Infinity : 0 }}
            >
              {token}
            </motion.span>
          ))}
        </motion.div>
        
        {/* Example transformation */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">Preview:</div>
          
          {/* Before */}
          <motion.div 
            className="p-2 sm:p-3 bg-muted/30 rounded-lg text-[10px] sm:text-xs"
            animate={{ opacity: transform ? 0.5 : 1 }}
          >
            <span className="text-muted-foreground">Hi </span>
            <motion.span 
              className="text-primary font-mono"
              animate={tokenBlink ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: tokenBlink ? Infinity : 0, duration: 0.5 }}
            >
              {"{{client_name}}"}
            </motion.span>
            <span className="text-muted-foreground">, your quote for </span>
            <motion.span 
              className="text-primary font-mono"
              animate={tokenBlink ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: tokenBlink ? Infinity : 0, duration: 0.5, delay: 0.1 }}
            >
              {"{{project}}"}
            </motion.span>
            <span className="text-muted-foreground"> is ready!</span>
          </motion.div>
          
          {/* Arrow */}
          {transform && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary rotate-90" />
            </motion.div>
          )}
          
          {/* After */}
          {transform && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-[10px] sm:text-xs"
            >
              <span>Hi </span>
              <span className="font-semibold text-green-600 dark:text-green-400">Sarah Johnson</span>
              <span>, your quote for </span>
              <span className="font-semibold text-green-600 dark:text-green-400">Living Room</span>
              <span> is ready!</span>
            </motion.div>
          )}
        </div>
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 11: Spam Check - Progress + checkmarks
// ===========================================
export const MessagesStep11 = ({ phase = 0 }: StepProps) => {
  const progressFills = phase > 0.1;
  const progressComplete = phase > 0.4;
  const check1 = phase > 0.45;
  const check2 = phase > 0.55;
  const check3 = phase > 0.65;
  const check4 = phase > 0.75;
  const scoreCelebrate = phase > 0.85;

  const checks = [
    { label: "Subject line quality", pass: true },
    { label: "No spam trigger words", pass: true },
    { label: "Valid sender domain", pass: true },
    { label: "Unsubscribe link", pass: true },
  ];
  const checkStates = [check1, check2, check3, check4];

  return (
    <MockCard className="bg-card overflow-hidden w-full">
      <div className="p-2 sm:p-3 border-b border-border flex items-center gap-1.5 sm:gap-2">
        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
        <span className="text-xs sm:text-sm font-semibold">Spam Check</span>
      </div>
      
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Progress bar */}
        {!progressComplete && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Analyzing email...</div>
            <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: progressFills ? "100%" : "0%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        )}

        {/* Check items */}
        {progressComplete && (
          <div className="space-y-1.5 sm:space-y-2">
            {checks.map((check, i) => (
              <motion.div
                key={check.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: checkStates[i] ? 1 : 0, 
                  x: checkStates[i] ? 0 : -10 
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: checkStates[i] ? 1 : 0 }}
                  className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center ${
                    check.pass ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </motion.div>
                <span className="text-[10px] sm:text-xs">{check.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Score celebration */}
        {scoreCelebrate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center pt-2 sm:pt-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg font-bold">92% Score!</span>
            </motion.div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-2">
              Excellent deliverability
            </p>
          </motion.div>
        )}
      </div>
    </MockCard>
  );
};

// ===========================================
// STEP 12: Email Delivered! - Status animation
// ===========================================
export const MessagesStep12 = ({ phase = 0 }: StepProps) => {
  const emailFlies = phase > 0.1;
  const statusSent = phase > 0.25;
  const statusDelivered = phase > 0.45;
  const statusOpened = phase > 0.65;
  const clientSmiles = phase > 0.8;

  const currentStatus = statusOpened ? "opened" : statusDelivered ? "delivered" : statusSent ? "sent" : "pending";

  return (
    <MockCard className="bg-card overflow-hidden w-full relative">
      <div className="p-3 sm:p-4">
        <div className="text-center">
          <span className="text-xs sm:text-sm font-semibold">Email Journey</span>
        </div>
        
        {/* Journey visualization */}
        <div className="relative min-h-[120px] sm:min-h-[140px] mt-4 sm:mt-6">
          {/* Path line */}
          <div className="absolute top-1/2 left-6 sm:left-8 right-6 sm:right-8 h-0.5 sm:h-1 bg-muted rounded">
            <motion.div 
              className="h-full bg-primary rounded"
              initial={{ width: "0%" }}
              animate={{ 
                width: statusOpened ? "100%" : statusDelivered ? "66%" : statusSent ? "33%" : "0%" 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Email icon flying */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            initial={{ left: "0%" }}
            animate={{ 
              left: statusOpened ? "85%" : statusDelivered ? "55%" : statusSent ? "25%" : "5%"
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="h-8 w-8 sm:h-10 sm:w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
              animate={emailFlies ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          </motion.div>

          {/* Status points */}
          <div className="absolute top-1/2 left-6 sm:left-8 -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center ${
                statusSent ? "bg-green-500 text-white" : "bg-muted"
              }`}
              animate={statusSent ? { scale: [1, 1.2, 1] } : {}}
            >
              {statusSent && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            </motion.div>
            <span className="text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">Sent</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center ${
                statusDelivered ? "bg-green-500 text-white" : "bg-muted"
              }`}
              animate={statusDelivered ? { scale: [1, 1.2, 1] } : {}}
            >
              {statusDelivered && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            </motion.div>
            <span className="text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">Delivered</span>
          </div>

          <div className="absolute top-1/2 right-6 sm:right-8 -translate-y-1/2 flex flex-col items-center">
            <motion.div 
              className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center ${
                statusOpened ? "bg-purple-500 text-white" : "bg-muted"
              }`}
              animate={statusOpened ? { scale: [1, 1.2, 1] } : {}}
            >
              {statusOpened && <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            </motion.div>
            <span className="text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">Opened</span>
          </div>
        </div>

        {/* Client avatar celebration */}
        {clientSmiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-3 sm:mt-4"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/30 rounded-full">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-info flex items-center justify-center text-[9px] sm:text-xs text-white font-bold">
                SJ
              </div>
              <span className="text-[10px] sm:text-xs">Sarah opened your email!</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                🎉
              </motion.span>
            </div>
          </motion.div>
        )}
      </div>
    </MockCard>
  );
};
