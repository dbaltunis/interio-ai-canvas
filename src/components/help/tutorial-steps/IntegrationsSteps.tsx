import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plug, Mail, Calendar, Database, FileSpreadsheet, Zap, CreditCard, 
  Globe, Store, ShoppingBag, Check, ExternalLink, Key, RefreshCw, Lock 
} from "lucide-react";
import {
  AnimatedMockButton,
  AnimatedMockInput,
  AnimatedMockToggle,
  AnimatedSuccessToast,
  AnimatedMockCard,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// INTEGRATIONS TUTORIAL - 12 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Animated tab strip
const AnimatedTabStrip = ({ activeTab, phase }: { activeTab: string; phase: number }) => {
  const tabs = [
    { id: "email", label: "Email" },
    { id: "calendar", label: "Calendar" },
    { id: "pim", label: "PIM" },
    { id: "erp", label: "ERP" },
    { id: "rfms", label: "RFMS" },
    { id: "automation", label: "Auto" },
    { id: "payments", label: "Payments" },
    { id: "api", label: "API" },
    { id: "suppliers", label: "Suppliers" },
    { id: "shopify", label: "Shopify" },
  ];

  return (
    <motion.div 
      className="flex gap-1 overflow-x-auto pb-1"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: phase > 0.1 ? 1 : 0, y: phase > 0.1 ? 0 : -5 }}
    >
      {tabs.map((tab, i) => (
        <motion.div
          key={tab.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: phase > 0.15 + i * 0.02 ? 1 : 0, scale: phase > 0.15 + i * 0.02 ? 1 : 0.9 }}
          className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {tab.label}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated integration card
const AnimatedIntegrationCard = ({ 
  icon: Icon, 
  name, 
  status, 
  color,
  phase,
  revealPhase = 0.3
}: { 
  icon: React.ElementType; 
  name: string; 
  status: "connected" | "available" | "coming";
  color: string;
  phase: number;
  revealPhase?: number;
}) => {
  const isVisible = phase >= revealPhase;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
      className="border rounded-lg p-2 flex items-center gap-2"
    >
      <motion.div 
        className={`p-1.5 rounded ${color}`}
        animate={isVisible && status === "connected" ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </motion.div>
      <span className="text-xs font-medium flex-1">{name}</span>
      {status === "connected" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: isVisible ? 1 : 0 }}
          transition={{ delay: 0.2 }}
        >
          <Check className="h-3.5 w-3.5 text-green-500" />
        </motion.div>
      )}
      {status === "available" && (
        <span className="px-1.5 py-0.5 border rounded text-[8px]">Available</span>
      )}
      {status === "coming" && (
        <span className="px-1.5 py-0.5 bg-secondary rounded text-[8px]">Soon</span>
      )}
    </motion.div>
  );
};

// Step 1: Integration categories
export const IntegrationsStep1 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0, y: phase > 0.1 ? 0 : -10 }}
      >
        <motion.div 
          className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2"
          animate={phase > 0.15 ? { scale: [0.8, 1.1, 1] } : {}}
        >
          <Plug className="h-6 w-6 text-primary" />
        </motion.div>
        <h4 className="font-semibold text-sm">Integrations</h4>
        <p className="text-xs text-muted-foreground">Connect your tools and services</p>
      </motion.div>
      <motion.div 
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.3 ? 1 : 0 }}
      >
        <motion.span 
          className="flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs"
          animate={phase > 0.35 ? { scale: [1, 1.1, 1] } : {}}
        >
          <Check className="h-3 w-3" />
          3 Connected
        </motion.span>
        <span className="px-2 py-0.5 border rounded text-xs">7 Available</span>
      </motion.div>
      <div className="grid grid-cols-2 gap-2">
        <AnimatedIntegrationCard icon={Mail} name="SendGrid" status="connected" color="bg-blue-500" phase={phase} revealPhase={0.4} />
        <AnimatedIntegrationCard icon={Calendar} name="Google Cal" status="connected" color="bg-green-500" phase={phase} revealPhase={0.5} />
        <AnimatedIntegrationCard icon={CreditCard} name="Stripe" status="connected" color="bg-purple-500" phase={phase} revealPhase={0.6} />
        <AnimatedIntegrationCard icon={Store} name="TWC" status="available" color="bg-amber-500" phase={phase} revealPhase={0.7} />
      </div>
    </div>
  );
};

