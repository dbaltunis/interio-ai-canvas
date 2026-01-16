import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Crown, Clock, CheckCircle, Zap, FileText, Users, Calendar, Variable, Play } from "lucide-react";
import { motion } from "framer-motion";

const StatusCard = ({ icon: Icon, label, status, active, premium }: { icon: any; label: string; status: string; active: boolean; premium?: boolean }) => (
  <div className="border rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-full ${active ? "bg-primary/10" : "bg-muted"}`}>
        <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <span className="text-sm font-medium">{label}</span>
      {premium && <Crown className="h-3 w-3 text-amber-500" />}
    </div>
    <Badge variant={active ? "default" : "outline"} className="text-[10px]">
      {active ? <><CheckCircle className="h-3 w-3 mr-1" />{status}</> : status}
    </Badge>
  </div>
);

// Step 1: Notification capabilities overview
export const NotificationsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
        <Bell className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold text-sm">Notification Management</h4>
      <p className="text-xs text-muted-foreground">Templates, broadcasts, and automation</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <StatusCard icon={FileText} label="Templates" status="Active" active={true} />
      <StatusCard icon={Send} label="Broadcasts" status="Pro" active={false} premium />
      <StatusCard icon={Clock} label="Automation" status="Active" active={true} />
    </div>
  </div>
);

// Step 2: Premium features
export const NotificationsStep2 = () => (
  <div className="space-y-4">
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-full">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-900">Upgrade for More Features</p>
            <p className="text-xs text-amber-700 mt-1">
              Unlock broadcast messaging to send bulk notifications
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-[10px] border-amber-300">Broadcast messaging</Badge>
              <Badge variant="outline" className="text-[10px] border-amber-300">Scheduled sends</Badge>
              <Badge variant="outline" className="text-[10px] border-amber-300">Analytics</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Button className="w-full gap-2">
        <Zap className="h-4 w-4" />
        Upgrade to Pro
      </Button>
    </motion.div>
  </div>
);

// Step 3: Test notification delivery
export const NotificationsStep3 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4" />
          Test Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Send a test notification to verify your settings work correctly.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button variant="outline" size="sm" className="w-full gap-1">
              <Bell className="h-3 w-3" />
              Test Email
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button variant="outline" size="sm" className="w-full gap-1">
              <Send className="h-3 w-3" />
              Test SMS
            </Button>
          </motion.div>
        </div>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Test email sent successfully!</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  </div>
);

// Step 4: Browse message templates
export const NotificationsStep4 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Message Templates</h4>
      <Button size="sm" variant="outline">+ New Template</Button>
    </div>
    <div className="space-y-2">
      {[
        { name: "Quote Sent", trigger: "On quote creation", enabled: true },
        { name: "Quote Approved", trigger: "On client approval", enabled: true },
        { name: "Payment Reminder", trigger: "3 days before due", enabled: true },
        { name: "Installation Scheduled", trigger: "On booking", enabled: false },
      ].map((template, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 flex items-center justify-between"
          whileHover={{ x: 4 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div>
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.trigger}</p>
          </div>
          <div className={`w-10 h-5 rounded-full ${template.enabled ? "bg-primary" : "bg-muted"} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${
              template.enabled ? "right-0.5" : "left-0.5"
            }`} />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 5: Edit a template
export const NotificationsStep5 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Edit Template: Quote Sent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Subject Line</label>
          <motion.div
            className="border rounded px-3 py-2 text-sm"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Your quote from {"{{company_name}}"}
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Message Body</label>
          <div className="border rounded p-3 text-sm bg-muted/30 min-h-[80px]">
            <p>Hi {"{{client_name}}"},</p>
            <p className="mt-2">Thank you for your enquiry. Please find your quote attached.</p>
            <p className="mt-2">Quote total: {"{{quote_total}}"}</p>
          </div>
        </div>
        <Button size="sm" className="w-full">Save Template</Button>
      </CardContent>
    </Card>
  </div>
);

// Step 6: Available variables
export const NotificationsStep6 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Variable className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Template Variables</h4>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { var: "{{client_name}}", desc: "Client's name" },
        { var: "{{company_name}}", desc: "Your business" },
        { var: "{{quote_number}}", desc: "Quote ID" },
        { var: "{{quote_total}}", desc: "Total amount" },
        { var: "{{job_number}}", desc: "Job ID" },
        { var: "{{due_date}}", desc: "Payment due" },
        { var: "{{install_date}}", desc: "Installation" },
        { var: "{{staff_name}}", desc: "Assigned staff" },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="border rounded p-2 cursor-pointer hover:border-primary/50"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
        >
          <code className="text-xs font-mono text-primary">{item.var}</code>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </motion.div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Click to copy variable to clipboard
    </p>
  </div>
);

// Step 7: Send broadcast (Pro)
export const NotificationsStep7 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Send className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Broadcast Message</h4>
      <Badge variant="secondary" className="text-[10px]">
        <Crown className="h-3 w-3 mr-1" />
        Pro
      </Badge>
    </div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <Users className="h-3 w-3" />
            Recipients
          </label>
          <motion.div
            className="border rounded px-3 py-2 text-sm flex justify-between"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>All Active Clients</span>
            <Badge variant="outline" className="text-[10px]">156 clients</Badge>
          </motion.div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Subject</label>
          <div className="border rounded px-3 py-2 text-sm">Summer Sale - 20% Off All Blinds!</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Message</label>
          <div className="border rounded p-3 text-sm bg-muted/30 min-h-[60px]">
            Don't miss our biggest sale of the year...
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 8: Schedule broadcasts
export const NotificationsStep8 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-primary" />
      <h4 className="font-medium text-sm">Schedule Broadcast</h4>
    </div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Send Date</label>
            <motion.div
              className="border rounded px-3 py-2 text-sm"
              animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Jan 20, 2026
            </motion.div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Send Time</label>
            <div className="border rounded px-3 py-2 text-sm">09:00 AM</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Will be sent in 4 days at 9:00 AM AEST
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">Send Now</Button>
          <Button size="sm" className="flex-1">Schedule</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
