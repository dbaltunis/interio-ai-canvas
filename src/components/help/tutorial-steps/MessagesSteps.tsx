import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Send, Inbox, FileText, BarChart3, Settings,
  Search, Filter, Plus, MoreHorizontal, ArrowLeft,
  Clock, CheckCircle2, Eye, MousePointerClick, XCircle,
  Users, Calendar, Sparkles, Copy, Edit2, Reply, Forward,
  Archive, Trash2, MessageSquare, RefreshCw, ChevronRight,
  Zap, Shield, TrendingUp, Target, Palette
} from "lucide-react";
import { MockCard } from "../TutorialVisuals";
import { 
  DemoEmailCard, 
  DemoCampaignCard, 
  DemoEmailAnalytics, 
  DemoMiniChart,
  DemoTemplateCard 
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// MESSAGES/EMAILS TUTORIAL - 20 Steps
// Covers: Overview, Inbox, Campaigns, Templates, Analytics, Advanced
// ===========================================

// ===== SHARED COMPONENTS =====

const MockTabBar = ({ 
  activeTab = "inbox",
  highlightedTab,
}: { 
  activeTab?: "inbox" | "campaigns" | "templates" | "analytics" | "settings";
  highlightedTab?: string | null;
}) => {
  const tabs = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "campaigns", label: "Campaigns", icon: Send },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex border-b border-border/50 bg-card/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isHighlighted = highlightedTab === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              isActive 
                ? "text-foreground border-primary bg-primary/5" 
                : "text-muted-foreground border-transparent hover:text-foreground"
            } ${isHighlighted ? "ring-2 ring-primary ring-inset" : ""}`}
            animate={isHighlighted ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

const MockMessagesHeader = ({
  showCompose = true,
  composeHighlighted = false,
}: {
  showCompose?: boolean;
  composeHighlighted?: boolean;
}) => (
  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/50">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-primary/10 rounded-lg">
        <Mail className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold">Messages</span>
      <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">
        156
      </span>
    </div>
    {showCompose && (
      <motion.div
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium ${
          composeHighlighted ? "ring-2 ring-primary/50 ring-offset-2" : ""
        }`}
        animate={composeHighlighted ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: composeHighlighted ? Infinity : 0 }}
      >
        <Send className="h-3.5 w-3.5" />
        <span>Compose</span>
      </motion.div>
    )}
  </div>
);

