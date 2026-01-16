import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Hash, Package, ListChecks, Palette, Mail, Bell, FileText, Wrench, Sun, Moon, Monitor, Shield, Database, Download } from "lucide-react";
import { motion } from "framer-motion";

const MockToggle = ({ enabled, label }: { enabled: boolean; label: string }) => (
  <div className="flex items-center justify-between p-2 border rounded">
    <span className="text-sm">{label}</span>
    <div className={`w-10 h-5 rounded-full ${enabled ? "bg-primary" : "bg-muted"} relative`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${
        enabled ? "right-0.5" : "left-0.5"
      }`} />
    </div>
  </div>
);

// Step 1: System Settings sections
export const SystemStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
        <Settings className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold text-sm">System Settings</h4>
      <p className="text-xs text-muted-foreground">Configure system-wide behaviors</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { icon: ListChecks, label: "Features" },
        { icon: Hash, label: "Numbers" },
        { icon: Package, label: "Inventory" },
        { icon: Palette, label: "Appearance" },
        { icon: Mail, label: "Email" },
        { icon: Bell, label: "Alerts" },
        { icon: FileText, label: "Terms" },
        { icon: Shield, label: "Security" },
        { icon: Wrench, label: "Maintenance" },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-2 text-center hover:border-primary/50 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
        >
          <item.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-[10px] font-medium">{item.label}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 2: Enable/disable features
export const SystemStep2 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Feature Flags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <MockToggle enabled={true} label="Advanced Calculations" />
        <MockToggle enabled={true} label="Custom Reports" />
        <motion.div
          animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MockToggle enabled={false} label="AI Suggestions" />
        </motion.div>
        <MockToggle enabled={true} label="Multi-currency" />
      </CardContent>
    </Card>
    <p className="text-xs text-muted-foreground text-center">
      Toggle features on/off for your account
    </p>
  </div>
);

// Step 3: Configure number sequences
export const SystemStep3 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Number Sequences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Quote Prefix</label>
            <motion.div
              className="border rounded px-3 py-2 text-sm"
              animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              QT-
            </motion.div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Next Number</label>
            <div className="border rounded px-3 py-2 text-sm">0042</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Job Prefix</label>
            <div className="border rounded px-3 py-2 text-sm">JOB-</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Next Number</label>
            <div className="border rounded px-3 py-2 text-sm">0156</div>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="flex items-center justify-center gap-2">
      <Badge variant="outline">Preview: QT-0042</Badge>
      <Badge variant="outline">Preview: JOB-0156</Badge>
    </div>
  </div>
);

// Step 4: Reset counters
export const SystemStep4 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Reset Number Sequence</h4>
      <p className="text-xs text-muted-foreground">Start from a specific number</p>
    </div>
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Reset Quote Number To</label>
            <div className="border rounded px-3 py-2 text-sm bg-white">1000</div>
          </div>
          <p className="text-xs text-amber-700">
            Next quote will be QT-1000
          </p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Button size="sm" variant="outline" className="w-full">
              Confirm Reset
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 5: Inventory deduction settings
export const SystemStep5 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Inventory Deduction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-2">When should inventory be deducted?</p>
        {[
          { label: "On quote creation", selected: false },
          { label: "On job creation", selected: true },
          { label: "On installation complete", selected: false },
        ].map((option, i) => (
          <motion.div
            key={i}
            className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer ${
              option.selected ? "border-primary bg-primary/5" : ""
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              option.selected ? "border-primary" : "border-muted-foreground"
            }`}>
              {option.selected && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className="text-sm">{option.label}</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// Step 6: Manage custom statuses
export const SystemStep6 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Job Statuses</h4>
      <Button size="sm" variant="outline">+ Add Status</Button>
    </div>
    <div className="space-y-2">
      {[
        { name: "Quoted", color: "bg-blue-500" },
        { name: "Confirmed", color: "bg-green-500" },
        { name: "In Production", color: "bg-amber-500" },
        { name: "Ready to Install", color: "bg-purple-500" },
        { name: "Installed", color: "bg-emerald-500" },
      ].map((status, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-2 flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <span className="text-sm flex-1">{status.name}</span>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Edit</Button>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 7: Select theme
export const SystemStep7 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Sun, label: "Light", selected: false },
            { icon: Moon, label: "Dark", selected: true },
            { icon: Monitor, label: "System", selected: false },
          ].map((theme, i) => (
            <motion.div
              key={i}
              className={`border rounded-lg p-3 text-center cursor-pointer ${
                theme.selected ? "border-primary bg-primary/5" : ""
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <theme.icon className={`h-5 w-5 mx-auto mb-1 ${theme.selected ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-xs font-medium">{theme.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 8: Accent color
export const SystemStep8 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Accent Color</h4>
      <p className="text-xs text-muted-foreground">Brand your interface</p>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { color: "bg-blue-500", name: "Blue" },
        { color: "bg-purple-500", name: "Purple" },
        { color: "bg-emerald-500", name: "Emerald" },
        { color: "bg-amber-500", name: "Amber" },
        { color: "bg-rose-500", name: "Rose" },
        { color: "bg-cyan-500", name: "Cyan" },
        { color: "bg-orange-500", name: "Orange" },
        { color: "bg-slate-500", name: "Slate" },
      ].map((accent, i) => (
        <motion.div
          key={i}
          className={`border rounded-lg p-2 text-center cursor-pointer ${i === 0 ? "ring-2 ring-primary ring-offset-2" : ""}`}
          whileHover={{ scale: 1.05 }}
        >
          <div className={`w-6 h-6 rounded-full ${accent.color} mx-auto mb-1`} />
          <p className="text-[10px]">{accent.name}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 9: Compact mode
export const SystemStep9 = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Compact Mode</p>
            <p className="text-xs text-muted-foreground">Denser UI with less padding</p>
          </div>
          <motion.div
            className="w-12 h-6 rounded-full bg-muted relative cursor-pointer"
            animate={{ backgroundColor: ["hsl(var(--muted))", "hsl(var(--primary))", "hsl(var(--muted))"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: ["4px", "28px", "4px"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-2 gap-2">
      <div className="border rounded p-3 text-center">
        <p className="text-xs font-medium mb-1">Standard</p>
        <div className="space-y-2">
          <div className="bg-muted h-4 rounded" />
          <div className="bg-muted h-4 rounded" />
        </div>
      </div>
      <div className="border rounded p-2 text-center">
        <p className="text-xs font-medium mb-1">Compact</p>
        <div className="space-y-1">
          <div className="bg-muted h-3 rounded" />
          <div className="bg-muted h-3 rounded" />
          <div className="bg-muted h-3 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// Step 10: Configure email templates
export const SystemStep10 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Email Templates</h4>
    </div>
    <div className="space-y-2">
      {[
        { name: "Welcome Email", trigger: "On signup" },
        { name: "Quote Approval", trigger: "On quote sent" },
        { name: "Payment Reminder", trigger: "3 days before due" },
        { name: "Installation Scheduled", trigger: "On booking" },
      ].map((template, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 cursor-pointer"
          whileHover={{ x: 4 }}
        >
          <div>
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.trigger}</p>
          </div>
          <Button size="sm" variant="ghost">Edit</Button>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 11: Notification channels
export const SystemStep11 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <MockToggle enabled={true} label="Email notifications" />
        <MockToggle enabled={true} label="SMS alerts" />
        <MockToggle enabled={true} label="Desktop notifications" />
        <MockToggle enabled={false} label="Weekly digest" />
      </CardContent>
    </Card>
  </div>
);

// Step 12: Terms & Conditions
export const SystemStep12 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Terms & Conditions</h4>
    </div>
    <div className="border rounded-lg p-3 bg-muted/30 min-h-[100px]">
      <p className="text-xs text-muted-foreground leading-relaxed">
        1. All quotes are valid for 30 days from the date of issue.<br /><br />
        2. A 50% deposit is required upon acceptance.<br /><br />
        3. Final payment is due upon completion of installation...
      </p>
    </div>
    <Button size="sm" variant="outline" className="w-full">Edit Terms</Button>
  </div>
);

// Step 13: Privacy Policy
export const SystemStep13 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-sm">Privacy Policy</h4>
      </div>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" variant="outline" className="gap-1">
          <Download className="h-3 w-3" />
          Export PDF
        </Button>
      </motion.div>
    </div>
    <div className="border rounded-lg p-3 bg-muted/30 min-h-[80px]">
      <p className="text-xs text-muted-foreground">
        We collect and process personal data in accordance with applicable privacy laws...
      </p>
    </div>
    <Badge variant="secondary" className="text-[10px]">
      Last updated: Jan 10, 2026
    </Badge>
  </div>
);

// Step 14: Maintenance tools
export const SystemStep14 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Wrench className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">System Maintenance</h4>
    </div>
    <div className="space-y-2">
      <motion.div whileHover={{ scale: 1.01 }}>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Database className="h-4 w-4" />
          Backup Database
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.01 }}>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Download className="h-4 w-4" />
          Export All Data
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.01 }}>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Shield className="h-4 w-4" />
          Security Audit
        </Button>
      </motion.div>
    </div>
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="pt-3 pb-3">
        <p className="text-xs text-green-700">
          Last backup: 2 hours ago • All systems operational
        </p>
      </CardContent>
    </Card>
  </div>
);
