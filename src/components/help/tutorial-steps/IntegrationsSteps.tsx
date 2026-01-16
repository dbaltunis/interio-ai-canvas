import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Mail, Calendar, Database, FileSpreadsheet, Zap, CreditCard, Globe, Store, ShoppingBag, Check, X, ExternalLink, Key, RefreshCw, Lock } from "lucide-react";
import { motion } from "framer-motion";

const MockTabStrip = ({ activeTab }: { activeTab: string }) => {
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
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

const IntegrationCard = ({ icon: Icon, name, status, color }: { icon: any; name: string; status: "connected" | "available" | "coming"; color: string }) => (
  <div className="border rounded-lg p-2 flex items-center gap-2">
    <div className={`p-1.5 rounded ${color}`}>
      <Icon className="h-3.5 w-3.5 text-white" />
    </div>
    <span className="text-xs font-medium flex-1">{name}</span>
    {status === "connected" && <Check className="h-3.5 w-3.5 text-green-500" />}
    {status === "available" && <Badge variant="outline" className="text-[8px]">Available</Badge>}
    {status === "coming" && <Badge variant="secondary" className="text-[8px]">Soon</Badge>}
  </div>
);

// Step 1: Integration categories
export const IntegrationsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
        <Plug className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold text-sm">Integrations</h4>
      <p className="text-xs text-muted-foreground">Connect your tools and services</p>
    </div>
    <div className="flex items-center justify-center gap-2">
      <Badge variant="default" className="gap-1">
        <Check className="h-3 w-3" />
        3 Connected
      </Badge>
      <Badge variant="outline">7 Available</Badge>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <IntegrationCard icon={Mail} name="SendGrid" status="connected" color="bg-blue-500" />
      <IntegrationCard icon={Calendar} name="Google Cal" status="connected" color="bg-green-500" />
      <IntegrationCard icon={CreditCard} name="Stripe" status="connected" color="bg-purple-500" />
      <IntegrationCard icon={Store} name="TWC" status="available" color="bg-amber-500" />
    </div>
  </div>
);