const MockChannelFilters = ({ 
  activeChannel = "all",
  highlightedChannel,
}: { 
  activeChannel?: "all" | "email" | "whatsapp";
  highlightedChannel?: string | null;
}) => (
  <div className="flex items-center gap-2 p-2 border-b border-border">
    {[
      { id: "all", label: "All", count: 156 },
      { id: "email", label: "Email", count: 124 },
      { id: "whatsapp", label: "WhatsApp", count: 32 },
    ].map((channel) => (
      <motion.div
        key={channel.id}
        className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 ${
          activeChannel === channel.id
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        } ${highlightedChannel === channel.id ? "ring-2 ring-primary ring-offset-1" : ""}`}
        animate={highlightedChannel === channel.id ? { scale: [1, 1.1, 1] } : {}}
      >
        {channel.label}
        <span className="opacity-70">{channel.count}</span>
      </motion.div>
    ))}
  </div>
);

// Sample email data
const sampleEmails = [
  { clientName: "Sarah Johnson", subject: "Quote Follow-up", preview: "Thank you for the quote. I have a few questions...", channel: "email" as const, status: "opened" as const, timestamp: "2h ago" },
  { clientName: "Chen Industries", subject: "Order Confirmation", preview: "This is to confirm your order #P-1234...", channel: "email" as const, status: "delivered" as const, timestamp: "5h ago" },
  { clientName: "Wilson Home", subject: "Measurement Scheduled", preview: "Your appointment is confirmed for tomorrow...", channel: "whatsapp" as const, status: "sent" as const, timestamp: "1d ago" },
];

const sampleCampaigns = [
  { name: "Spring Collection Launch", subject: "New Fabrics Just Arrived!", status: "sent" as const, recipientCount: 245, openRate: 42, dateLabel: "Sent 3 days ago" },
  { name: "Quote Follow-up Series", subject: "Still interested in your project?", status: "scheduled" as const, recipientCount: 18, dateLabel: "Scheduled for tomorrow" },
  { name: "Holiday Promotion", subject: "25% Off All Curtains", status: "draft" as const, recipientCount: 0, dateLabel: "Created today" },
];

const sampleTemplates = [
  { name: "Quote Follow-up", category: "follow-up" as const, description: "Send after quote delivery to check client interest", usageCount: 45 },
  { name: "Monthly Newsletter", category: "newsletter" as const, description: "Share updates, tips, and new product arrivals", usageCount: 12, isAI: true },
  { name: "Spring Sale", category: "promotion" as const, description: "Seasonal discount announcement template", usageCount: 8 },
];

// ===========================================
// GROUP 1: PAGE OVERVIEW (Steps 1-3)
// ===========================================

export const MessagesStep1 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <MockMessagesHeader />
    <motion.div
      animate={{ opacity: phase > 0 ? 1 : 0.5 }}
      transition={{ delay: 0.3 }}
    >
      <MockTabBar activeTab="inbox" highlightedTab={phase > 0 ? "inbox" : null} />
    </motion.div>
    <div className="p-4 space-y-3">
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
        >
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Your Email Marketing Hub</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto"
        >
          Send emails, manage campaigns, use templates, and track engagement — all in one place.
        </motion.p>
      </div>
    </div>
  </MockCard>
);

export const MessagesStep2 = ({ phase = 0 }: StepProps) => {
  const [activeTab, setActiveTab] = React.useState<"inbox" | "campaigns" | "templates" | "analytics">("inbox");
  
  React.useEffect(() => {
    if (phase > 0) {
      const tabs: ("inbox" | "campaigns" | "templates" | "analytics")[] = ["inbox", "campaigns", "templates", "analytics"];
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % tabs.length;
        setActiveTab(tabs[idx]);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
      <MockMessagesHeader />
      <motion.div animate={{ scale: phase > 0 ? [1, 1.02, 1] : 1 }}>
        <MockTabBar activeTab={activeTab} highlightedTab={phase > 0 ? activeTab : null} />
      </motion.div>
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-8"
          >
            <div className="text-2xl mb-2">
              {activeTab === "inbox" && "📥"}
              {activeTab === "campaigns" && "📧"}
              {activeTab === "templates" && "📄"}
              {activeTab === "analytics" && "📊"}
            </div>
            <span className="text-sm font-medium capitalize">{activeTab}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </MockCard>
  );
};

export const MessagesStep3 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <MockMessagesHeader showCompose composeHighlighted={phase > 0} />
    <MockTabBar activeTab="inbox" />
    <div className="p-4 space-y-2">
      {sampleEmails.slice(0, 2).map((email, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: phase > 0 ? 0.3 : 1 }}
        >
          <DemoEmailCard {...email} />
        </motion.div>
      ))}
    </div>
    {phase > 0 && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg">
          <Send className="h-4 w-4" />
          <span className="text-sm font-medium">Click to compose</span>
        </div>
      </motion.div>
    )}
  </MockCard>
);

// ===========================================
// GROUP 2: INBOX FEATURES (Steps 4-7)
// ===========================================

export const MessagesStep4 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-lg mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="inbox" />
    <div className="flex h-64">
      {/* Left panel - message list */}
      <motion.div 
        className="w-2/5 border-r border-border overflow-hidden"
        animate={{ opacity: phase > 0 ? 1 : 0.7 }}
      >
        <MockChannelFilters />
        {sampleEmails.map((email, i) => (
          <motion.div
            key={i}
            animate={phase > 0 && i === 0 ? { backgroundColor: "hsl(var(--primary) / 0.05)" } : {}}
          >
            <DemoEmailCard {...email} selected={i === 0} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Right panel - detail view */}
      <motion.div 
        className="flex-1 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0 ? 1 : 0.5 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Quote Follow-up</h3>
            <span className="text-[10px] text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>To: Sarah Johnson</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-purple-500">
              <Eye className="h-3 w-3" /> Opened
            </span>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
            Thank you for the quote. I have a few questions about the fabric options...
          </div>
        </div>
      </motion.div>
    </div>
  </MockCard>
);

export const MessagesStep5 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="inbox" />
    <MockChannelFilters 
      activeChannel={phase > 0 ? "email" : "all"} 
      highlightedChannel={phase > 0 ? "email" : null}
    />
    <div className="p-2 space-y-1">
      {sampleEmails
        .filter((e, i) => phase === 0 || e.channel === "email")
        .map((email, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            layout
          >
            <DemoEmailCard {...email} />
          </motion.div>
        ))}
    </div>
  </MockCard>
);

export const MessagesStep6 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="flex items-center gap-2 p-3 border-b border-border">
      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Quote Follow-up</span>
    </div>
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-info flex items-center justify-center text-primary-foreground text-xs font-semibold">
            SJ
          </div>
          <div>
            <p className="text-sm font-medium">Sarah Johnson</p>
            <p className="text-[10px] text-muted-foreground">sarah@example.com</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
      </div>

      {/* Tracking stats */}
      <motion.div 
        className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
        animate={phase > 0 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.5, repeat: phase > 0 ? 2 : 0 }}
      >
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Delivered</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-purple-500">
          <Eye className="h-3.5 w-3.5" />
          <span>Opened 3x</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <MousePointerClick className="h-3.5 w-3.5" />
          <span>1 click</span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="text-xs text-muted-foreground space-y-2">
        <p>Hi Sarah,</p>
        <p>Thank you for your interest in our window treatments. Attached is your quote for the Living Room curtains...</p>
      </div>
    </div>
  </MockCard>
);

export const MessagesStep7 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto relative">
    <div className="flex items-center justify-between p-3 border-b border-border">
      <div className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Quote Follow-up</span>
      </div>
      <motion.div
        animate={phase > 0 ? { scale: [1, 1.1, 1] } : {}}
        className="relative"
      >
        <MoreHorizontal className="h-4 w-4" />
      </motion.div>
    </div>
    
    {/* Dropdown menu */}
    <AnimatePresence>
      {phase > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-12 right-3 w-40 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden"
        >
          {[
            { icon: Reply, label: "Reply" },
            { icon: Forward, label: "Forward" },
            { icon: Copy, label: "Copy Content" },
            { icon: Archive, label: "Archive" },
            { icon: Trash2, label: "Delete", danger: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted cursor-pointer ${
                item.danger ? "text-destructive" : ""
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>

    <div className="p-4 text-xs text-muted-foreground opacity-50">
      <p>Email content preview...</p>
    </div>
  </MockCard>
);

// ===========================================
// GROUP 3: CAMPAIGNS (Steps 8-11)
// ===========================================

export const MessagesStep8 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-lg mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="campaigns" highlightedTab={phase > 0 ? "campaigns" : null} />
    <div className="p-4 grid grid-cols-2 gap-3">
      {sampleCampaigns.map((campaign, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <DemoCampaignCard {...campaign} highlighted={phase > 0 && i === 0} />
        </motion.div>
      ))}
    </div>
  </MockCard>
);

export const MessagesStep9 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-semibold mb-3">Quick Start Templates</h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Mail, label: "Newsletter", color: "bg-purple-100 text-purple-600" },
          { icon: Clock, label: "Follow-up", color: "bg-blue-100 text-blue-600" },
          { icon: Target, label: "Promotion", color: "bg-orange-100 text-orange-600" },
        ].map((tpl, i) => (
          <motion.div
            key={tpl.label}
            className={`p-3 rounded-lg text-center ${tpl.color} cursor-pointer`}
            animate={phase > 0 && i === 1 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.4, repeat: phase > 0 ? Infinity : 0 }}
          >
            <tpl.icon className="h-5 w-5 mx-auto mb-1" />
            <span className="text-[10px] font-medium">{tpl.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
    <div className="p-4">
      <p className="text-xs text-muted-foreground text-center">
        Choose a template to start your campaign quickly
      </p>
    </div>
  </MockCard>
);

export const MessagesStep10 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-semibold">Create Campaign</h3>
    </div>
    <div className="p-4 space-y-4">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {["Details", "Recipients", "Content", "Review"].map((step, i) => (
          <div key={step} className="flex items-center">
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                i === 0 ? "bg-primary text-primary-foreground" :
                i === 1 && phase > 0 ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}
              animate={phase > 0 && i === 1 ? { scale: [1, 1.2, 1] } : {}}
            >
              {i + 1}
            </motion.div>
            {i < 3 && <div className="w-8 h-0.5 bg-muted mx-1" />}
          </div>
        ))}
      </div>

      {/* Form preview */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground">Campaign Name</label>
          <div className="h-8 bg-muted/50 rounded border border-border mt-1 flex items-center px-2 text-xs">
            Spring Collection Launch
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Subject Line</label>
          <div className="h-8 bg-muted/50 rounded border border-border mt-1 flex items-center px-2 text-xs">
            New Fabrics Just Arrived!
          </div>
        </div>
      </div>
    </div>
  </MockCard>
);

export const MessagesStep11 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="campaigns" />
    <div className="flex items-center gap-2 p-3 border-b border-border">
      {["All", "Draft", "Scheduled", "Sent"].map((filter, i) => (
        <motion.div
          key={filter}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
            (phase === 0 && i === 0) || (phase > 0 && i === 3)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          animate={phase > 0 && i === 3 ? { scale: [1, 1.1, 1] } : {}}
        >
          {filter}
        </motion.div>
      ))}
    </div>
    <div className="p-3">
      <DemoCampaignCard {...sampleCampaigns[0]} highlighted={phase > 0} />
    </div>
  </MockCard>
);

// ===========================================
// GROUP 4: TEMPLATES (Steps 12-14)
// ===========================================

export const MessagesStep12 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-lg mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="templates" highlightedTab={phase > 0 ? "templates" : null} />
    <div className="p-4 grid grid-cols-3 gap-3">
      {sampleTemplates.map((template, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <DemoTemplateCard {...template} highlighted={phase > 0 && i === 0} />
        </motion.div>
      ))}
    </div>
  </MockCard>
);

export const MessagesStep13 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold">AI-Powered Templates</h3>
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[
        { name: "Smart Follow-up", desc: "AI generates personalized follow-ups based on quote details" },
        { name: "Project Update", desc: "Automated status updates tailored to each project" },
      ].map((tpl, i) => (
        <motion.div
          key={tpl.name}
          className="p-3 border border-border rounded-lg"
          animate={phase > 0 && i === 0 ? { 
            borderColor: "hsl(var(--primary))",
            boxShadow: "0 0 0 2px hsl(var(--primary) / 0.2)"
          } : {}}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{tpl.name}</span>
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] rounded font-medium">
              AI
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">{tpl.desc}</p>
        </motion.div>
      ))}
    </div>
  </MockCard>
);

export const MessagesStep14 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4">
      <DemoTemplateCard 
        name="Quote Follow-up" 
        category="follow-up" 
        description="Send after quote delivery to check client interest"
        usageCount={45}
        highlighted={phase > 0}
      />
    </div>
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2">
        <motion.div
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
          animate={phase > 0 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.4, repeat: phase > 0 ? Infinity : 0 }}
        >
          <Send className="h-3.5 w-3.5" />
          Use Template
        </motion.div>
        <div className="flex items-center justify-center gap-1 py-2 px-3 border border-border rounded-lg text-xs">
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </div>
      </div>
    </div>
  </MockCard>
);

// ===========================================
// GROUP 5: ANALYTICS (Steps 15-17)
// ===========================================

export const MessagesStep15 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-lg mx-auto">
    <MockMessagesHeader />
    <MockTabBar activeTab="analytics" highlightedTab={phase > 0 ? "analytics" : null} />
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DemoEmailAnalytics highlightedCard={phase > 0 ? "opened" : undefined} />
      </motion.div>
    </div>
  </MockCard>
);

export const MessagesStep16 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4">
      <DemoMiniChart highlighted={phase > 0} />
    </div>
  </MockCard>
);

export const MessagesStep17 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-semibold">Campaign Comparison</h3>
    </div>
    <div className="p-4">
      <div className="space-y-3">
        {[
          { name: "Spring Launch", openRate: 42, clickRate: 18 },
          { name: "Holiday Sale", openRate: 38, clickRate: 22 },
          { name: "Newsletter #5", openRate: 31, clickRate: 12 },
        ].map((campaign, i) => (
          <motion.div
            key={campaign.name}
            className="flex items-center gap-3"
            animate={phase > 0 && i === 0 ? { scale: [1, 1.02, 1] } : {}}
          >
            <span className="text-xs w-24 truncate">{campaign.name}</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${campaign.openRate}%` }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              />
              <motion.div
                className="h-full bg-primary/50"
                initial={{ width: 0 }}
                animate={{ width: `${campaign.clickRate}%` }}
                transition={{ delay: i * 0.2 + 0.2, duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground w-12">
              {campaign.openRate}%
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>Open Rate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary/50 rounded" />
          <span>Click Rate</span>
        </div>
      </div>
    </div>
  </MockCard>
);

// ===========================================
// GROUP 6: ADVANCED (Steps 18-20)
// ===========================================

export const MessagesStep18 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-semibold">Personalization Tokens</h3>
    </div>
    <div className="p-4 space-y-3">
      <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3 font-mono">
        <p>Hi <motion.span 
          className="text-primary font-semibold"
          animate={phase > 0 ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >{"{{client_name}}"}</motion.span>,</p>
        <p className="mt-2">Your quote for <motion.span 
          className="text-primary font-semibold"
          animate={phase > 0 ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        >{"{{project_name}}"}</motion.span> is ready...</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["{{client_name}}", "{{project_name}}", "{{quote_total}}", "{{due_date}}"].map((token) => (
          <span key={token} className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded font-mono">
            {token}
          </span>
        ))}
      </div>
    </div>
  </MockCard>
);

export const MessagesStep19 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold">AI Writing Assistant</h3>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-8 bg-muted/50 rounded border border-border flex items-center px-2 text-xs text-muted-foreground">
        Write a follow-up email for overdue quotes...
      </div>
      <motion.div
        className="flex items-center gap-2 justify-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium"
        animate={phase > 0 ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 0.5, repeat: phase > 0 ? Infinity : 0 }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate with AI
      </motion.div>
      {phase > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-muted-foreground bg-muted/30 rounded p-3"
        >
          <p className="mb-2 font-medium text-foreground">Generated content:</p>
          <p>Hi Sarah, I hope this email finds you well. I wanted to follow up on the quote we sent last week...</p>
        </motion.div>
      )}
    </div>
  </MockCard>
);

export const MessagesStep20 = ({ phase = 0 }: StepProps) => (
  <MockCard className="bg-card overflow-hidden max-w-md mx-auto">
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-green-500" />
        <h3 className="text-sm font-semibold">Spam Check</h3>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <motion.div
        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        animate={phase > 0 ? { scale: [1, 1.02, 1] } : {}}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Good deliverability score
          </span>
        </div>
        <span className="text-lg font-bold text-green-600">92%</span>
      </motion.div>
      
      <div className="space-y-2">
        {[
          { check: "Subject line length", pass: true },
          { check: "No spam trigger words", pass: true },
          { check: "Image-to-text ratio", pass: true },
          { check: "Unsubscribe link present", pass: false },
        ].map((item, i) => (
          <div key={item.check} className="flex items-center gap-2 text-xs">
            {item.pass ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-orange-500" />
            )}
            <span className={item.pass ? "text-muted-foreground" : "text-orange-600"}>
              {item.check}
            </span>
          </div>
        ))}
      </div>
    </div>
  </MockCard>
);
