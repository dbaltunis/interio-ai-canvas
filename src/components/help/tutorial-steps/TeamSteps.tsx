import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Mail, Shield, CreditCard, Search, Clock, Check, X, Crown, Settings } from "lucide-react";
import { motion } from "framer-motion";

const MockUserRow = ({ name, email, role, status }: { name: string; email: string; role: string; status: "active" | "pending" }) => (
  <div className="border rounded-lg p-3 flex items-center gap-3">
    <Avatar className="h-9 w-9">
      <AvatarFallback className="text-xs">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{name}</p>
      <p className="text-xs text-muted-foreground truncate">{email}</p>
    </div>
    <Badge variant={status === "active" ? "default" : "secondary"} className="text-[10px]">
      {role}
    </Badge>
    {status === "pending" && (
      <Badge variant="outline" className="text-[10px]">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )}
  </div>
);

// Step 1: Team Management overview
export const TeamStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold text-sm">Team Management</h4>
      <p className="text-xs text-muted-foreground">Manage team members and permissions</p>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Card className="text-center p-3">
        <p className="text-2xl font-bold text-primary">5</p>
        <p className="text-xs text-muted-foreground">Active Members</p>
      </Card>
      <Card className="text-center p-3">
        <p className="text-2xl font-bold text-amber-500">2</p>
        <p className="text-xs text-muted-foreground">Pending</p>
      </Card>
      <Card className="text-center p-3">
        <p className="text-2xl font-bold text-muted-foreground">10</p>
        <p className="text-xs text-muted-foreground">Seat Limit</p>
      </Card>
    </div>
  </div>
);

// Step 2: View your subscription
export const TeamStep2 = () => (
  <div className="space-y-4">
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          Professional Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Seats Used</span>
            <span className="font-medium">5 of 10</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary rounded-full h-2 w-1/2" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Cost</span>
            <span className="font-medium">$249/month</span>
          </div>
        </div>
      </CardContent>
    </Card>
    <p className="text-xs text-muted-foreground text-center">
      Each additional seat is £99/month
    </p>
  </div>
);

// Step 3: Manage billing
export const TeamStep3 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Billing & Subscription</h4>
    </div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">•••• 4242</span>
          </div>
          <Badge variant="outline">Visa</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Next billing</span>
          <span>Feb 15, 2026</span>
        </div>
      </CardContent>
    </Card>
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Button variant="outline" className="w-full gap-2">
        <Settings className="h-4 w-4" />
        Manage Subscription
      </Button>
    </motion.div>
  </div>
);

// Step 4: Invite a new member
export const TeamStep4 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Team Members</h4>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </motion.div>
    </div>
    <div className="space-y-2">
      <MockUserRow name="John Smith" email="john@company.com" role="Admin" status="active" />
      <MockUserRow name="Sarah Wilson" email="sarah@company.com" role="Manager" status="active" />
    </div>
  </div>
);

// Step 5: Set member details
export const TeamStep5 = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Email Address</label>
          <div className="border rounded px-3 py-2 text-sm flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>newmember@company.com</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Full Name</label>
          <div className="border rounded px-3 py-2 text-sm">Alex Johnson</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Role</label>
          <motion.div
            className="border rounded px-3 py-2 text-sm flex items-center justify-between"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>Sales Representative</span>
            <span className="text-muted-foreground">▾</span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 6: Configure permissions
export const TeamStep6 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
      <h4 className="font-semibold text-sm">Configure Permissions</h4>
    </div>
    <div className="space-y-2">
      {[
        { perm: "View quotes", enabled: true },
        { perm: "Edit quotes", enabled: true },
        { perm: "View costs", enabled: false },
        { perm: "Manage clients", enabled: true },
        { perm: "Access reports", enabled: false },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-2 flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span className="text-sm">{item.perm}</span>
          <div className={`w-5 h-5 rounded flex items-center justify-center ${
            item.enabled ? "bg-primary text-primary-foreground" : "border-2"
          }`}>
            {item.enabled && <Check className="h-3 w-3" />}
          </div>
        </motion.div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Permissions based on selected role
    </p>
  </div>
);

// Step 7: Review billing impact
export const TeamStep7 = () => (
  <div className="space-y-4">
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-900">Billing Preview</p>
            <p className="text-xs text-amber-700 mt-1">
              Adding 1 new member to your plan
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Current monthly</span>
        <span>$249.00</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">+ New seat</span>
        <span className="text-primary">+£99.00</span>
      </div>
      <div className="border-t pt-2 flex justify-between text-sm font-medium">
        <span>New total</span>
        <span>£348.00/month</span>
      </div>
    </div>
    <Button className="w-full">Confirm & Send Invitation</Button>
  </div>
);

// Step 8: View pending invitations
export const TeamStep8 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <h4 className="font-medium text-sm">Pending Invitations</h4>
      <Badge variant="secondary">2</Badge>
    </div>
    <div className="space-y-2">
      {[
        { name: "Alex Johnson", email: "alex@company.com", sent: "2 days ago" },
        { name: "Maria Garcia", email: "maria@company.com", sent: "5 days ago" },
      ].map((invite, i) => (
        <div key={i} className="border rounded-lg p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{invite.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{invite.name}</p>
            <p className="text-xs text-muted-foreground">Sent {invite.sent}</p>
          </div>
          <div className="flex gap-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
            >
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </motion.div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Click email icon to resend invitation
    </p>
  </div>
);

// Step 9: Edit existing members
export const TeamStep9 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Edit Team Member</h4>
    </div>
    <motion.div
      className="border-2 border-primary rounded-lg p-3 flex items-center gap-3"
      animate={{ boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 4px rgba(var(--primary), 0.1)", "0 0 0 0 rgba(var(--primary), 0)"] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback>SW</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">Sarah Wilson</p>
        <p className="text-xs text-muted-foreground">sarah@company.com</p>
      </div>
      <Badge>Manager</Badge>
    </motion.div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Change Role</label>
          <div className="border rounded px-3 py-2 text-sm flex justify-between">
            <span>Manager → Admin</span>
            <span className="text-muted-foreground">▾</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">Save Changes</Button>
          <Button size="sm" variant="destructive">Remove</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 10: Search and filter
export const TeamStep10 = () => (
  <div className="space-y-4">
    <motion.div
      className="border rounded-lg px-3 py-2 flex items-center gap-2"
      animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Search by name, email, or role...</span>
    </motion.div>
    <div className="flex gap-2">
      <Badge variant="outline" className="cursor-pointer hover:bg-muted">All (7)</Badge>
      <Badge variant="default">Active (5)</Badge>
      <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pending (2)</Badge>
    </div>
    <div className="space-y-2">
      <MockUserRow name="John Smith" email="john@company.com" role="Admin" status="active" />
      <MockUserRow name="Sarah Wilson" email="sarah@company.com" role="Manager" status="active" />
      <MockUserRow name="Mike Brown" email="mike@company.com" role="Sales" status="active" />
    </div>
  </div>
);