// Step 2: Navigate integration tabs
export const IntegrationsStep2 = () => (
  <div className="space-y-4">
    <motion.div
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <MockTabStrip activeTab="email" />
    </motion.div>
    <div className="grid grid-cols-2 gap-2 mt-4">
      {[
        { label: "Email", desc: "SendGrid" },
        { label: "Calendar", desc: "Google" },
        { label: "PIM", desc: "TIG" },
        { label: "ERP", desc: "MYOB" },
        { label: "RFMS", desc: "Furnishing" },
        { label: "Payments", desc: "Stripe" },
      ].map((item, i) => (
        <div key={i} className="text-center p-2 border rounded bg-muted/30">
          <p className="text-xs font-medium">{item.label}</p>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// Step 3: Configure SendGrid
export const IntegrationsStep3 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="email" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          SendGrid Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <Key className="h-3 w-3" />
            API Key
          </label>
          <motion.div
            className="border rounded px-3 py-2 text-sm font-mono"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SG.••••••••••••••••
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">From Email</label>
          <div className="border rounded px-3 py-2 text-sm">quotes@yourbusiness.com</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">From Name</label>
          <div className="border rounded px-3 py-2 text-sm">Your Business</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 4: Connect Google Calendar
export const IntegrationsStep4 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="calendar" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button className="w-full gap-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Connect Google Account
          </Button>
        </motion.div>
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium">Sync Settings</p>
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">Two-way sync</span>
            <div className="w-10 h-5 rounded-full bg-primary relative">
              <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
            </div>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">Sync past events</span>
            <div className="w-10 h-5 rounded-full bg-muted relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 5: Connect TIG PIM
export const IntegrationsStep5 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="pim" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-500" />
          TIG Product Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">API Endpoint</label>
          <div className="border rounded px-3 py-2 text-sm font-mono text-xs">
            https://api.tig.com/v1
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">API Key</label>
          <div className="border rounded px-3 py-2 text-sm">••••••••••••</div>
        </div>
        <div className="flex items-center justify-between p-2 border rounded">
          <span className="text-sm">Auto-sync products</span>
          <div className="w-10 h-5 rounded-full bg-primary relative">
            <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 6: Connect MYOB Exo
export const IntegrationsStep6 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="erp" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-purple-500" />
          MYOB Exo Accounting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
            <span className="text-sm">Enter MYOB credentials</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
            <span className="text-sm">Authorize data access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">3</span>
            <span className="text-sm text-muted-foreground">Map chart of accounts</span>
          </div>
        </div>
        <Button className="w-full gap-2">
          Start Setup Wizard
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Step 7: Connect RFMS
export const IntegrationsStep7 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="rfms" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Store className="h-4 w-4 text-teal-500" />
          RFMS Furnishing Software
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Connect to RFMS for seamless order management and inventory sync.
        </p>
        <div className="space-y-1">
          <label className="text-xs font-medium">Company ID</label>
          <div className="border rounded px-3 py-2 text-sm">RFMS-12345</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">API Token</label>
          <div className="border rounded px-3 py-2 text-sm">••••••••••••</div>
        </div>
        <Button size="sm" variant="outline" className="w-full gap-1">
          <RefreshCw className="h-3 w-3" />
          Test Connection
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Step 8: Automation (coming soon)
export const IntegrationsStep8 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="automation" />
    <Card className="mt-4 border-dashed">
      <CardContent className="pt-6 pb-6 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <Zap className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-sm mb-1">Automation Hub</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Connect Zapier, Make, and n8n for workflow automation
        </p>
        <Badge variant="secondary">Coming Soon</Badge>
      </CardContent>
    </Card>
    <div className="grid grid-cols-3 gap-2">
      {["Zapier", "Make", "n8n"].map((tool) => (
        <div key={tool} className="border rounded-lg p-2 text-center opacity-50">
          <p className="text-xs font-medium">{tool}</p>
        </div>
      ))}
    </div>
  </div>
);

// Step 9: Connect Stripe
export const IntegrationsStep9 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="payments" />
    <Card className="mt-4 border-green-200 bg-green-50/50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="font-medium text-green-900">Stripe Connected</p>
            <p className="text-xs text-green-700">Accepting payments</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="space-y-2">
      <div className="border rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm">Webhook URL</span>
        <Badge variant="outline" className="text-[10px]">Configured</Badge>
      </div>
      <div className="border rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm">API Keys</span>
        <Badge variant="outline" className="text-[10px]">Live Mode</Badge>
      </div>
    </div>
  </div>
);

// Step 10: Website API settings
export const IntegrationsStep10 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="api" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          Website API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">API Key</label>
          <div className="border rounded px-3 py-2 text-sm font-mono flex items-center justify-between">
            <span>pk_live_••••••••</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs">Copy</Button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Webhook URL</label>
          <div className="border rounded px-3 py-2 text-xs font-mono break-all">
            https://api.yourapp.com/webhooks/website
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button size="sm" variant="outline" className="w-full gap-1">
            <RefreshCw className="h-3 w-3" />
            Regenerate Key
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  </div>
);

// Step 11: Connect TWC
export const IntegrationsStep11 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="suppliers" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Store className="h-4 w-4 text-amber-500" />
          The Window Covering (TWC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Access supplier catalogs, pricing, and auto-sync products.
        </p>
        <div className="space-y-1">
          <label className="text-xs font-medium">Dealer Code</label>
          <motion.div
            className="border rounded px-3 py-2 text-sm"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TWC-DEALER-001
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">API Token</label>
          <div className="border rounded px-3 py-2 text-sm">••••••••••••</div>
        </div>
        <Button className="w-full">Connect TWC Account</Button>
      </CardContent>
    </Card>
  </div>
);

// Step 12: Connect Shopify
export const IntegrationsStep12 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="shopify" />
    <Card className="mt-4 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-green-600" />
          Shopify
          <Badge variant="outline" className="text-[10px] gap-1">
            <Lock className="h-3 w-3" />
            Permission Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            Shopify integration requires admin approval. Contact your administrator to enable.
          </p>
        </div>
        <div className="space-y-2 opacity-50 pointer-events-none">
          <div className="space-y-1">
            <label className="text-xs font-medium">Store URL</label>
            <div className="border rounded px-3 py-2 text-sm">your-store.myshopify.com</div>
          </div>
          <Button className="w-full gap-2" disabled>
            <ExternalLink className="h-4 w-4" />
            Connect Shopify
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