// Step 2: Navigate integration tabs
export const IntegrationsStep2 = ({ phase = 0 }: StepProps) => {
  const items = [
    { label: "Email", desc: "SendGrid" },
    { label: "Calendar", desc: "Google" },
    { label: "PIM", desc: "TIG" },
    { label: "ERP", desc: "MYOB" },
    { label: "RFMS", desc: "Flooring" },
    { label: "Payments", desc: "Stripe" },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        animate={phase > 0.2 && phase < 0.5 ? { opacity: [1, 0.7, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AnimatedTabStrip activeTab="email" phase={phase} />
      </motion.div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {items.map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: phase > 0.3 + i * 0.08 ? 1 : 0, y: phase > 0.3 + i * 0.08 ? 0 : 5 }}
            className="text-center p-2 border rounded bg-muted/30"
          >
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 3: Configure SendGrid
export const IntegrationsStep3 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="email" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">SendGrid Email</span>
        </div>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="API Key" 
            value="SG.••••••••••••••••" 
            icon={Key}
            phase={phase}
            startPhase={0.3}
            endPhase={0.5}
          />
          <AnimatedMockInput 
            label="From Email" 
            value="quotes@yourbusiness.com" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.7}
          />
          <AnimatedMockInput 
            label="From Name" 
            value="Your Business" 
            phase={phase}
            startPhase={0.7}
            endPhase={0.85}
          />
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="SendGrid configured!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 4: Connect Google Calendar
export const IntegrationsStep4 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="calendar" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Google Calendar</span>
        </div>
        <div className="space-y-3">
          <AnimatedMockButton 
            phase={phase} 
            clickPhase={0.45}
            highlight={phase > 0.3 && phase < 0.6}
          >
            Connect Google Account
          </AnimatedMockButton>
          <motion.div 
            className="space-y-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.5 ? 1 : 0 }}
          >
            <p className="text-xs font-medium">Sync Settings</p>
            <AnimatedMockToggle 
              label="Two-way sync" 
              checked={false}
              phase={phase}
              flipPhase={0.6}
            />
            <AnimatedMockToggle 
              label="Sync past events" 
              checked={false}
              phase={phase}
              flipPhase={0.75}
            />
          </motion.div>
        </div>
      </AnimatedMockCard>
    </div>
  );
};

// Step 5: Connect TIG PIM
export const IntegrationsStep5 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="pim" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium">TIG Product Information</span>
        </div>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="API Endpoint" 
            value="https://api.tig.com/v1" 
            phase={phase}
            startPhase={0.25}
            endPhase={0.45}
          />
          <AnimatedMockInput 
            label="API Key" 
            value="••••••••••••" 
            phase={phase}
            startPhase={0.45}
            endPhase={0.65}
          />
          <AnimatedMockToggle 
            label="Auto-sync products" 
            checked={false}
            phase={phase}
            flipPhase={0.7}
          />
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="TIG connected!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 6: Connect MYOB Exo
export const IntegrationsStep6 = ({ phase = 0 }: StepProps) => {
  const steps = [
    { num: 1, text: "Enter MYOB credentials", done: true },
    { num: 2, text: "Authorize data access", done: true },
    { num: 3, text: "Map chart of accounts", done: false },
  ];

  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="erp" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">MYOB Exo Accounting</span>
        </div>
        <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
          {steps.map((step, i) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: phase > 0.3 + i * 0.15 ? 1 : 0, x: phase > 0.3 + i * 0.15 ? 0 : -10 }}
              className="flex items-center gap-2"
            >
              <motion.span 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step.done ? "bg-purple-500 text-white" : "bg-muted text-muted-foreground"
                }`}
                animate={step.done && phase > 0.4 + i * 0.15 ? { scale: [1, 1.2, 1] } : {}}
              >
                {step.num}
              </motion.span>
              <span className={`text-sm ${step.done ? "" : "text-muted-foreground"}`}>{step.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-3">
          <AnimatedMockButton phase={phase} clickPhase={0.8} highlight={phase > 0.7}>
            Start Setup Wizard
          </AnimatedMockButton>
        </div>
      </AnimatedMockCard>
    </div>
  );
};

// Step 7: Connect RFMS
export const IntegrationsStep7 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="rfms" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Store className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-medium">RFMS Flooring Software</span>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.25 ? 1 : 0 }}
        >
          Connect to RFMS for flooring software integration and order management.
        </motion.p>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Company ID" 
            value="RFMS-12345" 
            phase={phase}
            startPhase={0.3}
            endPhase={0.5}
          />
          <AnimatedMockInput 
            label="API Token" 
            value="••••••••••••" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.7}
          />
          <AnimatedMockButton 
            phase={phase} 
            variant="outline" 
            size="sm"
            clickPhase={0.8}
            highlight={phase > 0.7}
            icon={RefreshCw}
          >
            Test Connection
          </AnimatedMockButton>
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="Connection successful!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 8: Automation (coming soon)
export const IntegrationsStep8 = ({ phase = 0 }: StepProps) => {
  const tools = ["Zapier", "Make", "n8n"];

  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="automation" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2} className="border-dashed">
        <motion.div 
          className="text-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.25 ? 1 : 0 }}
        >
          <motion.div 
            className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3"
            animate={phase > 0.3 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="h-6 w-6 text-muted-foreground" />
          </motion.div>
          <h4 className="font-medium text-sm mb-1">Automation Hub</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Connect Zapier, Make, and n8n for workflow automation
          </p>
          <motion.span 
            className="px-2 py-0.5 bg-secondary rounded text-xs"
            animate={phase > 0.5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Coming Soon
          </motion.span>
        </motion.div>
      </AnimatedMockCard>
      <div className="grid grid-cols-3 gap-2">
        {tools.map((tool, i) => (
          <motion.div 
            key={tool}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: phase > 0.6 + i * 0.1 ? 0.5 : 0, y: phase > 0.6 + i * 0.1 ? 0 : 5 }}
            className="border rounded-lg p-2 text-center"
          >
            <p className="text-xs font-medium">{tool}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 9: Connect Stripe
export const IntegrationsStep9 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="payments" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2} className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
            animate={phase > 0.3 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Check className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">Stripe Connected</p>
            <p className="text-xs text-green-700 dark:text-green-300">Accepting payments</p>
          </div>
        </div>
      </AnimatedMockCard>
      <div className="space-y-2">
        {[
          { label: "Webhook URL", status: "Configured" },
          { label: "API Keys", status: "Live Mode" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.5 + i * 0.15 ? 1 : 0, x: phase > 0.5 + i * 0.15 ? 0 : -10 }}
            className="border rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-sm">{item.label}</span>
            <span className="px-1.5 py-0.5 border rounded text-[10px]">{item.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 10: Website API settings
export const IntegrationsStep10 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="api" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Website API</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">API Key</label>
            <motion.div 
              className="border rounded px-3 py-2 text-sm font-mono flex items-center justify-between"
              animate={phase > 0.3 && phase < 0.5 ? { borderColor: "hsl(var(--primary))" } : {}}
            >
              <span>pk_live_••••••••</span>
              <AnimatedMockButton phase={phase} variant="outline" size="sm">
                Copy
              </AnimatedMockButton>
            </motion.div>
          </div>
          <AnimatedMockInput 
            label="Webhook URL" 
            value="https://api.yourapp.com/webhooks/website" 
            phase={phase}
            startPhase={0.4}
            endPhase={0.65}
          />
          <AnimatedMockButton 
            phase={phase} 
            variant="outline" 
            size="sm"
            clickPhase={0.8}
            highlight={phase > 0.7}
            icon={RefreshCw}
          >
            Regenerate Key
          </AnimatedMockButton>
        </div>
      </AnimatedMockCard>
    </div>
  );
};

// Step 11: Connect TWC
export const IntegrationsStep11 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="suppliers" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="flex items-center gap-2 mb-3">
          <Store className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">The Window Covering (TWC)</span>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.25 ? 1 : 0 }}
        >
          Access supplier catalogs, pricing, and auto-sync products.
        </motion.p>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Dealer Code" 
            value="TWC-DEALER-001" 
            phase={phase}
            startPhase={0.3}
            endPhase={0.5}
          />
          <AnimatedMockInput 
            label="API Token" 
            value="••••••••••••" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.7}
          />
          <AnimatedMockButton 
            phase={phase} 
            clickPhase={0.8}
            highlight={phase > 0.7}
          >
            Connect TWC Account
          </AnimatedMockButton>
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="TWC connected successfully!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 12: Connect Shopify
export const IntegrationsStep12 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedTabStrip activeTab="shopify" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.2} className="border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Shopify</span>
          <motion.span 
            className="flex items-center gap-1 px-1.5 py-0.5 border rounded text-[10px]"
            animate={phase > 0.3 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Lock className="h-3 w-3" />
            Permission Required
          </motion.span>
        </div>
        <motion.div 
          className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.35 ? 1 : 0 }}
        >
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Shopify integration requires admin approval. Contact your administrator to enable.
          </p>
        </motion.div>
        <motion.div 
          className="space-y-2 opacity-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.5 ? 0.5 : 0 }}
        >
          <div className="space-y-1">
            <label className="text-xs font-medium">Store URL</label>
            <div className="border rounded px-3 py-2 text-sm">your-store.myshopify.com</div>
          </div>
          <AnimatedMockButton phase={phase} icon={ExternalLink}>
            Connect Shopify
          </AnimatedMockButton>
        </motion.div>
      </AnimatedMockCard>
    </div>
  );
};
