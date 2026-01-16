import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Check, X, Key, User, AtSign, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const MockTabStrip = ({ activeTab }: { activeTab: string }) => (
  <div className="border rounded-lg p-1 bg-muted/50 flex gap-1">
    {[
      { id: "email", label: "Email", icon: Mail },
      { id: "sms", label: "SMS", icon: Phone },
      { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    ].map((tab) => (
      <div
        key={tab.id}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1 justify-center ${
          activeTab === tab.id
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        <tab.icon className="h-3.5 w-3.5" />
        {tab.label}
      </div>
    ))}
  </div>
);

const StatusCard = ({ icon: Icon, label, status, color }: { icon: any; label: string; status: string; color: string }) => (
  <div className="border rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-full ${color}`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <Badge variant="outline" className="text-[10px]">{status}</Badge>
  </div>
);

// Step 1: Communication channels status
export const CommunicationsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <h4 className="font-semibold text-sm">Communication Channels</h4>
      <p className="text-xs text-muted-foreground">Configure how you reach clients</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <StatusCard icon={Mail} label="Email" status="Included" color="bg-blue-500" />
      <StatusCard icon={Phone} label="SMS" status="Optional" color="bg-green-500" />
      <StatusCard icon={MessageSquare} label="WhatsApp" status="Optional" color="bg-emerald-500" />
    </div>
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="pt-3 pb-3">
        <p className="text-xs text-blue-700">
          Email is included. SMS & WhatsApp require Twilio integration.
        </p>
      </CardContent>
    </Card>
  </div>
);

// Step 2: Navigate 3 tabs
export const CommunicationsStep2 = () => (
  <div className="space-y-4">
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <MockTabStrip activeTab="email" />
    </motion.div>
    <div className="grid grid-cols-3 gap-2 mt-4">
      {[
        { tab: "Email", desc: "Sender settings & signature" },
        { tab: "SMS", desc: "Twilio integration" },
        { tab: "WhatsApp", desc: "Business messaging" },
      ].map((item, i) => (
        <div key={i} className="text-center p-2 border rounded bg-muted/30">
          <p className="text-xs font-medium">{item.tab}</p>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// Step 3: Shared vs Custom email
export const CommunicationsStep3 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="email" />
    <div className="space-y-3 mt-4">
      <motion.div
        className="border-2 border-primary rounded-lg p-3"
        animate={{ boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 4px rgba(var(--primary), 0.1)", "0 0 0 0 rgba(var(--primary), 0)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-medium">Shared Email (Included)</span>
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          Emails sent from noreply@yourapp.com
        </p>
      </motion.div>
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
          <span className="text-sm font-medium">Custom Email (SendGrid)</span>
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          Send from your own domain
        </p>
      </div>
    </div>
  </div>
);

// Step 4: Configure sender details
export const CommunicationsStep4 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sender Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <AtSign className="h-3 w-3" />
            From Address
          </label>
          <motion.div
            className="border rounded px-3 py-2 text-sm"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            quotes@yourbusiness.com
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <User className="h-3 w-3" />
            From Name
          </label>
          <div className="border rounded px-3 py-2 text-sm">Your Business Name</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Reply-To</label>
          <div className="border rounded px-3 py-2 text-sm">info@yourbusiness.com</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 5: Email signature
export const CommunicationsStep5 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Email Signature</h4>
    </div>
    <div className="border rounded-lg p-3 bg-muted/30 min-h-[100px]">
      <p className="text-sm">Best regards,</p>
      <p className="text-sm font-medium mt-2">John Smith</p>
      <p className="text-xs text-muted-foreground">Sales Manager</p>
      <p className="text-xs text-muted-foreground">Your Business | (02) 1234 5678</p>
      <div className="mt-2 pt-2 border-t">
        <p className="text-[10px] text-muted-foreground italic">
          This email and any attachments are confidential...
        </p>
      </div>
    </div>
    <Button size="sm" variant="outline" className="w-full">Edit Signature</Button>
  </div>
);

// Step 6: Connect Twilio
export const CommunicationsStep6 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="sms" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Twilio SMS Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <Key className="h-3 w-3" />
            Account SID
          </label>
          <motion.div
            className="border rounded px-3 py-2 text-sm"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AC••••••••••••••••••••••
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Auth Token</label>
          <div className="border rounded px-3 py-2 text-sm">••••••••••••••••</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Phone Number</label>
          <div className="border rounded px-3 py-2 text-sm">+61 400 000 000</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 7: SMS status indicator
export const CommunicationsStep7 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">SMS Connection Status</h4>
    </div>
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="font-medium text-green-900">Connected</p>
            <p className="text-xs text-green-700">Twilio SMS ready to use</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="flex-1">Send Test SMS</Button>
      <Button size="sm" variant="outline" className="flex-1">View Logs</Button>
    </div>
  </div>
);

// Step 8: Connect WhatsApp via Twilio
export const CommunicationsStep8 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="whatsapp" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-500" />
          WhatsApp Business Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Connect your WhatsApp Business account via Twilio for messaging.
        </p>
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
            <span className="text-sm">Create Twilio account</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
            <span className="text-sm">Enable WhatsApp sandbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">3</span>
            <span className="text-sm text-muted-foreground">Connect to your business</span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Button size="sm" className="w-full gap-1">
            <ExternalLink className="h-3 w-3" />
            Open Twilio Setup
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  </div>
);

// Step 9: Verify WhatsApp connection
export const CommunicationsStep9 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">WhatsApp Verification</h4>
    </div>
    <div className="space-y-3">
      <div className="border rounded-lg p-3 flex items-center gap-3">
        <motion.div
          className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Check className="h-4 w-4 text-white" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium">Business Verified</p>
          <p className="text-xs text-muted-foreground">Your Business Name</p>
        </div>
        <Badge variant="default" className="bg-emerald-500">Active</Badge>
      </div>
      <div className="border rounded-lg p-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          <Phone className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">WhatsApp Number</p>
          <p className="text-xs text-muted-foreground">+61 400 000 000</p>
        </div>
      </div>
    </div>
    <Button size="sm" variant="outline" className="w-full">Send Test Message</Button>
  </div>
);

// Step 10: Manage message templates
export const CommunicationsStep10 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">WhatsApp Templates</h4>
      <Button size="sm" variant="outline">+ New Template</Button>
    </div>
    <div className="space-y-2">
      {[
        { name: "Quote Sent", status: "approved" },
        { name: "Appointment Reminder", status: "approved" },
        { name: "Installation Complete", status: "pending" },
      ].map((template, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 flex items-center justify-between"
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <span className="text-sm">{template.name}</span>
          </div>
          <Badge variant={template.status === "approved" ? "default" : "secondary"} className="text-[10px]">
            {template.status}
          </Badge>
        </motion.div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      WhatsApp requires template approval before use
    </p>
  </div>
);
